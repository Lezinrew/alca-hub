"""
User Repository - Acesso a dados de usuários com Beanie ODM
"""
from typing import Optional, List
from models.user import User
from core.enums import UserType


class UserRepository:
    """Repository para operações com usuários usando Beanie ODM"""

    @staticmethod
    async def find_by_id(user_id: str) -> Optional[User]:
        """Busca usuário por ID"""
        return await User.get(user_id)

    @staticmethod
    async def find_by_email(email: str) -> Optional[User]:
        """
        Busca usuário por email

        Args:
            email: Email do usuário

        Returns:
            User ou None
        """
        return await User.find_one(User.email == email.lower())

    @staticmethod
    async def find_by_cpf(cpf: str) -> Optional[User]:
        """
        Busca usuário por CPF

        Args:
            cpf: CPF do usuário

        Returns:
            User ou None
        """
        # Remove caracteres não numéricos
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        return await User.find_one(User.cpf == cpf_clean)

    @staticmethod
    async def find_active_users(
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """
        Busca usuários ativos

        Args:
            skip: Número de usuários para pular
            limit: Limite de usuários

        Returns:
            Lista de usuários ativos
        """
        return await User.find(
            User.ativo == True
        ).sort(-User.created_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_type(
        user_type: UserType,
        ativo: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """
        Busca usuários por tipo

        Args:
            user_type: Tipo do usuário (morador, prestador, admin)
            ativo: Apenas usuários ativos
            skip: Número de usuários para pular
            limit: Limite de usuários

        Returns:
            Lista de usuários do tipo especificado
        """
        query = User.find(User.tipos == user_type)

        if ativo:
            query = query.find(User.ativo == True)

        return await query.skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_prestadores(
        aprovado: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        """
        Busca prestadores

        Args:
            aprovado: Filtrar por aprovado (None = todos)
            skip: Número de prestadores para pular
            limit: Limite de prestadores

        Returns:
            Lista de prestadores
        """
        query = User.find(
            User.tipos == UserType.PRESTADOR,
            User.ativo == True
        )

        if aprovado is not None:
            query = query.find(User.prestador_aprovado == aprovado)

        return await query.skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_providers_nearby(
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        categoria: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[User]:
        """
        Busca prestadores próximos a uma localização

        Args:
            latitude: Latitude do ponto de referência
            longitude: Longitude do ponto de referência
            radius_km: Raio de busca em quilômetros
            categoria: Filtrar por categoria (opcional)
            skip: Número de prestadores para pular
            limit: Limite de prestadores

        Returns:
            Lista de prestadores próximos
        """
        # Query base
        query = {
            "tipos": UserType.PRESTADOR.value,
            "ativo": True,
            "prestador_aprovado": True,
            "latitude": {"$ne": None, "$exists": True},
            "longitude": {"$ne": None, "$exists": True},
        }

        # Adicionar filtro de categoria se fornecido
        if categoria:
            query["prestador_info.categorias"] = categoria

        # Busca com geolocalização (aproximação simples)
        # Para produção, usar $geoNear ou $near do MongoDB
        return await User.find(query).skip(skip).limit(limit).to_list()

    @staticmethod
    async def email_exists(email: str) -> bool:
        """
        Verifica se email já está cadastrado

        Args:
            email: Email para verificar

        Returns:
            True se email existe, False caso contrário
        """
        user = await User.find_one(User.email == email.lower())
        return user is not None

    @staticmethod
    async def cpf_exists(cpf: str) -> bool:
        """
        Verifica se CPF já está cadastrado

        Args:
            cpf: CPF para verificar

        Returns:
            True se CPF existe, False caso contrário
        """
        cpf_clean = ''.join(filter(str.isdigit, cpf))
        user = await User.find_one(User.cpf == cpf_clean)
        return user is not None

    @staticmethod
    async def create(user: User) -> User:
        """
        Cria novo usuário

        Args:
            user: Objeto User

        Returns:
            User criado
        """
        await user.insert()
        return user

    @staticmethod
    async def update(user: User) -> User:
        """
        Atualiza usuário

        Args:
            user: Objeto User

        Returns:
            User atualizado
        """
        from datetime import datetime
        user.updated_at = datetime.utcnow()
        await user.save()
        return user

    @staticmethod
    async def soft_delete(user_id: str) -> bool:
        """
        Desativa usuário (soft delete)

        Args:
            user_id: ID do usuário

        Returns:
            True se sucesso, False caso contrário
        """
        user = await User.get(user_id)
        if user:
            await user.soft_delete()
            return True
        return False

    @staticmethod
    async def count_by_type(user_type: UserType, ativo: bool = True) -> int:
        """
        Conta usuários por tipo

        Args:
            user_type: Tipo do usuário
            ativo: Apenas usuários ativos

        Returns:
            Número de usuários
        """
        query = User.find(User.tipos == user_type)

        if ativo:
            query = query.find(User.ativo == True)

        return await query.count()

    @staticmethod
    async def get_statistics() -> dict:
        """
        Retorna estatísticas gerais de usuários

        Returns:
            Dicionário com estatísticas
        """
        total_users = await User.find(User.ativo == True).count()
        total_moradores = await UserRepository.count_by_type(UserType.MORADOR)
        total_prestadores = await UserRepository.count_by_type(UserType.PRESTADOR)
        total_admins = await UserRepository.count_by_type(UserType.ADMIN)

        prestadores_aprovados = await User.find(
            User.tipos == UserType.PRESTADOR,
            User.ativo == True,
            User.prestador_aprovado == True
        ).count()

        return {
            "total_users": total_users,
            "total_moradores": total_moradores,
            "total_prestadores": total_prestadores,
            "total_admins": total_admins,
            "prestadores_aprovados": prestadores_aprovados,
            "prestadores_pendentes": total_prestadores - prestadores_aprovados,
        }
