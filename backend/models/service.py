"""
Modelo de serviço com Beanie ODM

Define a estrutura de serviços oferecidos por prestadores no Alça Hub.
"""
from beanie import Document, Indexed, Link
from pydantic import Field, validator
from typing import List, Optional
from datetime import datetime
from core.enums import ServiceStatus


class Service(Document):
    """
    Modelo de serviço com Beanie ODM

    Um serviço representa uma oferta de trabalho por um prestador,
    com categoria, preço, e disponibilidade.

    Settings:
        name: Nome da collection no MongoDB
        indexes: Índices automaticamente criados
    """

    # Relacionamento com prestador (usuário)
    prestador_id: Indexed(str)  # ID do prestador que oferece o serviço

    # Informações básicas do serviço
    titulo: str
    descricao: str
    categoria: Indexed(str)  # Ex: "limpeza", "eletricista", "encanador"
    subcategoria: Optional[str] = None

    # Preço e duração
    preco_base: float = Field(gt=0)  # Preço base (R$)
    preco_minimo: Optional[float] = None  # Preço mínimo negociável
    preco_maximo: Optional[float] = None  # Preço máximo
    duracao_estimada: Optional[int] = None  # Duração em minutos

    # Status e disponibilidade
    status: ServiceStatus = ServiceStatus.DISPONIVEL
    ativo: bool = True

    # Localização (herdada do prestador, mas pode ser específica)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    raio_atendimento_km: float = Field(default=10.0, ge=0, le=100)  # Raio de atendimento

    # Informações adicionais
    tags: List[str] = Field(default_factory=list)  # Tags para busca
    fotos_urls: List[str] = Field(default_factory=list)  # URLs de fotos do serviço

    # Métricas e avaliações
    total_agendamentos: int = Field(default=0, ge=0)
    total_concluidos: int = Field(default=0, ge=0)
    avaliacao_media: float = Field(default=0.0, ge=0.0, le=5.0)
    total_avaliacoes: int = Field(default=0, ge=0)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    ultima_reserva: Optional[datetime] = None

    # Configuração do documento
    class Settings:
        name = "services"
        indexes = [
            "prestador_id",
            "categoria",
            "status",
            [("categoria", 1), ("ativo", 1)],  # Índice composto
            [("prestador_id", 1), ("ativo", 1)],
            [("latitude", "2dsphere"), ("longitude", "2dsphere")],  # Índice geoespacial
            [("avaliacao_media", -1)],  # Para ordenação por melhor avaliado
        ]

    @validator("preco_minimo", "preco_maximo")
    def validate_prices(cls, v, values):
        """Valida que preços mínimo/máximo são consistentes com preço base"""
        if v is not None and "preco_base" in values:
            preco_base = values["preco_base"]
            if v < 0:
                raise ValueError("Preço não pode ser negativo")
        return v

    # Métodos do modelo
    def is_disponivel(self) -> bool:
        """Verifica se serviço está disponível"""
        return self.ativo and self.status == ServiceStatus.DISPONIVEL

    async def soft_delete(self):
        """Soft delete do serviço"""
        self.ativo = False
        self.updated_at = datetime.utcnow()
        await self.save()

    async def increment_booking(self):
        """Incrementa contador de agendamentos"""
        self.total_agendamentos += 1
        self.ultima_reserva = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    async def complete_booking(self):
        """Marca um agendamento como concluído"""
        self.total_concluidos += 1
        self.updated_at = datetime.utcnow()
        await self.save()

    async def update_rating(self, new_rating: float):
        """
        Atualiza avaliação média com nova avaliação

        Args:
            new_rating: Nova avaliação (0-5)
        """
        if not 0 <= new_rating <= 5:
            raise ValueError("Avaliação deve estar entre 0 e 5")

        # Calcula nova média ponderada
        total = self.avaliacao_media * self.total_avaliacoes
        self.total_avaliacoes += 1
        self.avaliacao_media = (total + new_rating) / self.total_avaliacoes
        self.updated_at = datetime.utcnow()
        await self.save()

    def calculate_price_range(self) -> dict:
        """Calcula range de preço do serviço"""
        return {
            "minimo": self.preco_minimo or self.preco_base,
            "base": self.preco_base,
            "maximo": self.preco_maximo or self.preco_base
        }

    def to_dict(self) -> dict:
        """Converte serviço para dicionário"""
        return {
            "id": str(self.id),
            "prestador_id": self.prestador_id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "categoria": self.categoria,
            "subcategoria": self.subcategoria,
            "preco_base": self.preco_base,
            "preco_range": self.calculate_price_range(),
            "duracao_estimada": self.duracao_estimada,
            "status": self.status.value,
            "ativo": self.ativo,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "raio_atendimento_km": self.raio_atendimento_km,
            "tags": self.tags,
            "fotos_urls": self.fotos_urls,
            "total_agendamentos": self.total_agendamentos,
            "total_concluidos": self.total_concluidos,
            "avaliacao_media": round(self.avaliacao_media, 2),
            "total_avaliacoes": self.total_avaliacoes,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "ultima_reserva": self.ultima_reserva.isoformat() if self.ultima_reserva else None
        }
