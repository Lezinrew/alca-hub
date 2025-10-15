"""
Dependency Injection - Gerenciamento de dependências do FastAPI
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Annotated
import jwt
import os

from repositories.user_repository import UserRepository
from services.user_service import UserService

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# Database instance (será injetado do server.py)
_db_instance = None


def set_database(database: AsyncIOMotorDatabase):
    """
    Define a instância do banco de dados

    Args:
        database: Instância do MongoDB
    """
    global _db_instance
    _db_instance = database


async def get_database() -> AsyncIOMotorDatabase:
    """
    Dependency para obter instância do banco

    Returns:
        Instância do MongoDB

    Raises:
        HTTPException: Se banco não estiver configurado
    """
    if _db_instance is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Banco de dados não configurado"
        )
    return _db_instance


async def get_user_repository(
    database: AsyncIOMotorDatabase = Depends(get_database)
) -> UserRepository:
    """
    Dependency para obter repository de usuários

    Args:
        database: Instância do banco (injetada)

    Returns:
        UserRepository configurado
    """
    return UserRepository(database)


async def get_user_service(
    repo: UserRepository = Depends(get_user_repository)
) -> UserService:
    """
    Dependency para obter service de usuários

    Args:
        repo: UserRepository (injetado)

    Returns:
        UserService configurado
    """
    return UserService(repo)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service)
) -> dict:
    """
    Dependency para obter usuário autenticado

    Args:
        token: Token JWT (injetado)
        user_service: UserService (injetado)

    Returns:
        Dados do usuário autenticado

    Raises:
        HTTPException: Se token inválido ou usuário não encontrado
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Bypass em modo de teste
    if os.getenv("TEST_MODE") == "1" or (os.getenv("ENV") or "").lower() == "test":
        return {
            "id": "test-user",
            "email": "test@example.com",
            "nome": "Usuário Teste",
            "cpf": "00000000000",
            "telefone": "00000000000",
            "endereco": "Endereço não informado",
            "tipos": ["morador"],
            "tipo_ativo": "morador",
            "ativo": True,
        }

    try:
        # Decodificar token
        payload = jwt.decode(
            token,
            os.getenv("SECRET_KEY"),
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if not user_id:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # Buscar usuário
    try:
        user = await user_service.get_user(user_id)
        if not user.get("ativo", True):
            raise credentials_exception
        return user
    except HTTPException:
        raise credentials_exception


async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """
    Dependency para obter usuário admin autenticado

    Args:
        current_user: Usuário autenticado (injetado)

    Returns:
        Dados do usuário admin

    Raises:
        HTTPException: Se usuário não for admin
    """
    if "admin" not in current_user.get("tipos", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores."
        )
    return current_user


# Type aliases para facilitar uso
DatabaseDep = Annotated[AsyncIOMotorDatabase, Depends(get_database)]
UserRepositoryDep = Annotated[UserRepository, Depends(get_user_repository)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
CurrentUserDep = Annotated[dict, Depends(get_current_user)]
CurrentAdminDep = Annotated[dict, Depends(get_current_admin)]
