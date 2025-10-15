"""
Enums centralizados do sistema
"""
from enum import Enum


class UserType(str, Enum):
    """Tipos de usuário no sistema"""
    MORADOR = "morador"
    PRESTADOR = "prestador"
    ADMIN = "admin"


class ServiceStatus(str, Enum):
    """Status de um serviço"""
    DISPONIVEL = "disponivel"
    INDISPONIVEL = "indisponivel"


class BookingStatus(str, Enum):
    """Status de um agendamento"""
    PENDENTE = "pendente"
    CONFIRMADO = "confirmado"
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"
    CANCELADO = "cancelado"


class PaymentStatus(str, Enum):
    """Status de um pagamento"""
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    PAGO = "pago"
    FALHOU = "falhou"
    CANCELADO = "cancelado"
    REEMBOLSADO = "reembolsado"
