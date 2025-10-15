"""
User Service - Lógica de negócio de usuários
"""
from typing import Dict, Any, Optional, List
from fastapi import HTTPException, status
from datetime import datetime
import uuid

from repositories.user_repository import UserRepository
from utils.structured_logger import log_user_action, log_security_event
from auth.token_manager import hash_password


class UserService:
    """
    Service para lógica de negócio de usuários

    Implementa regras de negócio, validações e orquestração
    de operações relacionadas a usuários.
    """

    def __init__(self, user_repo: UserRepository):
        """
        Inicializa o service

        Args:
            user_repo: Repository de usuários
        """
        self.repo = user_repo

    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Cria novo usuário com validações

        Args:
            user_data: Dados do usuário

        Returns:
            Usuário criado

        Raises:
            HTTPException: Se validações falharem
        """
        # Validar duplicidade de email
        email_exists = await self.repo.email_exists(user_data.get("email", ""))
        if email_exists:
            log_security_event("duplicate_email_attempt", email=user_data.get("email"))
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já cadastrado"
            )

        # Validar duplicidade de CPF
        cpf = user_data.get("cpf")
        if cpf:
            cpf_exists = await self.repo.cpf_exists(cpf)
            if cpf_exists:
                log_security_event("duplicate_cpf_attempt", cpf=cpf)
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF já cadastrado"
                )

        # Validar aceite de termos
        if not user_data.get("aceitou_termos"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="É obrigatório aceitar os Termos de Uso"
            )

        # Hash da senha
        senha = user_data.get("senha") or user_data.get("password")
        if not senha or len(senha) < 6:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha deve ter no mínimo 6 caracteres"
            )

        hashed_password = hash_password(senha)

        # Preparar documento
        user_doc = {
            "_id": user_data.get("id") or str(uuid.uuid4()),
            "email": user_data["email"].lower(),
            "senha": hashed_password,
            "cpf": user_data.get("cpf", "00000000000"),
            "nome": user_data.get("nome", "Usuário"),
            "telefone": user_data.get("telefone", "00000000000"),
            "endereco": user_data.get("endereco", "Endereço não informado"),
            "tipos": user_data.get("tipos", ["morador"]),
            "tipo_ativo": user_data.get("tipo_ativo", user_data.get("tipos", ["morador"])[0]),
            "foto_url": user_data.get("foto_url"),
            "ativo": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "aceitou_termos": user_data.get("aceitou_termos", False),
            "data_aceite_termos": user_data.get("data_aceite_termos") or datetime.utcnow(),
        }

        # Adicionar campos opcionais se prestador
        if "prestador" in user_doc["tipos"]:
            user_doc.update({
                "latitude": user_data.get("latitude"),
                "longitude": user_data.get("longitude"),
                "disponivel": user_data.get("disponivel", True),
                "geolocalizacao_ativa": user_data.get("geolocalizacao_ativa", False),
            })

        # Criar usuário
        user_id = await self.repo.create(user_doc)

        # Log de sucesso
        log_user_action(
            "user_created",
            user_id,
            email=user_data["email"],
            user_type=user_doc["tipos"][0]
        )

        # Buscar usuário criado
        created_user = await self.repo.find_by_id(user_id)
        return created_user

    async def get_user(self, user_id: str) -> Dict[str, Any]:
        """
        Busca usuário por ID

        Args:
            user_id: ID do usuário

        Returns:
            Dados do usuário

        Raises:
            HTTPException: Se usuário não for encontrado
        """
        user = await self.repo.find_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        return user

    async def get_user_by_email(self, email: str) -> Dict[str, Any]:
        """
        Busca usuário por email

        Args:
            email: Email do usuário

        Returns:
            Dados do usuário

        Raises:
            HTTPException: Se usuário não for encontrado
        """
        user = await self.repo.find_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Usuário não encontrado"
            )
        return user

    async def update_user(
        self,
        user_id: str,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Atualiza dados do usuário

        Args:
            user_id: ID do usuário
            update_data: Dados para atualizar

        Returns:
            Usuário atualizado

        Raises:
            HTTPException: Se usuário não for encontrado ou estiver inativo
        """
        # Verificar se usuário existe e está ativo
        user = await self.get_user(user_id)

        if not user.get("ativo", True):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Usuário inativo"
            )

        # Remover campos None e adicionar updated_at
        clean_data = {k: v for k, v in update_data.items() if v is not None}
        clean_data["updated_at"] = datetime.utcnow()

        # Atualizar
        await self.repo.update(user_id, clean_data)

        # Log
        log_user_action(
            "user_updated",
            user_id,
            updated_fields=list(clean_data.keys())
        )

        # Retornar usuário atualizado
        return await self.get_user(user_id)

    async def delete_user(self, user_id: str) -> Dict[str, str]:
        """
        Deleta usuário (soft delete)

        Args:
            user_id: ID do usuário

        Returns:
            Mensagem de confirmação

        Raises:
            HTTPException: Se usuário não for encontrado
        """
        # Verificar se existe
        await self.get_user(user_id)

        # Soft delete
        modified_count = await self.repo.soft_delete(user_id)

        if modified_count > 0:
            log_user_action("user_deleted", user_id)
            return {"message": "Usuário deletado com sucesso"}

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro ao deletar usuário"
        )

    async def list_users(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Lista usuários ativos

        Args:
            skip: Número de usuários para pular
            limit: Limite de usuários

        Returns:
            Lista de usuários e total
        """
        users = await self.repo.find_active_users(skip=skip, limit=limit)
        total = await self.repo.count({"ativo": True})

        return {
            "users": users,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    async def list_providers(
        self,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Lista prestadores ativos

        Args:
            skip: Número de prestadores para pular
            limit: Limite de prestadores

        Returns:
            Lista de prestadores e total
        """
        providers = await self.repo.find_by_type(
            user_type="prestador",
            skip=skip,
            limit=limit
        )
        total = await self.repo.count({
            "tipos": "prestador",
            "ativo": True
        })

        return {
            "providers": providers,
            "total": total,
            "skip": skip,
            "limit": limit
        }

    async def find_providers_nearby(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 10.0,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """
        Busca prestadores próximos a uma localização

        Args:
            latitude: Latitude do ponto de referência
            longitude: Longitude do ponto de referência
            radius_km: Raio de busca em quilômetros
            limit: Limite de prestadores

        Returns:
            Lista de prestadores próximos
        """
        return await self.repo.find_providers_nearby(
            latitude=latitude,
            longitude=longitude,
            radius_km=radius_km,
            limit=limit
        )
