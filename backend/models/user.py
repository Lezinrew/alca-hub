"""
Modelo de usuário com Beanie ODM

Define a estrutura de usuários (moradores, prestadores e admins) no Alça Hub.
"""
from beanie import Document, Indexed
from pydantic import Field, EmailStr, validator
from typing import List, Optional
from datetime import datetime
from core.enums import UserType


class User(Document):
    """
    Modelo de usuário com Beanie ODM

    Representa um usuário no sistema, podendo ser morador, prestador ou admin.

    Settings:
        name: Nome da collection no MongoDB
        indexes: Índices automaticamente criados
    """

    # Identificação básica
    email: Indexed(EmailStr, unique=True)
    senha: str  # Hash da senha (bcrypt)
    nome: str
    cpf: Indexed(str, unique=True)
    telefone: str

    # Endereço
    endereco: str
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    cep: Optional[str] = None

    # Geolocalização (para prestadores)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Tipos de usuário (pode ser mais de um)
    tipos: List[UserType] = Field(default_factory=lambda: [UserType.MORADOR])
    tipo_ativo: UserType = UserType.MORADOR  # Tipo atualmente selecionado

    # Status
    ativo: bool = True
    email_verificado: bool = False
    telefone_verificado: bool = False

    # Perfil de prestador (se aplicável)
    prestador_info: Optional[dict] = None  # {categorias: [], descricao: "", disponivel: bool}
    prestador_aprovado: bool = False
    prestador_documentos_verificados: bool = False

    # Avaliações (para prestadores)
    avaliacao_media: float = Field(default=0.0, ge=0.0, le=5.0)
    total_avaliacoes: int = Field(default=0, ge=0)

    # Estatísticas
    total_servicos_prestados: int = Field(default=0, ge=0)
    total_servicos_contratados: int = Field(default=0, ge=0)

    # Termos e políticas
    aceitou_termos: bool = False
    aceitou_termos_em: Optional[datetime] = None
    aceitou_politica_privacidade: bool = False

    # Login tracking
    ultimo_login: Optional[datetime] = None
    tentativas_login: int = Field(default=0, ge=0)
    conta_bloqueada: bool = False
    bloqueado_ate: Optional[datetime] = None

    # Token blacklist (para logout)
    tokens_blacklist: List[str] = Field(default_factory=list)

    # Metadata
    ip_cadastro: Optional[str] = None
    user_agent_cadastro: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = None

    # Configuração do documento
    class Settings:
        name = "users"
        indexes = [
            "email",
            "cpf",
            "tipos",
            "tipo_ativo",
            [("email", 1), ("ativo", 1)],  # Índice composto
            [("cpf", 1), ("ativo", 1)],
            [("tipos", 1), ("ativo", 1)],
            [("latitude", "2dsphere"), ("longitude", "2dsphere")],  # Geoespacial
        ]

    @validator("cpf")
    def validate_cpf(cls, v):
        """Valida formato do CPF (apenas números)"""
        if v:
            # Remove caracteres não numéricos
            cpf_clean = ''.join(filter(str.isdigit, v))
            if len(cpf_clean) != 11:
                raise ValueError("CPF deve ter 11 dígitos")
            return cpf_clean
        return v

    @validator("tipos")
    def validate_tipos(cls, v):
        """Valida que tem pelo menos um tipo"""
        if not v or len(v) == 0:
            raise ValueError("Usuário deve ter pelo menos um tipo")
        return v

    @validator("tipo_ativo")
    def validate_tipo_ativo(cls, v, values):
        """Valida que tipo_ativo está em tipos"""
        if "tipos" in values and v not in values["tipos"]:
            raise ValueError("tipo_ativo deve estar presente em tipos")
        return v

    # Métodos do modelo
    def is_prestador(self) -> bool:
        """Verifica se usuário é prestador"""
        return UserType.PRESTADOR in self.tipos

    def is_morador(self) -> bool:
        """Verifica se usuário é morador"""
        return UserType.MORADOR in self.tipos

    def is_admin(self) -> bool:
        """Verifica se usuário é admin"""
        return UserType.ADMIN in self.tipos

    def is_conta_bloqueada(self) -> bool:
        """Verifica se conta está bloqueada"""
        if not self.conta_bloqueada:
            return False

        # Se tem data de bloqueio, verificar se ainda está no período
        if self.bloqueado_ate:
            return datetime.utcnow() < self.bloqueado_ate

        return True

    async def bloquear_conta(self, duracao_horas: int = 24):
        """
        Bloqueia conta temporariamente

        Args:
            duracao_horas: Duração do bloqueio em horas
        """
        from datetime import timedelta

        self.conta_bloqueada = True
        self.bloqueado_ate = datetime.utcnow() + timedelta(hours=duracao_horas)
        self.updated_at = datetime.utcnow()
        await self.save()

    async def desbloquear_conta(self):
        """Desbloqueia conta"""
        self.conta_bloqueada = False
        self.bloqueado_ate = None
        self.tentativas_login = 0
        self.updated_at = datetime.utcnow()
        await self.save()

    async def incrementar_tentativas_login(self):
        """Incrementa contador de tentativas de login"""
        self.tentativas_login += 1
        self.updated_at = datetime.utcnow()

        # Bloquear após 5 tentativas
        if self.tentativas_login >= 5:
            await self.bloquear_conta(duracao_horas=1)
        else:
            await self.save()

    async def reset_tentativas_login(self):
        """Reseta contador de tentativas de login"""
        self.tentativas_login = 0
        self.ultimo_login = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    async def adicionar_token_blacklist(self, token: str):
        """
        Adiciona token à blacklist (logout)

        Args:
            token: Token JWT a ser invalidado
        """
        if token not in self.tokens_blacklist:
            self.tokens_blacklist.append(token)
            self.updated_at = datetime.utcnow()
            await self.save()

    def token_esta_blacklist(self, token: str) -> bool:
        """Verifica se token está na blacklist"""
        return token in self.tokens_blacklist

    async def soft_delete(self):
        """Soft delete do usuário (LGPD)"""
        self.ativo = False
        self.deleted_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        await self.save()

    async def update_avaliacao(self, nova_avaliacao: float):
        """
        Atualiza avaliação média com nova avaliação (apenas para prestadores)

        Args:
            nova_avaliacao: Nova avaliação (0-5)
        """
        if not self.is_prestador():
            raise ValueError("Apenas prestadores podem receber avaliações")

        if not 0 <= nova_avaliacao <= 5:
            raise ValueError("Avaliação deve estar entre 0 e 5")

        # Calcula nova média ponderada
        total = self.avaliacao_media * self.total_avaliacoes
        self.total_avaliacoes += 1
        self.avaliacao_media = (total + nova_avaliacao) / self.total_avaliacoes
        self.updated_at = datetime.utcnow()
        await self.save()

    async def trocar_tipo_ativo(self, novo_tipo: UserType):
        """
        Troca o tipo ativo do usuário

        Args:
            novo_tipo: Novo tipo a ser ativado
        """
        if novo_tipo not in self.tipos:
            raise ValueError(f"Usuário não possui o tipo {novo_tipo.value}")

        self.tipo_ativo = novo_tipo
        self.updated_at = datetime.utcnow()
        await self.save()

    async def adicionar_tipo(self, novo_tipo: UserType):
        """
        Adiciona novo tipo ao usuário

        Args:
            novo_tipo: Tipo a ser adicionado
        """
        if novo_tipo not in self.tipos:
            self.tipos.append(novo_tipo)
            self.updated_at = datetime.utcnow()
            await self.save()

    def to_dict(self, include_sensitive: bool = False) -> dict:
        """
        Converte usuário para dicionário

        Args:
            include_sensitive: Se True, inclui dados sensíveis (senha, tokens)
        """
        data = {
            "id": str(self.id),
            "email": self.email,
            "nome": self.nome,
            "cpf": self.cpf,
            "telefone": self.telefone,
            "endereco": self.endereco,
            "complemento": self.complemento,
            "cidade": self.cidade,
            "estado": self.estado,
            "cep": self.cep,
            "tipos": [t.value for t in self.tipos],
            "tipo_ativo": self.tipo_ativo.value,
            "ativo": self.ativo,
            "email_verificado": self.email_verificado,
            "telefone_verificado": self.telefone_verificado,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
        }

        # Dados de prestador
        if self.is_prestador():
            data.update({
                "prestador_info": self.prestador_info,
                "prestador_aprovado": self.prestador_aprovado,
                "prestador_documentos_verificados": self.prestador_documentos_verificados,
                "avaliacao_media": round(self.avaliacao_media, 2),
                "total_avaliacoes": self.total_avaliacoes,
                "total_servicos_prestados": self.total_servicos_prestados,
                "latitude": self.latitude,
                "longitude": self.longitude,
            })

        # Dados de morador
        if self.is_morador():
            data["total_servicos_contratados"] = self.total_servicos_contratados

        # Dados sensíveis (apenas se solicitado)
        if include_sensitive:
            data.update({
                "senha": self.senha,
                "tokens_blacklist": self.tokens_blacklist,
                "tentativas_login": self.tentativas_login,
                "conta_bloqueada": self.conta_bloqueada,
                "bloqueado_ate": self.bloqueado_ate.isoformat() if self.bloqueado_ate else None,
            })

        return data
