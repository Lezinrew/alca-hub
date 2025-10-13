# Rotas de Chat - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from chat.models import (
    MessageCreate,
    MessageResponse,
    ChatRoomCreate,
    ChatRoomResponse,
    MessageSearch,
    ChatStats,
    TypingIndicator
)
from chat.manager import ChatManager

logger = logging.getLogger(__name__)

# Router para chat
chat_router = APIRouter(prefix="/chat", tags=["chat"])

# Dependências
security = HTTPBearer()

async def get_chat_manager(db: AsyncIOMotorDatabase = Depends()) -> ChatManager:
    """Obter instância do gerenciador de chat."""
    return ChatManager(db)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obter usuário atual do token."""
    # Implementar extração do usuário do token JWT
    return {"user_id": "mock_user_id"}


@chat_router.post("/rooms", response_model=dict)
async def create_chat_room(
    room_data: ChatRoomCreate,
    manager: ChatManager = Depends(get_chat_manager)
):
    """Criar nova sala de chat."""
    try:
        room_id = await manager.create_room(room_data)
        return {
            "message": "Sala de chat criada com sucesso",
            "room_id": room_id
        }
    except Exception as e:
        logger.error(f"Erro ao criar sala: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.get("/rooms", response_model=List[ChatRoomResponse])
async def get_user_rooms(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Obter salas de chat do usuário."""
    try:
        rooms = await manager.get_user_rooms(current_user["user_id"], limit)
        return rooms
    except Exception as e:
        logger.error(f"Erro ao obter salas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.post("/messages", response_model=dict)
async def send_message(
    message_data: MessageCreate,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Enviar mensagem."""
    try:
        message_data.sender_id = current_user["user_id"]
        message_id = await manager.send_message(message_data)
        return {
            "message": "Mensagem enviada com sucesso",
            "message_id": message_id
        }
    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.get("/rooms/{room_id}/messages", response_model=List[MessageResponse])
async def get_room_messages(
    room_id: str,
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Obter mensagens da sala."""
    try:
        messages = await manager.get_room_messages(
            room_id, current_user["user_id"], limit, offset
        )
        return messages
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Erro ao obter mensagens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.patch("/rooms/{room_id}/read")
async def mark_messages_as_read(
    room_id: str,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Marcar mensagens como lidas."""
    try:
        count = await manager.mark_messages_as_read(room_id, current_user["user_id"])
        return {
            "message": f"{count} mensagens marcadas como lidas"
        }
    except Exception as e:
        logger.error(f"Erro ao marcar mensagens como lidas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.post("/typing")
async def set_typing_indicator(
    typing_data: TypingIndicator,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Definir indicador de digitação."""
    try:
        await manager.set_typing_indicator(
            typing_data.room_id, 
            current_user["user_id"], 
            typing_data.is_typing
        )
        return {"message": "Indicador de digitação atualizado"}
    except Exception as e:
        logger.error(f"Erro ao definir indicador de digitação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.post("/search", response_model=List[MessageResponse])
async def search_messages(
    search_data: MessageSearch,
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Buscar mensagens."""
    try:
        messages = await manager.search_messages(search_data, current_user["user_id"])
        return messages
    except Exception as e:
        logger.error(f"Erro na busca de mensagens: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.get("/stats", response_model=ChatStats)
async def get_chat_stats(
    current_user: dict = Depends(get_current_user),
    manager: ChatManager = Depends(get_chat_manager)
):
    """Obter estatísticas do chat."""
    try:
        stats = await manager.get_chat_stats(current_user["user_id"])
        return stats
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@chat_router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    user_id: str,
    manager: ChatManager = Depends(get_chat_manager)
):
    """Endpoint WebSocket para chat em tempo real."""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            # Manter conexão ativa e processar mensagens
            data = await websocket.receive_text()
            
            # Processar mensagens do cliente
            if data == "ping":
                await websocket.send_text("pong")
            
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"Erro no WebSocket: {e}")
        await manager.disconnect(websocket, user_id)
