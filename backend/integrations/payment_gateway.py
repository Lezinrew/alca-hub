# Integração com Gateway de Pagamento - Alça Hub
import asyncio
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class PaymentStatus(Enum):
    """Status do pagamento."""
    PENDING = "pending"
    PROCESSING = "processing"
    APPROVED = "approved"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class PaymentMethod(Enum):
    """Métodos de pagamento."""
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PIX = "pix"
    BOLETO = "boleto"
    PAYPAL = "paypal"


@dataclass
class PaymentRequest:
    """Requisição de pagamento."""
    amount: float
    currency: str = "BRL"
    payment_method: PaymentMethod
    customer_id: str
    order_id: str
    description: str
    metadata: Dict[str, Any] = None


@dataclass
class PaymentResponse:
    """Resposta do pagamento."""
    payment_id: str
    status: PaymentStatus
    amount: float
    currency: str
    payment_method: PaymentMethod
    transaction_id: Optional[str] = None
    authorization_code: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = None


class PaymentGateway:
    """Gateway de pagamento integrado."""
    
    def __init__(self, api_key: str, environment: str = "sandbox"):
        self.api_key = api_key
        self.environment = environment
        self.base_url = self._get_base_url()
        self.session = None
    
    def _get_base_url(self) -> str:
        """Obter URL base do gateway."""
        if self.environment == "production":
            return "https://api.payment-gateway.com"
        else:
            return "https://sandbox-api.payment-gateway.com"
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Obter sessão HTTP."""
        if not self.session:
            self.session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
        return self.session
    
    async def create_payment(self, payment_request: PaymentRequest) -> PaymentResponse:
        """Criar pagamento."""
        try:
            session = await self._get_session()
            
            payload = {
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "payment_method": payment_request.payment_method.value,
                "customer_id": payment_request.customer_id,
                "order_id": payment_request.order_id,
                "description": payment_request.description,
                "metadata": payment_request.metadata or {}
            }
            
            async with session.post(f"{self.base_url}/payments", json=payload) as response:
                data = await response.json()
                
                if response.status == 201:
                    return PaymentResponse(
                        payment_id=data["id"],
                        status=PaymentStatus(data["status"]),
                        amount=data["amount"],
                        currency=data["currency"],
                        payment_method=PaymentMethod(data["payment_method"]),
                        transaction_id=data.get("transaction_id"),
                        authorization_code=data.get("authorization_code"),
                        created_at=datetime.utcnow()
                    )
                else:
                    return PaymentResponse(
                        payment_id="",
                        status=PaymentStatus.DECLINED,
                        amount=payment_request.amount,
                        currency=payment_request.currency,
                        payment_method=payment_request.payment_method,
                        error_message=data.get("error", "Payment failed")
                    )
        
        except Exception as e:
            logger.error(f"Erro ao criar pagamento: {e}")
            return PaymentResponse(
                payment_id="",
                status=PaymentStatus.DECLINED,
                amount=payment_request.amount,
                currency=payment_request.currency,
                payment_method=payment_request.payment_method,
                error_message=str(e)
            )
    
    async def get_payment_status(self, payment_id: str) -> PaymentResponse:
        """Obter status do pagamento."""
        try:
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/payments/{payment_id}") as response:
                data = await response.json()
                
                if response.status == 200:
                    return PaymentResponse(
                        payment_id=data["id"],
                        status=PaymentStatus(data["status"]),
                        amount=data["amount"],
                        currency=data["currency"],
                        payment_method=PaymentMethod(data["payment_method"]),
                        transaction_id=data.get("transaction_id"),
                        authorization_code=data.get("authorization_code"),
                        created_at=datetime.fromisoformat(data["created_at"])
                    )
                else:
                    return PaymentResponse(
                        payment_id=payment_id,
                        status=PaymentStatus.DECLINED,
                        amount=0,
                        currency="BRL",
                        payment_method=PaymentMethod.CREDIT_CARD,
                        error_message=data.get("error", "Payment not found")
                    )
        
        except Exception as e:
            logger.error(f"Erro ao obter status do pagamento: {e}")
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.DECLINED,
                amount=0,
                currency="BRL",
                payment_method=PaymentMethod.CREDIT_CARD,
                error_message=str(e)
            )
    
    async def refund_payment(self, payment_id: str, amount: Optional[float] = None) -> PaymentResponse:
        """Estornar pagamento."""
        try:
            session = await self._get_session()
            
            payload = {}
            if amount:
                payload["amount"] = amount
            
            async with session.post(f"{self.base_url}/payments/{payment_id}/refund", json=payload) as response:
                data = await response.json()
                
                if response.status == 200:
                    return PaymentResponse(
                        payment_id=data["id"],
                        status=PaymentStatus.REFUNDED,
                        amount=data.get("refund_amount", amount or 0),
                        currency=data["currency"],
                        payment_method=PaymentMethod(data["payment_method"]),
                        transaction_id=data.get("transaction_id"),
                        created_at=datetime.utcnow()
                    )
                else:
                    return PaymentResponse(
                        payment_id=payment_id,
                        status=PaymentStatus.DECLINED,
                        amount=0,
                        currency="BRL",
                        payment_method=PaymentMethod.CREDIT_CARD,
                        error_message=data.get("error", "Refund failed")
                    )
        
        except Exception as e:
            logger.error(f"Erro ao estornar pagamento: {e}")
            return PaymentResponse(
                payment_id=payment_id,
                status=PaymentStatus.DECLINED,
                amount=0,
                currency="BRL",
                payment_method=PaymentMethod.CREDIT_CARD,
                error_message=str(e)
            )
    
    async def get_payment_methods(self) -> List[Dict[str, Any]]:
        """Obter métodos de pagamento disponíveis."""
        try:
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/payment-methods") as response:
                data = await response.json()
                
                if response.status == 200:
                    return data.get("methods", [])
                else:
                    return []
        
        except Exception as e:
            logger.error(f"Erro ao obter métodos de pagamento: {e}")
            return []
    
    async def validate_card(self, card_number: str, cvv: str, expiry_date: str) -> bool:
        """Validar cartão de crédito."""
        try:
            session = await self._get_session()
            
            payload = {
                "card_number": card_number,
                "cvv": cvv,
                "expiry_date": expiry_date
            }
            
            async with session.post(f"{self.base_url}/validate-card", json=payload) as response:
                data = await response.json()
                return response.status == 200 and data.get("valid", False)
        
        except Exception as e:
            logger.error(f"Erro ao validar cartão: {e}")
            return False
    
    async def close(self):
        """Fechar sessão."""
        if self.session:
            await self.session.close()


class PaymentService:
    """Serviço de pagamento integrado."""
    
    def __init__(self, gateway: PaymentGateway):
        self.gateway = gateway
    
    async def process_booking_payment(
        self, 
        user_id: str, 
        booking_id: str, 
        amount: float,
        payment_method: PaymentMethod
    ) -> PaymentResponse:
        """Processar pagamento de agendamento."""
        payment_request = PaymentRequest(
            amount=amount,
            payment_method=payment_method,
            customer_id=user_id,
            order_id=booking_id,
            description=f"Pagamento do agendamento {booking_id}",
            metadata={
                "booking_id": booking_id,
                "user_id": user_id,
                "service_type": "booking"
            }
        )
        
        return await self.gateway.create_payment(payment_request)
    
    async def process_refund(
        self, 
        payment_id: str, 
        reason: str = "Cancellation"
    ) -> PaymentResponse:
        """Processar estorno."""
        return await self.gateway.refund_payment(payment_id)
    
    async def get_payment_history(self, user_id: str) -> List[PaymentResponse]:
        """Obter histórico de pagamentos do usuário."""
        # Implementar busca de pagamentos por usuário
        # Por enquanto, retornar lista vazia
        return []
