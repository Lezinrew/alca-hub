# Modelos de Analytics - Alça Hub
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime, date
from enum import Enum


class AnalyticsPeriod(str, Enum):
    """Períodos de análise."""
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    YEAR = "year"


class MetricType(str, Enum):
    """Tipos de métricas."""
    COUNT = "count"
    SUM = "sum"
    AVERAGE = "average"
    PERCENTAGE = "percentage"
    GROWTH_RATE = "growth_rate"


class DashboardWidget(BaseModel):
    """Widget do dashboard."""
    id: str
    title: str
    type: str  # "chart", "metric", "table", "map"
    data: Dict[str, Any]
    position: Dict[str, int]  # {"x": 0, "y": 0, "w": 4, "h": 3}
    refresh_interval: Optional[int] = None  # segundos


class UserAnalytics(BaseModel):
    """Analytics de usuários."""
    total_users: int
    new_users: int
    active_users: int
    user_growth: float
    user_retention: float
    user_segments: Dict[str, int]  # {"morador": 100, "prestador": 50}
    top_cities: List[Dict[str, Any]]  # [{"city": "São Paulo", "count": 50}, ...]


class ServiceAnalytics(BaseModel):
    """Analytics de serviços."""
    total_services: int
    active_services: int
    service_categories: Dict[str, int]
    average_rating: float
    top_services: List[Dict[str, Any]]
    service_trends: List[Dict[str, Any]]  # [{"date": "2025-01-01", "count": 10}, ...]


class BookingAnalytics(BaseModel):
    """Analytics de agendamentos."""
    total_bookings: int
    completed_bookings: int
    cancelled_bookings: int
    booking_success_rate: float
    average_booking_value: float
    booking_trends: List[Dict[str, Any]]
    peak_hours: List[Dict[str, Any]]  # [{"hour": 14, "count": 20}, ...]


class RevenueAnalytics(BaseModel):
    """Analytics de receita."""
    total_revenue: float
    monthly_revenue: float
    revenue_growth: float
    average_transaction_value: float
    revenue_by_category: Dict[str, float]
    payment_methods: Dict[str, float]
    revenue_trends: List[Dict[str, Any]]


class PerformanceMetrics(BaseModel):
    """Métricas de performance."""
    response_time: float
    uptime: float
    error_rate: float
    throughput: int
    concurrent_users: int
    database_performance: Dict[str, Any]


class GeographicAnalytics(BaseModel):
    """Analytics geográficos."""
    total_locations: int
    top_cities: List[Dict[str, Any]]
    service_coverage: Dict[str, Any]
    user_distribution: Dict[str, Any]
    heatmap_data: List[Dict[str, Any]]


class CustomReport(BaseModel):
    """Relatório customizado."""
    name: str
    description: Optional[str]
    metrics: List[str]
    filters: Dict[str, Any]
    period: AnalyticsPeriod
    format: str  # "json", "csv", "pdf"
    schedule: Optional[str]  # Cron expression


class AnalyticsQuery(BaseModel):
    """Query de analytics."""
    metrics: List[str]
    dimensions: List[str]
    filters: Dict[str, Any]
    period: AnalyticsPeriod
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    group_by: Optional[List[str]]
    order_by: Optional[Dict[str, str]]  # {"field": "date", "direction": "asc"}


class RealTimeMetrics(BaseModel):
    """Métricas em tempo real."""
    timestamp: datetime
    active_users: int
    current_bookings: int
    system_load: float
    response_time: float
    error_count: int
    revenue_today: float


class AlertRule(BaseModel):
    """Regra de alerta."""
    name: str
    metric: str
    condition: str  # ">", "<", ">=", "<=", "==", "!="
    threshold: float
    enabled: bool = True
    notification_channels: List[str]  # ["email", "sms", "webhook"]


class AnalyticsExport(BaseModel):
    """Exportação de analytics."""
    format: str  # "json", "csv", "xlsx", "pdf"
    metrics: List[str]
    period: AnalyticsPeriod
    start_date: datetime
    end_date: datetime
    filters: Dict[str, Any]
    include_charts: bool = False
