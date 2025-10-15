"""
Modelo de agendamento com Beanie ODM

Define a estrutura de agendamentos entre moradores e prestadores.
"""
from beanie import Document, Indexed
from pydantic import Field, validator
from typing import Optional
from datetime import datetime, timedelta
from core.enums import BookingStatus


class Booking(Document):
    """
    Modelo de agendamento com Beanie ODM

    Representa um agendamento de serviço entre morador e prestador.

    Settings:
        name: Nome da collection no MongoDB
        indexes: Índices automaticamente criados
    """

    # Relacionamentos
    service_id: Indexed(str)  # ID do serviço agendado
    prestador_id: Indexed(str)  # ID do prestador
    morador_id: Indexed(str)  # ID do morador que agendou

    # Informações do agendamento
    data_agendamento: datetime  # Data/hora do agendamento
    horario_inicio: str  # HH:MM formato 24h
    horario_fim: str  # HH:MM formato 24h
    duracao_minutos: Optional[int] = None  # Calculado automaticamente

    # Status do agendamento
    status: BookingStatus = BookingStatus.PENDENTE

    # Localização do serviço
    endereco: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    complemento: Optional[str] = None

    # Detalhes e observações
    observacoes: Optional[str] = None
    valor_acordado: Optional[float] = None  # Pode ser diferente do preço base
    forma_pagamento: Optional[str] = None  # "dinheiro", "pix", "cartao", "app"

    # Confirmação e feedback
    confirmado_prestador: bool = False
    confirmado_morador: bool = False
    data_confirmacao: Optional[datetime] = None

    # Avaliação
    avaliacao_prestador: Optional[float] = None  # 0-5 estrelas
    avaliacao_morador: Optional[float] = None  # 0-5 estrelas
    comentario_prestador: Optional[str] = None
    comentario_morador: Optional[str] = None
    data_avaliacao: Optional[datetime] = None

    # Cancelamento
    cancelado_por: Optional[str] = None  # "morador" ou "prestador"
    motivo_cancelamento: Optional[str] = None
    data_cancelamento: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    concluido_at: Optional[datetime] = None

    # Configuração do documento
    class Settings:
        name = "bookings"
        indexes = [
            "service_id",
            "prestador_id",
            "morador_id",
            "status",
            "data_agendamento",
            [("prestador_id", 1), ("status", 1)],  # Agendamentos por prestador
            [("morador_id", 1), ("status", 1)],  # Agendamentos por morador
            [("data_agendamento", 1), ("status", 1)],  # Agendamentos por data
            [("status", 1), ("data_agendamento", 1)],  # Para dashboard
        ]

    @validator("horario_inicio", "horario_fim")
    def validate_time_format(cls, v):
        """Valida formato HH:MM"""
        if v:
            try:
                hour, minute = map(int, v.split(":"))
                if not (0 <= hour < 24 and 0 <= minute < 60):
                    raise ValueError
            except (ValueError, AttributeError):
                raise ValueError("Horário deve estar no formato HH:MM (24h)")
        return v

    @validator("avaliacao_prestador", "avaliacao_morador")
    def validate_rating(cls, v):
        """Valida que avaliação está entre 0 e 5"""
        if v is not None and not (0 <= v <= 5):
            raise ValueError("Avaliação deve estar entre 0 e 5")
        return v

    # Métodos do modelo
    def is_confirmado(self) -> bool:
        """Verifica se agendamento está confirmado por ambas as partes"""
        return self.confirmado_prestador and self.confirmado_morador

    def is_cancelado(self) -> bool:
        """Verifica se agendamento foi cancelado"""
        return self.status == BookingStatus.CANCELADO

    def is_concluido(self) -> bool:
        """Verifica se agendamento foi concluído"""
        return self.status == BookingStatus.CONCLUIDO

    def can_cancel(self) -> bool:
        """Verifica se agendamento pode ser cancelado"""
        # Não pode cancelar se já concluído
        if self.status == BookingStatus.CONCLUIDO:
            return False
        # Não pode cancelar se já foi cancelado
        if self.status == BookingStatus.CANCELADO:
            return False
        return True

    def can_rate(self) -> bool:
        """Verifica se agendamento pode receber avaliação"""
        return self.status == BookingStatus.CONCLUIDO

    async def confirm(self, by: str):
        """
        Confirma agendamento por uma das partes

        Args:
            by: "prestador" ou "morador"
        """
        if by == "prestador":
            self.confirmado_prestador = True
        elif by == "morador":
            self.confirmado_morador = True
        else:
            raise ValueError("Confirmação deve ser por 'prestador' ou 'morador'")

        # Se ambos confirmaram, atualizar status
        if self.confirmado_prestador and self.confirmado_morador:
            self.status = BookingStatus.CONFIRMADO
            self.data_confirmacao = datetime.utcnow()

        self.updated_at = datetime.utcnow()
        await self.save()

    async def start(self):
        """Inicia execução do serviço"""
        if self.status != BookingStatus.CONFIRMADO:
            raise ValueError("Agendamento deve estar confirmado para iniciar")

        self.status = BookingStatus.EM_ANDAMENTO
        self.updated_at = datetime.utcnow()
        await self.save()

    async def complete(self):
        """Marca agendamento como concluído"""
        if self.status != BookingStatus.EM_ANDAMENTO:
            raise ValueError("Agendamento deve estar em andamento para concluir")

        self.status = BookingStatus.CONCLUIDO
        self.concluido_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    async def cancel(self, by: str, motivo: Optional[str] = None):
        """
        Cancela agendamento

        Args:
            by: "prestador" ou "morador"
            motivo: Motivo do cancelamento
        """
        if not self.can_cancel():
            raise ValueError("Agendamento não pode ser cancelado")

        self.status = BookingStatus.CANCELADO
        self.cancelado_por = by
        self.motivo_cancelamento = motivo
        self.data_cancelamento = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    async def rate(
        self,
        by: str,
        rating: float,
        comentario: Optional[str] = None
    ):
        """
        Adiciona avaliação ao agendamento

        Args:
            by: "prestador" ou "morador"
            rating: Avaliação 0-5
            comentario: Comentário opcional
        """
        if not self.can_rate():
            raise ValueError("Agendamento deve estar concluído para avaliar")

        if not (0 <= rating <= 5):
            raise ValueError("Avaliação deve estar entre 0 e 5")

        if by == "prestador":
            self.avaliacao_prestador = rating
            self.comentario_prestador = comentario
        elif by == "morador":
            self.avaliacao_morador = rating
            self.comentario_morador = comentario
        else:
            raise ValueError("Avaliação deve ser por 'prestador' ou 'morador'")

        self.data_avaliacao = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    def calculate_duration(self) -> int:
        """Calcula duração em minutos entre horário_inicio e horario_fim"""
        if not self.horario_inicio or not self.horario_fim:
            return 0

        start_hour, start_min = map(int, self.horario_inicio.split(":"))
        end_hour, end_min = map(int, self.horario_fim.split(":"))

        start_minutes = start_hour * 60 + start_min
        end_minutes = end_hour * 60 + end_min

        return end_minutes - start_minutes if end_minutes > start_minutes else 0

    def is_upcoming(self) -> bool:
        """Verifica se agendamento é futuro"""
        return self.data_agendamento > datetime.utcnow()

    def is_past(self) -> bool:
        """Verifica se agendamento é passado"""
        return self.data_agendamento < datetime.utcnow()

    def to_dict(self) -> dict:
        """Converte agendamento para dicionário"""
        return {
            "id": str(self.id),
            "service_id": self.service_id,
            "prestador_id": self.prestador_id,
            "morador_id": self.morador_id,
            "data_agendamento": self.data_agendamento.isoformat(),
            "horario_inicio": self.horario_inicio,
            "horario_fim": self.horario_fim,
            "duracao_minutos": self.calculate_duration(),
            "status": self.status.value,
            "endereco": self.endereco,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "complemento": self.complemento,
            "observacoes": self.observacoes,
            "valor_acordado": self.valor_acordado,
            "forma_pagamento": self.forma_pagamento,
            "confirmado_prestador": self.confirmado_prestador,
            "confirmado_morador": self.confirmado_morador,
            "data_confirmacao": self.data_confirmacao.isoformat() if self.data_confirmacao else None,
            "avaliacao_prestador": self.avaliacao_prestador,
            "avaliacao_morador": self.avaliacao_morador,
            "comentario_prestador": self.comentario_prestador,
            "comentario_morador": self.comentario_morador,
            "data_avaliacao": self.data_avaliacao.isoformat() if self.data_avaliacao else None,
            "cancelado_por": self.cancelado_por,
            "motivo_cancelamento": self.motivo_cancelamento,
            "data_cancelamento": self.data_cancelamento.isoformat() if self.data_cancelamento else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "concluido_at": self.concluido_at.isoformat() if self.concluido_at else None,
            "is_upcoming": self.is_upcoming(),
            "is_past": self.is_past()
        }
