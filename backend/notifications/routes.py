# Rotas de Notificações - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from .models import (
    NotificationCreate,
    NotificationResponse,
    NotificationUpdate,
    NotificationBulkUpdate,
    NotificationStats,
    NotificationPreferences
)
from .manager import NotificationManager
from ..auth.token_manager import TokenManager
from ..auth.security import SecurityManager

logger = logging.getLogger(__name__)

# Router para notificações
notification_router = APIRouter(prefix="/notifications", tags=["notifications"])

# Dependências
security = HTTPBearer()

async def get_notification_manager(db: AsyncIOMotorDatabase = Depends()) -> NotificationManager:
    """Obter instância do gerenciador de notificações."""
    return NotificationManager(db)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obter usuário atual do token."""
    # Implementar extração do usuário do token JWT
    # Por enquanto, retornar um ID mockado
    return {"user_id": "mock_user_id"}


@notification_router.post("/", response_model=dict)
async def create_notification(
    notification: NotificationCreate,
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Criar nova notificação."""
    try:
        notification_id = await manager.send_notification(notification)
        return {
            "message": "Notificação criada com sucesso",
            "notification_id": notification_id
        }
    except Exception as e:
        logger.error(f"Erro ao criar notificação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    limit: int = 50,
    offset: int = 0,
    unread_only: bool = False,
    current_user: dict = Depends(get_current_user),
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Obter notificações do usuário atual."""
    try:
        notifications = await manager.get_user_notifications(
            user_id=current_user["user_id"],
            limit=limit,
            offset=offset,
            unread_only=unread_only
        )
        return notifications
    except Exception as e:
        logger.error(f"Erro ao obter notificações: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.get("/stats", response_model=NotificationStats)
async def get_notification_stats(
    current_user: dict = Depends(get_current_user),
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Obter estatísticas de notificações do usuário."""
    try:
        stats = await manager.get_notification_stats(current_user["user_id"])
        return NotificationStats(**stats)
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.patch("/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Marcar notificação como lida."""
    try:
        success = await manager.mark_as_read(notification_id, current_user["user_id"])
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notificação não encontrada"
            )
        
        return {"message": "Notificação marcada como lida"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao marcar notificação como lida: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.patch("/mark-all-read")
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Marcar todas as notificações como lidas."""
    try:
        count = await manager.mark_all_as_read(current_user["user_id"])
        return {
            "message": f"{count} notificações marcadas como lidas"
        }
    except Exception as e:
        logger.error(f"Erro ao marcar todas as notificações como lidas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.post("/bulk-update")
async def bulk_update_notifications(
    update_data: NotificationBulkUpdate,
    current_user: dict = Depends(get_current_user),
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Atualizar múltiplas notificações."""
    try:
        # Implementar lógica de atualização em lote
        updated_count = 0
        
        for notification_id in update_data.notification_ids:
            success = await manager.mark_as_read(notification_id, current_user["user_id"])
            if success:
                updated_count += 1
        
        return {
            "message": f"{updated_count} notificações atualizadas",
            "updated_count": updated_count
        }
    except Exception as e:
        logger.error(f"Erro na atualização em lote: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Endpoint WebSocket para notificações em tempo real."""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Manter conexão ativa
            data = await websocket.receive_text()
            
            # Processar mensagens do cliente se necessário
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Erro no WebSocket: {e}")
        await manager.disconnect(websocket, user_id)


@notification_router.post("/preferences")
async def update_notification_preferences(
    preferences: NotificationPreferences,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends()
):
    """Atualizar preferências de notificação do usuário."""
    try:
        preferences.user_id = current_user["user_id"]
        
        # Salvar preferências no banco
        await db.notification_preferences.update_one(
            {"user_id": current_user["user_id"]},
            {"$set": preferences.dict()},
            upsert=True
        )
        
        return {"message": "Preferências atualizadas com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao atualizar preferências: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.get("/preferences", response_model=NotificationPreferences)
async def get_notification_preferences(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter preferências de notificação do usuário."""
    try:
        preferences = await db.notification_preferences.find_one(
            {"user_id": current_user["user_id"]}
        )
        
        if not preferences:
            # Retornar preferências padrão
            return NotificationPreferences(user_id=current_user["user_id"])
        
        return NotificationPreferences(**preferences)
    except Exception as e:
        logger.error(f"Erro ao obter preferências: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@notification_router.delete("/cleanup")
async def cleanup_expired_notifications(
    manager: NotificationManager = Depends(get_notification_manager)
):
    """Limpar notificações expiradas (endpoint administrativo)."""
    try:
        await manager.cleanup_expired_notifications()
        return {"message": "Notificações expiradas removidas"}
    except Exception as e:
        logger.error(f"Erro na limpeza: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
