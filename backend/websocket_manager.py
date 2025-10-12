# Gerenciador de WebSocket - Alça Hub
import asyncio
import json
import logging
from typing import Dict, Set, Any
from fastapi import WebSocket, WebSocketDisconnect
from datetime import datetime

logger = logging.getLogger(__name__)


class WebSocketManager:
    """Gerenciador centralizado de conexões WebSocket."""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
        self.cleanup_task = None
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Iniciar tarefa de limpeza de conexões."""
        if not self.cleanup_task:
            try:
                loop = asyncio.get_running_loop()
                self.cleanup_task = loop.create_task(self._cleanup_connections())
            except RuntimeError:
                # Não há loop rodando, pular inicialização
                pass
    
    async def _cleanup_connections(self):
        """Limpar conexões inativas periodicamente."""
        while True:
            try:
                await asyncio.sleep(30)  # Limpar a cada 30 segundos
                await self._remove_inactive_connections()
            except Exception as e:
                logger.error(f"Erro na limpeza de conexões: {e}")
    
    async def _remove_inactive_connections(self):
        """Remover conexões inativas."""
        inactive_connections = []
        
        for user_id, connections in self.active_connections.items():
            active_connections = set()
            for connection in connections:
                try:
                    # Testar se a conexão ainda está ativa
                    await connection.ping()
                    active_connections.add(connection)
                except:
                    inactive_connections.append(connection)
            
            if active_connections:
                self.active_connections[user_id] = active_connections
            else:
                del self.active_connections[user_id]
        
        # Remover metadados de conexões inativas
        for connection in inactive_connections:
            self.connection_metadata.pop(connection, None)
    
    async def connect(self, websocket: WebSocket, user_id: str, metadata: Dict[str, Any] = None):
        """Conectar usuário ao sistema WebSocket."""
        try:
            await websocket.accept()
            
            if user_id not in self.active_connections:
                self.active_connections[user_id] = set()
            
            self.active_connections[user_id].add(websocket)
            self.connection_metadata[websocket] = {
                "user_id": user_id,
                "connected_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                **(metadata or {})
            }
            
            logger.info(f"Usuário {user_id} conectado via WebSocket")
            
            # Enviar mensagem de boas-vindas
            await self.send_personal_message(
                websocket, 
                {
                    "type": "connection",
                    "message": "Conectado com sucesso",
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Erro ao conectar usuário {user_id}: {e}")
            raise
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Desconectar usuário do sistema WebSocket."""
        try:
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            # Remover metadados
            self.connection_metadata.pop(websocket, None)
            
            logger.info(f"Usuário {user_id} desconectado do WebSocket")
            
        except Exception as e:
            logger.error(f"Erro ao desconectar usuário {user_id}: {e}")
    
    async def send_personal_message(self, websocket: WebSocket, message: Dict[str, Any]):
        """Enviar mensagem para uma conexão específica."""
        try:
            await websocket.send_text(json.dumps(message))
            
            # Atualizar última atividade
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]["last_activity"] = datetime.utcnow()
                
        except WebSocketDisconnect:
            # Remover conexão inativa
            await self._remove_connection(websocket)
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem pessoal: {e}")
    
    async def send_to_user(self, user_id: str, message: Dict[str, Any]):
        """Enviar mensagem para um usuário específico."""
        if user_id not in self.active_connections:
            logger.warning(f"Usuário {user_id} não está conectado")
            return
        
        connections_to_remove = set()
        
        for connection in self.active_connections[user_id]:
            try:
                await connection.send_text(json.dumps(message))
                
                # Atualizar última atividade
                if connection in self.connection_metadata:
                    self.connection_metadata[connection]["last_activity"] = datetime.utcnow()
                    
            except WebSocketDisconnect:
                connections_to_remove.add(connection)
            except Exception as e:
                logger.error(f"Erro ao enviar mensagem para usuário {user_id}: {e}")
                connections_to_remove.add(connection)
        
        # Remover conexões com erro
        for connection in connections_to_remove:
            await self._remove_connection(connection)
    
    async def broadcast_to_room(self, room_participants: list, message: Dict[str, Any], exclude_user: str = None):
        """Transmitir mensagem para participantes de uma sala."""
        for user_id in room_participants:
            if exclude_user and user_id == exclude_user:
                continue
            
            await self.send_to_user(user_id, message)
    
    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Transmitir mensagem para todos os usuários conectados."""
        for user_id in list(self.active_connections.keys()):
            await self.send_to_user(user_id, message)
    
    async def _remove_connection(self, websocket: WebSocket):
        """Remover conexão específica."""
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]
            
            if user_id in self.active_connections:
                self.active_connections[user_id].discard(websocket)
                
                if not self.active_connections[user_id]:
                    del self.active_connections[user_id]
            
            del self.connection_metadata[websocket]
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Obter estatísticas das conexões."""
        total_connections = sum(len(connections) for connections in self.active_connections.values())
        unique_users = len(self.active_connections)
        
        return {
            "total_connections": total_connections,
            "unique_users": unique_users,
            "active_users": list(self.active_connections.keys()),
            "connection_metadata": {
                str(websocket): metadata 
                for websocket, metadata in self.connection_metadata.items()
            }
        }
    
    async def handle_websocket_message(self, websocket: WebSocket, message: str):
        """Processar mensagem recebida via WebSocket."""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "ping":
                await self.send_personal_message(websocket, {
                    "type": "pong",
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            elif message_type == "typing":
                # Processar indicador de digitação
                room_id = data.get("room_id")
                is_typing = data.get("is_typing", False)
                
                if room_id:
                    await self._handle_typing_indicator(websocket, room_id, is_typing)
            
            elif message_type == "notification_read":
                # Processar notificação lida
                notification_id = data.get("notification_id")
                if notification_id:
                    await self._handle_notification_read(websocket, notification_id)
            
            else:
                logger.warning(f"Tipo de mensagem desconhecido: {message_type}")
                
        except json.JSONDecodeError:
            logger.error("Mensagem JSON inválida recebida")
        except Exception as e:
            logger.error(f"Erro ao processar mensagem WebSocket: {e}")
    
    async def _handle_typing_indicator(self, websocket: WebSocket, room_id: str, is_typing: bool):
        """Processar indicador de digitação."""
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]
            
            # Transmitir indicador para outros participantes da sala
            # (implementação específica seria feita pelo ChatManager)
            pass
    
    async def _handle_notification_read(self, websocket: WebSocket, notification_id: str):
        """Processar notificação lida."""
        if websocket in self.connection_metadata:
            user_id = self.connection_metadata[websocket]["user_id"]
            
            # Marcar notificação como lida
            # (implementação específica seria feita pelo NotificationManager)
            pass


# Instância global do gerenciador
websocket_manager = WebSocketManager()
