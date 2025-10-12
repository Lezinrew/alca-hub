# Serviço de Notificações - Alça Hub
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from ..notifications.manager import NotificationManager
from ..notifications.models import NotificationCreate, NotificationType, NotificationPriority

logger = logging.getLogger(__name__)


class NotificationService:
    """Serviço de notificações para eventos do sistema."""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.manager = NotificationManager(db)
    
    async def send_booking_notification(
        self, 
        user_id: str, 
        booking_id: str, 
        service_name: str,
        notification_type: str
    ):
        """Enviar notificação de agendamento."""
        try:
            if notification_type == "request":
                title = "Nova solicitação de serviço"
                message = f"Você recebeu uma nova solicitação para o serviço: {service_name}"
                priority = NotificationPriority.HIGH
            elif notification_type == "accepted":
                title = "Serviço aceito"
                message = f"Sua solicitação para {service_name} foi aceita!"
                priority = NotificationPriority.HIGH
            elif notification_type == "rejected":
                title = "Serviço rejeitado"
                message = f"Sua solicitação para {service_name} foi rejeitada."
                priority = NotificationPriority.MEDIUM
            elif notification_type == "cancelled":
                title = "Serviço cancelado"
                message = f"O serviço {service_name} foi cancelado."
                priority = NotificationPriority.MEDIUM
            else:
                return
            
            notification = NotificationCreate(
                user_id=user_id,
                type=NotificationType.BOOKING_REQUEST if notification_type == "request" else NotificationType.BOOKING_ACCEPTED,
                title=title,
                message=message,
                priority=priority,
                data={
                    "booking_id": booking_id,
                    "service_name": service_name,
                    "type": notification_type
                }
            )
            
            await self.manager.send_notification(notification)
            logger.info(f"Notificação de agendamento enviada para {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de agendamento: {e}")
    
    async def send_payment_notification(
        self, 
        user_id: str, 
        amount: float, 
        status: str,
        transaction_id: str
    ):
        """Enviar notificação de pagamento."""
        try:
            if status == "success":
                title = "Pagamento confirmado"
                message = f"Seu pagamento de R$ {amount:.2f} foi processado com sucesso!"
                priority = NotificationPriority.HIGH
                notification_type = NotificationType.PAYMENT_RECEIVED
            elif status == "failed":
                title = "Pagamento falhou"
                message = f"O pagamento de R$ {amount:.2f} não pôde ser processado."
                priority = NotificationPriority.HIGH
                notification_type = NotificationType.PAYMENT_FAILED
            else:
                return
            
            notification = NotificationCreate(
                user_id=user_id,
                type=notification_type,
                title=title,
                message=message,
                priority=priority,
                data={
                    "amount": amount,
                    "transaction_id": transaction_id,
                    "status": status
                }
            )
            
            await self.manager.send_notification(notification)
            logger.info(f"Notificação de pagamento enviada para {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de pagamento: {e}")
    
    async def send_rating_notification(
        self, 
        user_id: str, 
        rating: int,
        reviewer_name: str
    ):
        """Enviar notificação de avaliação."""
        try:
            title = "Nova avaliação recebida"
            message = f"{reviewer_name} avaliou seu serviço com {rating} estrelas!"
            
            notification = NotificationCreate(
                user_id=user_id,
                type=NotificationType.RATING_RECEIVED,
                title=title,
                message=message,
                priority=NotificationPriority.MEDIUM,
                data={
                    "rating": rating,
                    "reviewer_name": reviewer_name
                }
            )
            
            await self.manager.send_notification(notification)
            logger.info(f"Notificação de avaliação enviada para {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao enviar notificação de avaliação: {e}")
    
    async def send_system_announcement(
        self, 
        user_ids: List[str], 
        title: str, 
        message: str,
        priority: NotificationPriority = NotificationPriority.MEDIUM
    ):
        """Enviar anúncio do sistema."""
        try:
            notification = NotificationCreate(
                user_id="",  # Será definido para cada usuário
                type=NotificationType.SYSTEM_ANNOUNCEMENT,
                title=title,
                message=message,
                priority=priority,
                data={
                    "announcement": True,
                    "system_generated": True
                }
            )
            
            # Enviar para todos os usuários
            await self.manager.send_bulk_notification(user_ids, notification)
            logger.info(f"Anúncio do sistema enviado para {len(user_ids)} usuários")
            
        except Exception as e:
            logger.error(f"Erro ao enviar anúncio do sistema: {e}")
    
    async def send_security_alert(
        self, 
        user_id: str, 
        alert_type: str, 
        description: str
    ):
        """Enviar alerta de segurança."""
        try:
            title = "Alerta de Segurança"
            message = f"Atividade suspeita detectada: {description}"
            
            notification = NotificationCreate(
                user_id=user_id,
                type=NotificationType.SECURITY_ALERT,
                title=title,
                message=message,
                priority=NotificationPriority.URGENT,
                data={
                    "alert_type": alert_type,
                    "description": description,
                    "timestamp": datetime.utcnow().isoformat()
                }
            )
            
            await self.manager.send_notification(notification)
            logger.info(f"Alerta de segurança enviado para {user_id}")
            
        except Exception as e:
            logger.error(f"Erro ao enviar alerta de segurança: {e}")
    
    async def cleanup_old_notifications(self, days: int = 30):
        """Limpar notificações antigas."""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            result = await self.db.notifications.delete_many({
                "created_at": {"$lt": cutoff_date},
                "type": {"$ne": NotificationType.SYSTEM_ANNOUNCEMENT.value}
            })
            
            logger.info(f"Removidas {result.deleted_count} notificações antigas")
            return result.deleted_count
            
        except Exception as e:
            logger.error(f"Erro na limpeza de notificações: {e}")
            return 0
