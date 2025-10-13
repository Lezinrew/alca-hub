# Modelos de Avaliações - Alça Hub
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ReviewType(str, Enum):
    """Tipos de avaliação."""
    SERVICE_PROVIDER = "service_provider"  # Avaliação do prestador
    CUSTOMER = "customer"                  # Avaliação do cliente
    SERVICE = "service"                    # Avaliação do serviço


class ReviewStatus(str, Enum):
    """Status da avaliação."""
    PENDING = "pending"      # Aguardando aprovação
    APPROVED = "approved"    # Aprovada
    REJECTED = "rejected"    # Rejeitada
    HIDDEN = "hidden"       # Ocultada


class ReviewCreate(BaseModel):
    """Modelo para criação de avaliação."""
    reviewer_id: str = Field(..., description="ID do avaliador")
    reviewee_id: str = Field(..., description="ID do avaliado")
    service_id: Optional[str] = Field(default=None, description="ID do serviço")
    booking_id: Optional[str] = Field(default=None, description="ID do agendamento")
    rating: int = Field(..., ge=1, le=5, description="Nota de 1 a 5")
    title: Optional[str] = Field(default=None, max_length=100, description="Título da avaliação")
    comment: Optional[str] = Field(default=None, max_length=1000, description="Comentário")
    type: ReviewType = Field(..., description="Tipo da avaliação")
    anonymous: bool = Field(default=False, description="Avaliação anônima")
    tags: Optional[List[str]] = Field(default=None, description="Tags da avaliação")


class ReviewResponse(BaseModel):
    """Modelo de resposta de avaliação."""
    id: str
    reviewer_id: str
    reviewee_id: str
    service_id: Optional[str]
    booking_id: Optional[str]
    rating: int
    title: Optional[str]
    comment: Optional[str]
    type: ReviewType
    status: ReviewStatus
    anonymous: bool
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime]
    reviewer_name: Optional[str] = None
    reviewee_name: Optional[str] = None


class ReviewUpdate(BaseModel):
    """Modelo para atualização de avaliação."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = Field(None, max_length=100)
    comment: Optional[str] = Field(None, max_length=1000)
    tags: Optional[List[str]] = None


class ReviewStats(BaseModel):
    """Estatísticas de avaliações."""
    total_reviews: int
    average_rating: float
    rating_distribution: Dict[str, int]  # {"1": 5, "2": 3, ...}
    recent_reviews: List[ReviewResponse]
    top_tags: List[Dict[str, Any]]  # [{"tag": "punctual", "count": 10}, ...]


class ReviewSearch(BaseModel):
    """Modelo para busca de avaliações."""
    reviewee_id: Optional[str] = None
    service_id: Optional[str] = None
    rating_min: Optional[int] = Field(None, ge=1, le=5)
    rating_max: Optional[int] = Field(None, ge=1, le=5)
    type: Optional[ReviewType] = None
    status: Optional[ReviewStatus] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    tags: Optional[List[str]] = None
    limit: int = Field(default=20, le=100)
    offset: int = Field(default=0, ge=0)


class ReviewAnalytics(BaseModel):
    """Analytics de avaliações."""
    period: str  # "day", "week", "month", "year"
    total_reviews: int
    average_rating: float
    rating_trend: List[Dict[str, Any]]  # [{"date": "2025-01-01", "rating": 4.5}, ...]
    top_reviewers: List[Dict[str, Any]]  # [{"user_id": "123", "count": 10}, ...]
    most_common_tags: List[Dict[str, Any]]  # [{"tag": "professional", "count": 15}, ...]
    sentiment_analysis: Dict[str, float]  # {"positive": 0.7, "neutral": 0.2, "negative": 0.1}


class ReviewReport(BaseModel):
    """Modelo para reportar avaliação."""
    review_id: str
    reporter_id: str
    reason: str = Field(..., max_length=500, description="Motivo do reporte")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição adicional")


class ReviewModeration(BaseModel):
    """Modelo para moderação de avaliação."""
    review_id: str
    moderator_id: str
    action: str  # "approve", "reject", "hide"
    reason: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = Field(None, max_length=1000)
