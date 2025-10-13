# Rotas de Analytics - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta
import logging

from analytics.models import (
    UserAnalytics,
    ServiceAnalytics,
    BookingAnalytics,
    RevenueAnalytics,
    PerformanceMetrics,
    GeographicAnalytics,
    RealTimeMetrics,
    AnalyticsQuery,
    CustomReport
)

logger = logging.getLogger(__name__)

# Router para analytics
analytics_router = APIRouter(prefix="/analytics", tags=["analytics"])

# Dependências
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obter usuário atual do token."""
    return {"user_id": "mock_user_id"}


@analytics_router.get("/users", response_model=UserAnalytics)
async def get_user_analytics(
    period: str = "month",
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter analytics de usuários."""
    try:
        # Calcular período
        if period == "day":
            start_date = datetime.utcnow() - timedelta(days=1)
        elif period == "week":
            start_date = datetime.utcnow() - timedelta(weeks=1)
        elif period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        # Total de usuários
        total_users = await db.users.count_documents({})
        
        # Novos usuários no período
        new_users = await db.users.count_documents({
            "created_at": {"$gte": start_date}
        })
        
        # Usuários ativos (com login recente)
        active_users = await db.users.count_documents({
            "last_login": {"$gte": datetime.utcnow() - timedelta(days=7)}
        })
        
        # Crescimento de usuários
        previous_period_start = start_date - (datetime.utcnow() - start_date)
        previous_period_users = await db.users.count_documents({
            "created_at": {"$gte": previous_period_start, "$lt": start_date}
        })
        user_growth = ((new_users - previous_period_users) / max(previous_period_users, 1)) * 100
        
        # Segmentos de usuários
        user_segments = {}
        segments = await db.users.aggregate([
            {"$group": {"_id": "$tipo_ativo", "count": {"$sum": 1}}}
        ]).to_list(None)
        for segment in segments:
            user_segments[segment["_id"]] = segment["count"]
        
        # Top cidades
        top_cities = await db.users.aggregate([
            {"$group": {"_id": "$endereco.cidade", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]).to_list(10)
        
        return UserAnalytics(
            total_users=total_users,
            new_users=new_users,
            active_users=active_users,
            user_growth=round(user_growth, 2),
            user_segments=user_segments,
            top_cities=[{"city": city["_id"], "count": city["count"]} for city in top_cities]
        )
    except Exception as e:
        logger.error(f"Erro ao obter analytics de usuários: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@analytics_router.get("/services", response_model=ServiceAnalytics)
async def get_service_analytics(
    period: str = "month",
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter analytics de serviços."""
    try:
        # Calcular período
        if period == "day":
            start_date = datetime.utcnow() - timedelta(days=1)
        elif period == "week":
            start_date = datetime.utcnow() - timedelta(weeks=1)
        elif period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        # Total de serviços
        total_services = await db.services.count_documents({})
        
        # Serviços ativos
        active_services = await db.services.count_documents({
            "ativo": True
        })
        
        # Categorias de serviços
        service_categories = {}
        categories = await db.services.aggregate([
            {"$group": {"_id": "$categoria", "count": {"$sum": 1}}}
        ]).to_list(None)
        for category in categories:
            service_categories[category["_id"]] = category["count"]
        
        # Média de avaliações
        avg_rating_pipeline = [
            {"$group": {"_id": None, "avg_rating": {"$avg": "$avaliacao_media"}}}
        ]
        avg_rating_result = await db.services.aggregate(avg_rating_pipeline).to_list(1)
        average_rating = avg_rating_result[0]["avg_rating"] if avg_rating_result else 0
        
        # Top serviços
        top_services = await db.services.find(
            {"ativo": True}
        ).sort("avaliacao_media", -1).limit(10).to_list(10)
        
        # Tendências de serviços
        service_trends = await db.services.aggregate([
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]).to_list(None)
        
        return ServiceAnalytics(
            total_services=total_services,
            active_services=active_services,
            service_categories=service_categories,
            average_rating=round(average_rating, 2),
            top_services=[
                {
                    "id": service["_id"],
                    "name": service["nome"],
                    "rating": service.get("avaliacao_media", 0),
                    "category": service.get("categoria", "")
                }
                for service in top_services
            ],
            service_trends=[
                {"date": trend["_id"], "count": trend["count"]}
                for trend in service_trends
            ]
        )
    except Exception as e:
        logger.error(f"Erro ao obter analytics de serviços: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@analytics_router.get("/bookings", response_model=BookingAnalytics)
async def get_booking_analytics(
    period: str = "month",
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter analytics de agendamentos."""
    try:
        # Calcular período
        if period == "day":
            start_date = datetime.utcnow() - timedelta(days=1)
        elif period == "week":
            start_date = datetime.utcnow() - timedelta(weeks=1)
        elif period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        # Total de agendamentos
        total_bookings = await db.bookings.count_documents({})
        
        # Agendamentos completados
        completed_bookings = await db.bookings.count_documents({
            "status": "completed"
        })
        
        # Agendamentos cancelados
        cancelled_bookings = await db.bookings.count_documents({
            "status": "cancelled"
        })
        
        # Taxa de sucesso
        booking_success_rate = (completed_bookings / max(total_bookings, 1)) * 100
        
        # Valor médio dos agendamentos
        avg_value_pipeline = [
            {"$group": {"_id": None, "avg_value": {"$avg": "$valor"}}}
        ]
        avg_value_result = await db.bookings.aggregate(avg_value_pipeline).to_list(1)
        average_booking_value = avg_value_result[0]["avg_value"] if avg_value_result else 0
        
        # Tendências de agendamentos
        booking_trends = await db.bookings.aggregate([
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]).to_list(None)
        
        # Horários de pico
        peak_hours = await db.bookings.aggregate([
            {"$group": {
                "_id": {"$hour": "$data_agendamento"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]).to_list(5)
        
        return BookingAnalytics(
            total_bookings=total_bookings,
            completed_bookings=completed_bookings,
            cancelled_bookings=cancelled_bookings,
            booking_success_rate=round(booking_success_rate, 2),
            average_booking_value=round(average_booking_value, 2),
            booking_trends=[
                {"date": trend["_id"], "count": trend["count"]}
                for trend in booking_trends
            ],
            peak_hours=[
                {"hour": hour["_id"], "count": hour["count"]}
                for hour in peak_hours
            ]
        )
    except Exception as e:
        logger.error(f"Erro ao obter analytics de agendamentos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@analytics_router.get("/revenue", response_model=RevenueAnalytics)
async def get_revenue_analytics(
    period: str = "month",
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter analytics de receita."""
    try:
        # Calcular período
        if period == "day":
            start_date = datetime.utcnow() - timedelta(days=1)
        elif period == "week":
            start_date = datetime.utcnow() - timedelta(weeks=1)
        elif period == "month":
            start_date = datetime.utcnow() - timedelta(days=30)
        else:
            start_date = datetime.utcnow() - timedelta(days=30)
        
        # Receita total
        total_revenue_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$valor"}}}
        ]
        total_revenue_result = await db.payments.aggregate(total_revenue_pipeline).to_list(1)
        total_revenue = total_revenue_result[0]["total"] if total_revenue_result else 0
        
        # Receita do período
        monthly_revenue_pipeline = [
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {"_id": None, "total": {"$sum": "$valor"}}}
        ]
        monthly_revenue_result = await db.payments.aggregate(monthly_revenue_pipeline).to_list(1)
        monthly_revenue = monthly_revenue_result[0]["total"] if monthly_revenue_result else 0
        
        # Crescimento da receita
        previous_period_start = start_date - (datetime.utcnow() - start_date)
        previous_revenue_pipeline = [
            {"$match": {"created_at": {"$gte": previous_period_start, "$lt": start_date}}},
            {"$group": {"_id": None, "total": {"$sum": "$valor"}}}
        ]
        previous_revenue_result = await db.payments.aggregate(previous_revenue_pipeline).to_list(1)
        previous_revenue = previous_revenue_result[0]["total"] if previous_revenue_result else 0
        
        revenue_growth = ((monthly_revenue - previous_revenue) / max(previous_revenue, 1)) * 100
        
        # Valor médio de transação
        avg_transaction_pipeline = [
            {"$group": {"_id": None, "avg": {"$avg": "$valor"}}}
        ]
        avg_transaction_result = await db.payments.aggregate(avg_transaction_pipeline).to_list(1)
        average_transaction_value = avg_transaction_result[0]["avg"] if avg_transaction_result else 0
        
        # Receita por categoria
        revenue_by_category = {}
        category_revenue = await db.payments.aggregate([
            {"$lookup": {
                "from": "bookings",
                "localField": "booking_id",
                "foreignField": "_id",
                "as": "booking"
            }},
            {"$unwind": "$booking"},
            {"$lookup": {
                "from": "services",
                "localField": "booking.service_id",
                "foreignField": "_id",
                "as": "service"
            }},
            {"$unwind": "$service"},
            {"$group": {
                "_id": "$service.categoria",
                "total": {"$sum": "$valor"}
            }}
        ]).to_list(None)
        
        for category in category_revenue:
            revenue_by_category[category["_id"]] = category["total"]
        
        # Métodos de pagamento
        payment_methods = {}
        payment_method_data = await db.payments.aggregate([
            {"$group": {
                "_id": "$metodo_pagamento",
                "total": {"$sum": "$valor"}
            }}
        ]).to_list(None)
        
        for method in payment_method_data:
            payment_methods[method["_id"]] = method["total"]
        
        # Tendências de receita
        revenue_trends = await db.payments.aggregate([
            {"$match": {"created_at": {"$gte": start_date}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "total": {"$sum": "$valor"}
            }},
            {"$sort": {"_id": 1}}
        ]).to_list(None)
        
        return RevenueAnalytics(
            total_revenue=round(total_revenue, 2),
            monthly_revenue=round(monthly_revenue, 2),
            revenue_growth=round(revenue_growth, 2),
            average_transaction_value=round(average_transaction_value, 2),
            revenue_by_category=revenue_by_category,
            payment_methods=payment_methods,
            revenue_trends=[
                {"date": trend["_id"], "total": trend["total"]}
                for trend in revenue_trends
            ]
        )
    except Exception as e:
        logger.error(f"Erro ao obter analytics de receita: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@analytics_router.get("/realtime", response_model=RealTimeMetrics)
async def get_realtime_metrics(
    db: AsyncIOMotorDatabase = Depends()
):
    """Obter métricas em tempo real."""
    try:
        # Usuários ativos (últimos 5 minutos)
        active_users = await db.users.count_documents({
            "last_activity": {"$gte": datetime.utcnow() - timedelta(minutes=5)}
        })
        
        # Agendamentos atuais
        current_bookings = await db.bookings.count_documents({
            "status": {"$in": ["pending", "confirmed", "in_progress"]}
        })
        
        # Receita de hoje
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        revenue_today_pipeline = [
            {"$match": {"created_at": {"$gte": today_start}}},
            {"$group": {"_id": None, "total": {"$sum": "$valor"}}}
        ]
        revenue_today_result = await db.payments.aggregate(revenue_today_pipeline).to_list(1)
        revenue_today = revenue_today_result[0]["total"] if revenue_today_result else 0
        
        return RealTimeMetrics(
            timestamp=datetime.utcnow(),
            active_users=active_users,
            current_bookings=current_bookings,
            system_load=0.0,  # Implementar métricas de sistema
            response_time=0.0,  # Implementar métricas de resposta
            error_count=0,  # Implementar contagem de erros
            revenue_today=round(revenue_today, 2)
        )
    except Exception as e:
        logger.error(f"Erro ao obter métricas em tempo real: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
