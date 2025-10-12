# Modelos de Chat - Alça Hub
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    """Tipos de mensagem."""
    TEXT = "text"
    IMAGE = "image"
    FILE = "file"
    SYSTEM = "system"
    BOOKING_REQUEST = "booking_request"
    BOOKING_ACCEPTED = "booking_accepted"
    BOOKING_REJECTED = "booking_rejected"
    PAYMENT_REQUEST = "payment_request"
    PAYMENT_CONFIRMED = "payment_confirmed"


class MessageStatus(str, Enum):
    """Status da mensagem."""
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class ChatRoomType(str, Enum):
    """Tipos de sala de chat."""
    DIRECT = "direct"  # Chat direto entre dois usuários
    GROUP = "group"    # Chat em grupo
    SERVICE = "service"  # Chat relacionado a um serviço


class MessageCreate(BaseModel):
    """Modelo para criação de mensagem."""
    room_id: str = Field(..., description="ID da sala de chat")
    sender_id: str = Field(..., description="ID do remetente")
    content: str = Field(..., description="Conteúdo da mensagem")
    type: MessageType = Field(default=MessageType.TEXT)
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadados da mensagem")
    reply_to: Optional[str] = Field(default=None, description="ID da mensagem respondida")


class MessageResponse(BaseModel):
    """Modelo de resposta de mensagem."""
    id: str
    room_id: str
    sender_id: str
    content: str
    type: MessageType
    status: MessageStatus
    metadata: Optional[Dict[str, Any]]
    reply_to: Optional[str]
    created_at: datetime
    updated_at: datetime
    read_at: Optional[datetime]


class ChatRoomCreate(BaseModel):
    """Modelo para criação de sala de chat."""
    name: Optional[str] = Field(default=None, description="Nome da sala")
    type: ChatRoomType = Field(default=ChatRoomType.DIRECT)
    participants: List[str] = Field(..., description="IDs dos participantes")
    metadata: Optional[Dict[str, Any]] = Field(default=None, description="Metadados da sala")


class ChatRoomResponse(BaseModel):
    """Modelo de resposta de sala de chat."""
    id: str
    name: Optional[str]
    type: ChatRoomType
    participants: List[str]
    metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    last_message: Optional[MessageResponse]
    unread_count: int = 0


class ChatRoomUpdate(BaseModel):
    """Modelo para atualização de sala de chat."""
    name: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class MessageUpdate(BaseModel):
    """Modelo para atualização de mensagem."""
    content: Optional[str] = None
    status: Optional[MessageStatus] = None


class TypingIndicator(BaseModel):
    """Indicador de digitação."""
    room_id: str
    user_id: str
    is_typing: bool
    timestamp: datetime


class ChatStats(BaseModel):
    """Estatísticas do chat."""
    total_messages: int
    total_rooms: int
    unread_messages: int
    active_rooms: int


class MessageSearch(BaseModel):
    """Modelo para busca de mensagens."""
    room_id: Optional[str] = None
    query: str = Field(..., description="Termo de busca")
    sender_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    message_type: Optional[MessageType] = None
    limit: int = Field(default=50, le=100)
    offset: int = Field(default=0, ge=0)
