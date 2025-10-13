# Gerenciador de Notificações - Alça Hub
import asyncio
import json
from typing import Dict, List, Optional, Set
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import WebSocket, WebSocketDisconnect
import logging

from .models import (
    NotificationCreate, 
    NotificationResponse, 
    NotificationType,
    NotificationStatus,
    NotificationPriority
)

logger = logging.getLogger(__name__)


class NotificationManager:
    """Gerenciador de notificações em tempo real."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.active_connections: Dict[str, Set[WebSocket]] = {}
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
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Conectar usuário ao sistema de notificações."""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)
        logger.info(f"Usuário {user_id} conectado. Total de conexões: {len(self.active_connections[user_id])}")
    
    async def disconnect(self, websocket: WebSocket, user_id: str):
        """Desconectar usuário do sistema de notificações."""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        
        logger.info(f"Usuário {user_id} desconectado")
    
    async def send_notification(self, notification: NotificationCreate) -> str:
        """
        Enviar notificação para um usuário.
        
        Args:
            notification: Dados da notificação
            
        Returns:
            str: ID da notificação criada
        """
        try:
            # Salvar notificação no banco
            notification_data = {
                "user_id": notification.user_id,
                "type": notification.type.value,
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority.value,
                "status": NotificationStatus.PENDING.value,
                "data": notification.data or {},
                "created_at": datetime.utcnow(),
                "read_at": None,
                "expires_at": notification.expires_at
            }
            
            result = await self.db.notifications.insert_one(notification_data)
            notification_id = str(result.inserted_id)
            
            # Enviar via WebSocket se usuário estiver conectado
            await self._send_websocket_notification(notification.user_id, {
                "id": notification_id,
                "type": notification.type.value,
                "title": notification.title,
                "message": notification.message,
                "priority": notification.priority.value,
                "created_at": notification_data["created_at"].isoformat(),
                "data": notification.data or {}
            })
            
            # Atualizar status para enviado
            await self.db.notifications.update_one(
                {"_id": result.inserted_id},
                {"$set": {"status": NotificationStatus.SENT.value}}
            )
            
            logger.info(f"Notificação {notification_id} enviada para usuário {notification.user_id}")
            return notification_id
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação: {e}")
            raise
    
    async def _send_websocket_notification(self, user_id: str, notification_data: dict):
        """Enviar notificação via WebSocket."""
        if user_id in self.active_connections:
            connections_to_remove = set()
            
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(notification_data))
                except WebSocketDisconnect:
                    connections_to_remove.add(connection)
                except Exception as e:
                    logger.error(f"Erro ao enviar via WebSocket: {e}")
                    connections_to_remove.add(connection)
            
            # Remover conexões com erro
            for connection in connections_to_remove:
                self.active_connections[user_id].discard(connection)
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        limit: int = 50, 
        offset: int = 0,
        unread_only: bool = False
    ) -> List[NotificationResponse]:
        """Obter notificações do usuário."""
        query = {"user_id": user_id}
        
        if unread_only:
            query["status"] = {"$in": [NotificationStatus.SENT.value, NotificationStatus.DELIVERED.value]}
        
        cursor = self.db.notifications.find(query).sort("created_at", -1).skip(offset).limit(limit)
        notifications = await cursor.to_list(length=None)
        
        return [
            NotificationResponse(
                id=str(notification["_id"]),
                user_id=notification["user_id"],
                type=notification["type"],
                title=notification["title"],
                message=notification["message"],
                priority=notification["priority"],
                status=notification["status"],
                data=notification.get("data"),
                created_at=notification["created_at"],
                read_at=notification.get("read_at"),
                expires_at=notification.get("expires_at")
            )
            for notification in notifications
        ]
    
    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Marcar notificação como lida."""
        result = await self.db.notifications.update_one(
            {"_id": notification_id, "user_id": user_id},
            {
                "$set": {
                    "status": NotificationStatus.READ.value,
                    "read_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def mark_all_as_read(self, user_id: str) -> int:
        """Marcar todas as notificações do usuário como lidas."""
        result = await self.db.notifications.update_many(
            {
                "user_id": user_id,
                "status": {"$in": [NotificationStatus.SENT.value, NotificationStatus.DELIVERED.value]}
            },
            {
                "$set": {
                    "status": NotificationStatus.READ.value,
                    "read_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count
    
    async def get_notification_stats(self, user_id: str) -> dict:
        """Obter estatísticas de notificações do usuário."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": 1},
                    "unread": {
                        "$sum": {
                            "$cond": [
                                {"$in": ["$status", [NotificationStatus.SENT.value, NotificationStatus.DELIVERED.value]]},
                                1, 0
                            ]
                        }
                    },
                    "by_type": {
                        "$push": {
                            "type": "$type",
                            "count": 1
                        }
                    },
                    "by_priority": {
                        "$push": {
                            "priority": "$priority",
                            "count": 1
                        }
                    }
                }
            }
        ]
        
        result = await self.db.notifications.aggregate(pipeline).to_list(length=1)
        
        if result:
            stats = result[0]
            return {
                "total": stats["total"],
                "unread": stats["unread"],
                "by_type": self._count_by_field(stats["by_type"], "type"),
                "by_priority": self._count_by_field(stats["by_priority"], "priority")
            }
        
        return {"total": 0, "unread": 0, "by_type": {}, "by_priority": {}}
    
    def _count_by_field(self, items: List[dict], field: str) -> Dict[str, int]:
        """Contar itens por campo."""
        counts = {}
        for item in items:
            key = item[field]
            counts[key] = counts.get(key, 0) + item["count"]
        return counts
    
    async def cleanup_expired_notifications(self):
        """Limpar notificações expiradas."""
        result = await self.db.notifications.delete_many({
            "expires_at": {"$lt": datetime.utcnow()}
        })
        logger.info(f"Removidas {result.deleted_count} notificações expiradas")
    
    async def send_bulk_notification(
        self, 
        user_ids: List[str], 
        notification: NotificationCreate
    ) -> List[str]:
        """Enviar notificação para múltiplos usuários."""
        notification_ids = []
        
        for user_id in user_ids:
            notification.user_id = user_id
            notification_id = await self.send_notification(notification)
            notification_ids.append(notification_id)
        
        return notification_ids
