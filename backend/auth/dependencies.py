# Dependências centralizadas de autenticação - Alça Hub
from __future__ import annotations

from typing import Any, Dict, Union

from fastapi import HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from starlette.websockets import WebSocket

from .security import SecurityManager, TokenBlacklist
from .token_manager import TokenManager

Connection = Union[Request, WebSocket]


def _get_state_attr(request: Request, attr_name: str, error_detail: str):
    """Recupera atributo do app.state garantindo configuração prévia."""
    value = getattr(request.app.state, attr_name, None)
    if value is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail,
        )
    return value


def get_db(connection: Connection) -> AsyncIOMotorDatabase:
    """Retorna instância de banco configurada no app state."""
    db = getattr(connection.app.state, "db_proxy", None)
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Banco de dados não configurado",
        )
    return db


async def get_token_manager(request: Request) -> TokenManager:
    """Recupera TokenManager singleton configurado no app."""
    return _get_state_attr(request, "token_manager", "TokenManager não configurado")


async def get_security_manager(request: Request) -> SecurityManager:
    """Recupera SecurityManager singleton configurado no app."""
    return _get_state_attr(
        request,
        "security_manager",
        "SecurityManager não configurado",
    )


async def get_token_blacklist(request: Request) -> TokenBlacklist:
    """Recupera blacklist de tokens configurada no app."""
    return _get_state_attr(
        request,
        "token_blacklist",
        "TokenBlacklist não configurada",
    )


def get_current_user_payload(connection: Connection) -> Dict[str, Any]:
    """Retorna payload do usuário autenticado definido pelo middleware JWT."""
    user = getattr(connection.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização não fornecido",
        )

    payload = dict(user)
    payload.setdefault("user_id", payload.get("id"))
    return payload
