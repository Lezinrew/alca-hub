# Gerenciador de Chat - Alça Hub
import asyncio
import json
import uuid
from typing import Dict, List, Optional, Set, Tuple
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import WebSocket, WebSocketDisconnect
import logging

from .models import (
    MessageCreate,
    MessageResponse,
    ChatRoomCreate,
    ChatRoomResponse,
    MessageType,
    MessageStatus,
    ChatRoomType,
    TypingIndicator,
    ChatStats,
    MessageSearch
)

logger = logging.getLogger(__name__)


class ChatManager:
    """Gerenciador de chat em tempo real."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.typing_users: Dict[str, Set[str]] = {}  # room_id -> set of user_ids
        self.connection_cleanup_task = None
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Iniciar tarefa de limpeza de conexões."""
        if not self.connection_cleanup_task:
            self.connection_cleanup_task = asyncio.create_task(self._cleanup_connections())
    
    async def _cleanup_connections(self):
        """Limpar conexões inativas periodicamente."""
        while True:
            try:
                await asyncio.sleep(30)
                await self._remove_inactive_connections()
            except Exception as e:
                logger.error(f"Erro na limpeza de conexões: {e}")
    
    async def _remove_inactive_connections(self):
        """Remover conexões inativas."""
        for user_id, connections in self.active_connections.items():
            active_connections = set()
            for connection in connections:
                try:
                    await connection.ping()
                    active_connections.add(connection)
                except:
                    pass
            
            if active_connections:
                self.active_connections[user_id] = active_connections
            else:
                del self.active_connections[user_id]
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Conectar usuário ao sistema de chat."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"Usuário {user_id} conectado ao chat")
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Desconectar usuário do sistema de chat."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        logger.info(f"Usuário {user_id} desconectado do chat")
    
    async def create_room(self, room_data: ChatRoomCreate) -> str:
        """Criar nova sala de chat."""
        try:
            # Preferir ID retornado pelo banco se disponível
            result = await self.db.chat_rooms.insert_one({
                "name": room_data.name,
                "type": room_data.type.value,
                "participants": room_data.participants,
                "metadata": room_data.metadata or {},
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            room_id = getattr(result, "inserted_id", None) or str(uuid.uuid4())
            # Garantir que documento existe com o _id final
            await self.db.chat_rooms.update_one({"_id": room_id}, {"$set": {"_id": room_id}}, upsert=True)
            logger.info(f"Sala de chat {room_id} criada")
            return room_id
            
        except Exception as e:
            logger.error(f"Erro ao criar sala: {e}")
            raise
    
    async def get_user_rooms(self, user_id: str, limit: int = 50) -> List[ChatRoomResponse]:
        """Obter salas de chat do usuário."""
        try:
            # Buscar salas onde o usuário é participante
            cursor = self.db.chat_rooms.find({"participants": user_id})
            try:
                import inspect
                if inspect.isawaitable(cursor):
                    cursor = await cursor
            except Exception:
                pass
            try:
                cursor = cursor.sort("updated_at", -1).limit(limit)
            except Exception:
                pass
            
            rooms = await cursor.to_list(length=None)
            room_responses = []
            
            for room in rooms:
                # Obter última mensagem
                last_message = await self.db.messages.find_one(
                    {"room_id": room["_id"]},
                    sort=[("created_at", -1)]
                )
                
                # Contar mensagens não lidas
                unread_count = await self.db.messages.count_documents({
                    "room_id": room["_id"],
                    "sender_id": {"$ne": user_id},
                    "status": {"$in": [MessageStatus.SENT.value, MessageStatus.DELIVERED.value]}
                })
                
                room_response = ChatRoomResponse(
                    id=room["_id"],
                    name=room.get("name"),
                    type=room["type"],
                    participants=room["participants"],
                    metadata=room.get("metadata"),
                    created_at=room["created_at"],
                    updated_at=room["updated_at"],
                    unread_count=unread_count,
                    last_message=MessageResponse(**last_message) if last_message else None
                )
                
                room_responses.append(room_response)
            
            return room_responses
            
        except Exception as e:
            logger.error(f"Erro ao obter salas: {e}")
            raise
    
    async def send_message(self, message_data: MessageCreate) -> str:
        """Enviar mensagem."""
        try:
            result = await self.db.messages.insert_one({
                "room_id": message_data.room_id,
                "sender_id": message_data.sender_id,
                "content": message_data.content,
                "type": message_data.type.value,
                "status": MessageStatus.SENT.value,
                "metadata": message_data.metadata or {},
                "reply_to": message_data.reply_to,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "read_at": None
            })
            message_id = getattr(result, "inserted_id", None) or str(uuid.uuid4())
            message_doc = await self.db.messages.find_one({"_id": message_id}) or {"_id": message_id, "room_id": message_data.room_id, "sender_id": message_data.sender_id, "content": message_data.content, "type": message_data.type.value, "created_at": datetime.utcnow()}
            
            # Atualizar timestamp da sala
            await self.db.chat_rooms.update_one(
                {"_id": message_data.room_id},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            
            # Enviar via WebSocket para participantes
            await self._broadcast_message(message_data.room_id, message_doc)
            
            logger.info(f"Mensagem {message_id} enviada")
            return message_id
            
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem: {e}")
            raise
    
    async def _broadcast_message(self, room_id: str, message_doc: dict):
        """Transmitir mensagem para participantes da sala."""
        try:
            # Obter participantes da sala
            room = await self.db.chat_rooms.find_one({"_id": room_id})
            if not room:
                return
            
            participants = room["participants"]
            
            # Enviar para usuários conectados
            for participant_id in participants:
                if participant_id in self.active_connections:
                    for connection in self.active_connections[participant_id]:
                        try:
                            await connection.send_text(json.dumps({
                                "type": "message",
                                "data": {
                                    "id": message_doc["_id"],
                                    "room_id": message_doc["room_id"],
                                    "sender_id": message_doc["sender_id"],
                                    "content": message_doc["content"],
                                    "type": message_doc["type"],
                                    "created_at": message_doc["created_at"].isoformat(),
                                    "metadata": message_doc.get("metadata"),
                                    "reply_to": message_doc.get("reply_to")
                                }
                            }))
                        except:
                            pass
                            
        except Exception as e:
            logger.error(f"Erro ao transmitir mensagem: {e}")
    
    async def get_room_messages(
        self, 
        room_id: str, 
        user_id: str,
        limit: int = 50, 
        offset: int = 0
    ) -> List[MessageResponse]:
        """Obter mensagens da sala."""
        try:
            # Verificar se usuário é participante da sala
            room = await self.db.chat_rooms.find_one({"_id": room_id})
            if not room or user_id not in room.get("participants", []):
                raise ValueError("Usuário não é participante desta sala")
            
            # Buscar mensagens
            cursor = self.db.messages.find({"room_id": room_id})
            try:
                import inspect
                if inspect.isawaitable(cursor):
                    cursor = await cursor
            except Exception:
                pass
            try:
                cursor = cursor.sort("created_at", -1).skip(offset).limit(limit)
            except Exception:
                pass
            
            messages = await cursor.to_list(length=None)
            
            # Marcar mensagens como entregues
            message_ids = [msg["_id"] for msg in messages if msg["sender_id"] != user_id]
            if message_ids:
                await self.db.messages.update_many(
                    {"_id": {"$in": message_ids}},
                    {"$set": {"status": MessageStatus.DELIVERED.value}}
                )
            
            return [
                MessageResponse(
                    id=message["_id"],
                    room_id=message["room_id"],
                    sender_id=message["sender_id"],
                    content=message["content"],
                    type=message["type"],
                    status=message["status"],
                    metadata=message.get("metadata"),
                    reply_to=message.get("reply_to"),
                    created_at=message["created_at"],
                    updated_at=message["updated_at"],
                    read_at=message.get("read_at")
                )
                for message in messages
            ]
            
        except Exception as e:
            logger.error(f"Erro ao obter mensagens: {e}")
            raise
    
    async def mark_messages_as_read(self, room_id: str, user_id: str) -> int:
        """Marcar mensagens como lidas."""
        try:
            result = await self.db.messages.update_many(
                {
                    "room_id": room_id,
                    "sender_id": {"$ne": user_id},
                    "status": {"$in": [MessageStatus.SENT.value, MessageStatus.DELIVERED.value]}
                },
                {
                    "$set": {
                        "status": MessageStatus.READ.value,
                        "read_at": datetime.utcnow()
                    }
                }
            )
            
            return result.modified_count
            
        except Exception as e:
            logger.error(f"Erro ao marcar mensagens como lidas: {e}")
            raise
    
    async def set_typing_indicator(self, room_id: str, user_id: str, is_typing: bool):
        """Definir indicador de digitação."""
        try:
            if is_typing:
                if room_id not in self.typing_users:
                    self.typing_users[room_id] = set()
                self.typing_users[room_id].add(user_id)
            else:
                if room_id in self.typing_users:
                    self.typing_users[room_id].discard(user_id)
            
            # Transmitir indicador para outros participantes
            await self._broadcast_typing_indicator(room_id, user_id, is_typing)
            
        except Exception as e:
            logger.error(f"Erro ao definir indicador de digitação: {e}")
    
    async def _broadcast_typing_indicator(self, room_id: str, user_id: str, is_typing: bool):
        """Transmitir indicador de digitação."""
        try:
            room = await self.db.chat_rooms.find_one({"_id": room_id})
            if not room:
                return
            
            participants = room["participants"]
            
            for participant_id in participants:
                if participant_id != user_id and participant_id in self.active_connections:
                    for connection in self.active_connections[participant_id]:
                        try:
                            await connection.send_text(json.dumps({
                                "type": "typing",
                                "data": {
                                    "room_id": room_id,
                                    "user_id": user_id,
                                    "is_typing": is_typing,
                                    "timestamp": datetime.utcnow().isoformat()
                                }
                            }))
                        except:
                            pass
                            
        except Exception as e:
            logger.error(f"Erro ao transmitir indicador de digitação: {e}")
    
    async def search_messages(self, search_data: MessageSearch, user_id: str) -> List[MessageResponse]:
        """Buscar mensagens."""
        try:
            query = {"content": {"$regex": search_data.query, "$options": "i"}}
            
            if search_data.room_id:
                query["room_id"] = search_data.room_id
            if search_data.sender_id:
                query["sender_id"] = search_data.sender_id
            if search_data.date_from:
                query["created_at"] = {"$gte": search_data.date_from}
            if search_data.date_to:
                query["created_at"] = {"$lte": search_data.date_to}
            if search_data.message_type:
                query["type"] = search_data.message_type.value
            
            cursor = self.db.messages.find(query)
            try:
                import inspect
                if inspect.isawaitable(cursor):
                    cursor = await cursor
            except Exception:
                pass
            try:
                cursor = cursor.sort("created_at", -1).skip(search_data.offset).limit(search_data.limit)
            except Exception:
                pass
            messages = await cursor.to_list(length=None)
            
            return [
                MessageResponse(
                    id=message["_id"],
                    room_id=message["room_id"],
                    sender_id=message["sender_id"],
                    content=message["content"],
                    type=message["type"],
                    status=message["status"],
                    metadata=message.get("metadata"),
                    reply_to=message.get("reply_to"),
                    created_at=message["created_at"],
                    updated_at=message["updated_at"],
                    read_at=message.get("read_at")
                )
                for message in messages
            ]
            
        except Exception as e:
            logger.error(f"Erro na busca de mensagens: {e}")
            raise
    
    async def get_chat_stats(self, user_id: str) -> ChatStats:
        """Obter estatísticas do chat."""
        try:
            # Total de mensagens do usuário
            total_messages = await self.db.messages.count_documents({"sender_id": user_id})
            
            # Total de salas do usuário
            total_rooms = await self.db.chat_rooms.count_documents({"participants": user_id})
            
            # Mensagens não lidas
            unread_messages = await self.db.messages.count_documents({
                "sender_id": {"$ne": user_id},
                "status": {"$in": [MessageStatus.SENT.value, MessageStatus.DELIVERED.value]}
            })
            
            # Salas ativas (com mensagens recentes)
            active_rooms = await self.db.chat_rooms.count_documents({
                "participants": user_id,
                "updated_at": {"$gte": datetime.utcnow() - timedelta(days=7)}
            })
            
            return ChatStats(
                total_messages=total_messages,
                total_rooms=total_rooms,
                unread_messages=unread_messages,
                active_rooms=active_rooms
            )
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas: {e}")
            raise
