"""Serviço responsável pelo fluxo de login."""

from __future__ import annotations

import os
from typing import Any, Dict

from fastapi import HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from ..rate_limiter import RateLimitType, check_rate_limit
from ..security import SecurityManager, validate_email_security
from ..token_manager import TokenManager, verify_password


class LoginService:
    """Centraliza regras de negócio do endpoint de login."""

    def __init__(
        self,
        db: AsyncIOMotorDatabase,
        token_manager: TokenManager,
        security_manager: SecurityManager,
    ) -> None:
        self._db = db
        self._token_manager = token_manager
        self._security_manager = security_manager
        self._user_agent_length = int(os.getenv("CLIENT_ID_USER_AGENT_LENGTH", "8"))

    async def login(self, request: Request, login_payload: Any) -> Dict[str, Any]:
        """
        Executa o fluxo completo de autenticação.

        Args:
            request: Requisição FastAPI usada para obter metadados (IP, headers).
            login_payload: Instância que contém email e senha (p.ex. LoginRequest).

        Returns:
            Dicionário pronto para serialização com access token, refresh token e dados do usuário.
        """
        client_id = self._build_client_identifier(request)
        rate_limit_result = await check_rate_limit(client_id, RateLimitType.LOGIN)

        if not rate_limit_result.allowed:
            await self._security_manager.log_security_event(
                "login_rate_limit_exceeded",
                None,
                request,
                {
                    "email": login_payload.email,
                    "retry_after": rate_limit_result.retry_after,
                    "reason": rate_limit_result.reason,
                },
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=(
                    "Muitas tentativas de login. "
                    f"Tente novamente em {rate_limit_result.retry_after} segundos."
                ),
            )

        if not validate_email_security(login_payload.email):
            await self._security_manager.log_security_event(
                "invalid_email_format", None, request, {"email": login_payload.email}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de email inválido",
            )

        user = await self._db.users.find_one(
            {"email": login_payload.email, "ativo": True}
        )
        if not user:
            await self._security_manager.log_security_event(
                "login_user_not_found", None, request, {"email": login_payload.email}
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
            )

        if not verify_password(login_payload.senha, user["senha"]):
            await self._security_manager.log_security_event(
                "login_invalid_password",
                str(user["_id"]),
                request,
                {"email": login_payload.email},
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciais inválidas",
            )

        user_data = self._build_user_payload(user)
        access_token, refresh_token = await self._token_manager.create_token_pair(
            user_data
        )

        await self._security_manager.log_security_event(
            "login_success", str(user["_id"]), request, {"email": login_payload.email}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_in": int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")) * 60,
            "user": user_data,
        }

    def _build_client_identifier(self, request: Request) -> str:
        """Gera identificador consistente para rate limiting."""
        user_agent = request.headers.get("user-agent", "")[: self._user_agent_length]
        return f"{request.client.host}:{user_agent}"

    @staticmethod
    def _build_user_payload(user: Dict[str, Any]) -> Dict[str, Any]:
        """Extrai campos seguros do documento do usuário."""
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "tipo": user["tipo"],
            "nome": user["nome"],
        }
