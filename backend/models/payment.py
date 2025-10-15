"""
Modelo de pagamento com Beanie ODM

Define a estrutura de pagamentos e transações financeiras.
"""
from beanie import Document, Indexed
from pydantic import Field, validator
from typing import Optional, Dict, Any
from datetime import datetime
from core.enums import PaymentStatus


class Payment(Document):
    """
    Modelo de pagamento com Beanie ODM

    Representa uma transação de pagamento no sistema,
    integrando com Mercado Pago e outros gateways.

    Settings:
        name: Nome da collection no MongoDB
        indexes: Índices automaticamente criados
    """

    # Relacionamentos
    booking_id: Indexed(str)  # ID do agendamento
    service_id: Indexed(str)  # ID do serviço
    prestador_id: Indexed(str)  # ID do prestador (recebe)
    morador_id: Indexed(str)  # ID do morador (paga)

    # Valores
    valor_servico: float = Field(gt=0)  # Valor do serviço
    taxa_plataforma: float = Field(default=0.0, ge=0)  # Taxa do Alça Hub (%)
    valor_taxa: float = Field(default=0.0, ge=0)  # Valor da taxa em R$
    valor_total: float = Field(gt=0)  # Valor total cobrado
    valor_prestador: float = Field(gt=0)  # Valor que o prestador recebe

    # Status e método
    status: PaymentStatus = PaymentStatus.PENDENTE
    metodo_pagamento: str  # "pix", "credito", "debito", "dinheiro", "mercadopago"

    # Integração com gateway (Mercado Pago)
    gateway_provider: Optional[str] = None  # "mercadopago", "stripe", etc
    gateway_payment_id: Optional[str] = None  # ID no gateway
    gateway_preference_id: Optional[str] = None  # ID da preferência/intent
    gateway_status: Optional[str] = None  # Status retornado pelo gateway
    gateway_response: Optional[Dict[str, Any]] = None  # Response completo do gateway

    # URLs para pagamento (geradas pelo gateway)
    payment_url: Optional[str] = None  # URL para checkout
    qr_code: Optional[str] = None  # QR Code para PIX
    qr_code_base64: Optional[str] = None  # QR Code em base64

    # Informações de confirmação
    data_pagamento: Optional[datetime] = None  # Quando foi pago
    data_confirmacao: Optional[datetime] = None  # Quando foi confirmado
    comprovante_url: Optional[str] = None  # URL do comprovante

    # Reembolso
    reembolsado: bool = False
    valor_reembolsado: Optional[float] = None
    motivo_reembolso: Optional[str] = None
    data_reembolso: Optional[datetime] = None
    gateway_reembolso_id: Optional[str] = None

    # Metadados e auditoria
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None  # Expiração do link de pagamento

    # Configuração do documento
    class Settings:
        name = "payments"
        indexes = [
            "booking_id",
            "service_id",
            "prestador_id",
            "morador_id",
            "status",
            "gateway_payment_id",
            [("morador_id", 1), ("status", 1)],  # Pagamentos por morador
            [("prestador_id", 1), ("status", 1)],  # Pagamentos por prestador
            [("created_at", -1)],  # Para ordenação por mais recente
            [("status", 1), ("created_at", -1)],  # Dashboard de pagamentos
        ]

    @validator("valor_taxa", always=True)
    def calculate_taxa(cls, v, values):
        """Calcula valor da taxa automaticamente"""
        if "valor_servico" in values and "taxa_plataforma" in values:
            return values["valor_servico"] * (values["taxa_plataforma"] / 100)
        return v

    @validator("valor_total", always=True)
    def calculate_total(cls, v, values):
        """Calcula valor total automaticamente"""
        if "valor_servico" in values and "valor_taxa" in values:
            return values["valor_servico"] + values["valor_taxa"]
        return v

    @validator("valor_prestador", always=True)
    def calculate_prestador_value(cls, v, values):
        """Calcula quanto o prestador recebe"""
        if "valor_servico" in values and "valor_taxa" in values:
            return values["valor_servico"] - values["valor_taxa"]
        return v

    # Métodos do modelo
    def is_pago(self) -> bool:
        """Verifica se pagamento foi concluído"""
        return self.status == PaymentStatus.PAGO

    def is_pendente(self) -> bool:
        """Verifica se pagamento está pendente"""
        return self.status == PaymentStatus.PENDENTE

    def is_cancelado(self) -> bool:
        """Verifica se pagamento foi cancelado"""
        return self.status == PaymentStatus.CANCELADO

    def is_expirado(self) -> bool:
        """Verifica se pagamento expirou"""
        if self.expires_at:
            return datetime.utcnow() > self.expires_at
        return False

    async def mark_as_paid(
        self,
        gateway_payment_id: Optional[str] = None,
        comprovante_url: Optional[str] = None
    ):
        """
        Marca pagamento como pago

        Args:
            gateway_payment_id: ID do pagamento no gateway
            comprovante_url: URL do comprovante
        """
        self.status = PaymentStatus.PAGO
        self.data_pagamento = datetime.utcnow()
        self.data_confirmacao = datetime.utcnow()

        if gateway_payment_id:
            self.gateway_payment_id = gateway_payment_id

        if comprovante_url:
            self.comprovante_url = comprovante_url

        self.updated_at = datetime.utcnow()
        await self.save()

    async def mark_as_processing(self):
        """Marca pagamento como processando"""
        self.status = PaymentStatus.PROCESSANDO
        self.updated_at = datetime.utcnow()
        await self.save()

    async def mark_as_failed(self, motivo: Optional[str] = None):
        """
        Marca pagamento como falho

        Args:
            motivo: Motivo da falha
        """
        self.status = PaymentStatus.FALHOU
        if motivo:
            if not self.metadata:
                self.metadata = {}
            self.metadata["failure_reason"] = motivo
        self.updated_at = datetime.utcnow()
        await self.save()

    async def cancel(self, motivo: Optional[str] = None):
        """
        Cancela pagamento

        Args:
            motivo: Motivo do cancelamento
        """
        if self.status == PaymentStatus.PAGO:
            raise ValueError("Pagamento já foi pago, use refund() para reembolsar")

        self.status = PaymentStatus.CANCELADO
        if motivo:
            if not self.metadata:
                self.metadata = {}
            self.metadata["cancellation_reason"] = motivo
        self.updated_at = datetime.utcnow()
        await self.save()

    async def refund(
        self,
        valor: Optional[float] = None,
        motivo: Optional[str] = None,
        gateway_reembolso_id: Optional[str] = None
    ):
        """
        Reembolsa pagamento

        Args:
            valor: Valor a reembolsar (None = total)
            motivo: Motivo do reembolso
            gateway_reembolso_id: ID do reembolso no gateway
        """
        if self.status != PaymentStatus.PAGO:
            raise ValueError("Apenas pagamentos pagos podem ser reembolsados")

        if self.reembolsado:
            raise ValueError("Pagamento já foi reembolsado")

        self.reembolsado = True
        self.valor_reembolsado = valor or self.valor_total
        self.motivo_reembolso = motivo
        self.data_reembolso = datetime.utcnow()
        self.gateway_reembolso_id = gateway_reembolso_id
        self.status = PaymentStatus.REEMBOLSADO
        self.updated_at = datetime.utcnow()
        await self.save()

    async def update_gateway_status(
        self,
        gateway_status: str,
        gateway_response: Optional[Dict[str, Any]] = None
    ):
        """
        Atualiza status do gateway

        Args:
            gateway_status: Novo status do gateway
            gateway_response: Response completo do gateway
        """
        self.gateway_status = gateway_status
        if gateway_response:
            self.gateway_response = gateway_response

        # Mapear status do gateway para status interno
        status_map = {
            "approved": PaymentStatus.PAGO,
            "pending": PaymentStatus.PENDENTE,
            "in_process": PaymentStatus.PROCESSANDO,
            "rejected": PaymentStatus.FALHOU,
            "cancelled": PaymentStatus.CANCELADO,
            "refunded": PaymentStatus.REEMBOLSADO,
        }

        if gateway_status in status_map:
            self.status = status_map[gateway_status]

            # Se foi aprovado, marcar data de pagamento
            if gateway_status == "approved" and not self.data_pagamento:
                self.data_pagamento = datetime.utcnow()
                self.data_confirmacao = datetime.utcnow()

        self.updated_at = datetime.utcnow()
        await self.save()

    def calculate_platform_revenue(self) -> float:
        """Calcula receita da plataforma (taxa)"""
        return self.valor_taxa if not self.reembolsado else 0.0

    def calculate_provider_revenue(self) -> float:
        """Calcula receita do prestador"""
        return self.valor_prestador if not self.reembolsado else 0.0

    def to_dict(self) -> dict:
        """Converte pagamento para dicionário"""
        return {
            "id": str(self.id),
            "booking_id": self.booking_id,
            "service_id": self.service_id,
            "prestador_id": self.prestador_id,
            "morador_id": self.morador_id,
            "valor_servico": self.valor_servico,
            "taxa_plataforma": self.taxa_plataforma,
            "valor_taxa": self.valor_taxa,
            "valor_total": self.valor_total,
            "valor_prestador": self.valor_prestador,
            "status": self.status.value,
            "metodo_pagamento": self.metodo_pagamento,
            "gateway_provider": self.gateway_provider,
            "gateway_payment_id": self.gateway_payment_id,
            "gateway_status": self.gateway_status,
            "payment_url": self.payment_url,
            "qr_code": self.qr_code,
            "data_pagamento": self.data_pagamento.isoformat() if self.data_pagamento else None,
            "data_confirmacao": self.data_confirmacao.isoformat() if self.data_confirmacao else None,
            "comprovante_url": self.comprovante_url,
            "reembolsado": self.reembolsado,
            "valor_reembolsado": self.valor_reembolsado,
            "motivo_reembolso": self.motivo_reembolso,
            "data_reembolso": self.data_reembolso.isoformat() if self.data_reembolso else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "is_expirado": self.is_expirado(),
            "platform_revenue": self.calculate_platform_revenue(),
            "provider_revenue": self.calculate_provider_revenue()
        }
