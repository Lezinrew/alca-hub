# Modelos de Notificações - Alça Hub
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    """Tipos de notificação disponíveis."""
    BOOKING_REQUEST = "booking_request"
    BOOKING_ACCEPTED = "booking_accepted"
    BOOKING_REJECTED = "booking_rejected"
    BOOKING_CANCELLED = "booking_cancelled"
    PAYMENT_RECEIVED = "payment_received"
    PAYMENT_FAILED = "payment_failed"
    SERVICE_COMPLETED = "service_completed"
    RATING_RECEIVED = "rating_received"
    MESSAGE_RECEIVED = "message_received"
    SYSTEM_ANNOUNCEMENT = "system_announcement"
    SECURITY_ALERT = "security_alert"


class NotificationPriority(str, Enum):
    """Prioridades de notificação."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class NotificationStatus(str, Enum):
    """Status da notificação."""
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"


class NotificationCreate(BaseModel):
    """Modelo para criação de notificação."""
    user_id: str = Field(..., description="ID do usuário destinatário")
    type: NotificationType = Field(..., description="Tipo da notificação")
    title: str = Field(..., description="Título da notificação")
    message: str = Field(..., description="Mensagem da notificação")
    priority: NotificationPriority = Field(default=NotificationPriority.MEDIUM)
    data: Optional[Dict[str, Any]] = Field(default=None, description="Dados adicionais")
    expires_at: Optional[datetime] = Field(default=None, description="Data de expiração")


class NotificationResponse(BaseModel):
    """Modelo de resposta de notificação."""
    id: str
    user_id: str
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority
    status: NotificationStatus
    data: Optional[Dict[str, Any]]
    created_at: datetime
    read_at: Optional[datetime]
    expires_at: Optional[datetime]


class NotificationUpdate(BaseModel):
    """Modelo para atualização de notificação."""
    status: Optional[NotificationStatus] = None
    read_at: Optional[datetime] = None


class NotificationBulkUpdate(BaseModel):
    """Modelo para atualização em lote."""
    notification_ids: List[str]
    status: NotificationStatus


class NotificationStats(BaseModel):
    """Estatísticas de notificações."""
    total: int
    unread: int
    by_type: Dict[str, int]
    by_priority: Dict[str, int]


class NotificationPreferences(BaseModel):
    """Preferências de notificação do usuário."""
    user_id: str
    email_enabled: bool = True
    push_enabled: bool = True
    sms_enabled: bool = False
    types_enabled: Dict[NotificationType, bool] = Field(default_factory=dict)
    quiet_hours_start: Optional[str] = None  # HH:MM format
    quiet_hours_end: Optional[str] = None    # HH:MM format
    timezone: str = "America/Sao_Paulo"
