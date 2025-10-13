# Middleware Avançado de Rate Limiting - Alça Hub
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import asyncio
import logging
from typing import Dict, Optional, List
from datetime import datetime
import json

from .redis_rate_limiter import RedisRateLimiter, RateLimitResult
from .security import SecurityManager

logger = logging.getLogger(__name__)


class AdvancedRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware avançado de rate limiting."""

    def __init__(
        self,
        app: ASGIApp,
        rate_limiter: RedisRateLimiter,
        security_manager: SecurityManager,
    ):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.security_manager = security_manager
        self.endpoint_rules = {}
        self._setup_endpoint_rules()

    def _setup_endpoint_rules(self):
        """Configurar regras de rate limiting por endpoint."""
        self.endpoint_rules = {
            "/api/auth/login": "login",
            "/api/auth/register": "register",
            "/api/auth/refresh": "general",
            "/api/auth/password-reset": "password_reset",
            "/api/profile": "general",
            "/api/services": "api_calls",
            "/api/bookings": "api_calls",
            "/api/admin": "api_calls",
        }

    def _get_rule_for_endpoint(self, path: str) -> str:
        """Obter regra de rate limiting para endpoint."""
        # Verificar correspondência exata
        if path in self.endpoint_rules:
            return self.endpoint_rules[path]

        # Verificar correspondência por prefixo
        for endpoint, rule in self.endpoint_rules.items():
            if path.startswith(endpoint):
                return rule

        # Regra padrão
        return "general"

    def _get_client_identifier(self, request: Request) -> str:
        """Obter identificador único do cliente."""
        # Usar IP + User-Agent para identificação
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")

        # Criar hash do User-Agent para identificação
        user_agent_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]

        return f"{client_ip}:{user_agent_hash}"

    async def dispatch(self, request: Request, call_next):
        """Processar requisição com rate limiting avançado."""
        start_time = time.time()

        try:
            # Obter identificador do cliente
            client_id = self._get_client_identifier(request)

            # Obter regra de rate limiting
            rule_name = self._get_rule_for_endpoint(request.url.path)

            # Verificar rate limiting
            rate_limit_result = await self.rate_limiter.check_rate_limit(
                client_id, rule_name
            )

            if not rate_limit_result.allowed:
                # Log de rate limiting
                await self.security_manager.log_security_event(
                    "rate_limit_exceeded",
                    None,
                    request,
                    {
                        "rule": rule_name,
                        "reason": rate_limit_result.reason,
                        "strategy": rate_limit_result.strategy_used,
                        "retry_after": rate_limit_result.retry_after,
                    },
                )

                # Retornar resposta de rate limiting
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": rate_limit_result.reason,
                        "retry_after": rate_limit_result.retry_after,
                        "strategy": rate_limit_result.strategy_used,
                        "reset_time": rate_limit_result.reset_time,
                    },
                    headers={
                        "X-RateLimit-Limit": str(rate_limit_result.remaining + 1),
                        "X-RateLimit-Remaining": str(rate_limit_result.remaining),
                        "X-RateLimit-Reset": str(int(rate_limit_result.reset_time)),
                        "Retry-After": str(rate_limit_result.retry_after or 60),
                    },
                )

            # Adicionar headers de rate limiting
            response = await call_next(request)

            # Adicionar headers informativos
            response.headers["X-RateLimit-Limit"] = str(rate_limit_result.remaining + 1)
            response.headers["X-RateLimit-Remaining"] = str(rate_limit_result.remaining)
            response.headers["X-RateLimit-Reset"] = str(
                int(rate_limit_result.reset_time)
            )
            response.headers["X-RateLimit-Strategy"] = (
                rate_limit_result.strategy_used or "unknown"
            )

            # Log de requisição bem-sucedida
            processing_time = time.time() - start_time
            await self.security_manager.log_security_event(
                "request_processed",
                None,
                request,
                {
                    "rule": rule_name,
                    "strategy": rate_limit_result.strategy_used,
                    "processing_time": processing_time,
                    "status_code": response.status_code,
                },
            )

            return response

        except Exception as e:
            logger.error(f"Erro no middleware de rate limiting: {str(e)}")
            await self.security_manager.log_security_event(
                "rate_limit_middleware_error", None, request, {"error": str(e)}
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Erro interno do servidor"},
            )


class AdaptiveRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware de rate limiting adaptativo."""

    def __init__(
        self,
        app: ASGIApp,
        rate_limiter: RedisRateLimiter,
        security_manager: SecurityManager,
    ):
        super().__init__(app)
        self.rate_limiter = rate_limiter
        self.security_manager = security_manager
        self.behavior_tracker = {}
        self.adaptive_rules = {}

    def _track_behavior(self, client_id: str, request: Request, response_status: int):
        """Rastrear comportamento do cliente."""
        current_time = time.time()

        if client_id not in self.behavior_tracker:
            self.behavior_tracker[client_id] = {
                "requests": [],
                "errors": [],
                "last_seen": current_time,
                "behavior_score": 1.0,
            }

        behavior = self.behavior_tracker[client_id]
        behavior["requests"].append(current_time)
        behavior["last_seen"] = current_time

        # Manter apenas últimas 100 requisições
        if len(behavior["requests"]) > 100:
            behavior["requests"] = behavior["requests"][-100:]

        # Rastrear erros
        if response_status >= 400:
            behavior["errors"].append(current_time)
            if len(behavior["errors"]) > 50:
                behavior["errors"] = behavior["errors"][-50:]

        # Calcular score de comportamento
        self._calculate_behavior_score(client_id)

    def _calculate_behavior_score(self, client_id: str):
        """Calcular score de comportamento do cliente."""
        if client_id not in self.behavior_tracker:
            return

        behavior = self.behavior_tracker[client_id]
        current_time = time.time()

        # Analisar requisições recentes (última hora)
        recent_requests = [
            req_time
            for req_time in behavior["requests"]
            if current_time - req_time < 3600
        ]

        # Analisar erros recentes (última hora)
        recent_errors = [
            err_time
            for err_time in behavior["errors"]
            if current_time - err_time < 3600
        ]

        # Calcular score baseado em comportamento
        base_score = 1.0

        # Penalizar por muitos erros
        error_rate = len(recent_errors) / max(1, len(recent_requests))
        if error_rate > 0.1:  # Mais de 10% de erros
            base_score *= 0.5

        # Penalizar por requisições muito frequentes
        if len(recent_requests) > 50:  # Mais de 50 req/hora
            base_score *= 0.7

        # Bonus por comportamento normal
        if error_rate < 0.05 and len(recent_requests) < 20:
            base_score *= 1.2

        behavior["behavior_score"] = max(0.1, min(3.0, base_score))

    def _get_adaptive_rule(self, client_id: str, rule_name: str) -> str:
        """Obter regra adaptativa baseada no comportamento."""
        if client_id not in self.behavior_tracker:
            return rule_name

        behavior = self.behavior_tracker[client_id]
        score = behavior["behavior_score"]

        # Ajustar regra baseada no score
        if score > 2.0:
            return f"{rule_name}_premium"  # Regra mais permissiva
        elif score < 0.5:
            return f"{rule_name}_restricted"  # Regra mais restritiva
        else:
            return rule_name

    async def dispatch(self, request: Request, call_next):
        """Processar requisição com rate limiting adaptativo."""
        client_id = self._get_client_identifier(request)
        rule_name = self._get_rule_for_endpoint(request.url.path)

        # Obter regra adaptativa
        adaptive_rule = self._get_adaptive_rule(client_id, rule_name)

        # Verificar rate limiting com regra adaptativa
        rate_limit_result = await self.rate_limiter.check_rate_limit(
            client_id, adaptive_rule
        )

        if not rate_limit_result.allowed:
            # Log de rate limiting adaptativo
            await self.security_manager.log_security_event(
                "adaptive_rate_limit_exceeded",
                None,
                request,
                {
                    "rule": adaptive_rule,
                    "behavior_score": self.behavior_tracker.get(client_id, {}).get(
                        "behavior_score", 1.0
                    ),
                    "reason": rate_limit_result.reason,
                },
            )

            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": rate_limit_result.reason,
                    "retry_after": rate_limit_result.retry_after,
                    "strategy": rate_limit_result.strategy_used,
                },
            )

        # Processar requisição
        response = await call_next(request)

        # Rastrear comportamento
        self._track_behavior(client_id, request, response.status_code)

        return response


class IPWhitelistMiddleware(BaseHTTPMiddleware):
    """Middleware para gerenciar whitelist de IPs."""

    def __init__(self, app: ASGIApp, rate_limiter: RedisRateLimiter):
        super().__init__(app)
        self.rate_limiter = rate_limiter

    async def dispatch(self, request: Request, call_next):
        """Processar requisição com verificação de whitelist."""
        client_ip = request.client.host

        # Verificar se IP está na whitelist
        if self.rate_limiter.is_ip_whitelisted(client_ip):
            # Adicionar header indicando whitelist
            response = await call_next(request)
            response.headers["X-IP-Status"] = "whitelisted"
            return response

        # Verificar se IP está na blacklist
        if self.rate_limiter.is_ip_blacklisted(client_ip):
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": "IP está na blacklist"},
            )

        # Processar requisição normalmente
        response = await call_next(request)
        return response


class RateLimitDashboardMiddleware(BaseHTTPMiddleware):
    """Middleware para dashboard de rate limiting."""

    def __init__(self, app: ASGIApp, rate_limiter: RedisRateLimiter):
        super().__init__(app)
        self.rate_limiter = rate_limiter

    async def dispatch(self, request: Request, call_next):
        """Processar requisição com informações de dashboard."""
        # Verificar se é requisição para dashboard
        if request.url.path == "/api/admin/rate-limit-stats":
            try:
                stats = await self.rate_limiter.get_global_stats()
                return JSONResponse(content=stats)
            except Exception as e:
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={"detail": f"Erro ao obter estatísticas: {str(e)}"},
                )

        # Verificar se é requisição para informações de rate limiting
        if request.url.path.startswith("/api/admin/rate-limit-info/"):
            try:
                client_id = request.path_params.get("client_id")
                rule_name = request.query_params.get("rule", "general")

                info = await self.rate_limiter.get_rate_limit_info(client_id, rule_name)
                return JSONResponse(content=info)
            except Exception as e:
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={"detail": f"Erro ao obter informações: {str(e)}"},
                )

        # Processar requisição normalmente
        response = await call_next(request)
        return response


# Função para configurar todos os middlewares avançados
def setup_advanced_middlewares(app: ASGIApp, redis_url: str = "redis://localhost:6379"):
    """Configurar todos os middlewares avançados de rate limiting."""
    from .security import SecurityManager
    from motor.motor_asyncio import AsyncIOMotorClient

    # Inicializar componentes
    rate_limiter = RedisRateLimiter(redis_url)
    security_manager = SecurityManager(None)  # Será configurado com DB real

    # Adicionar middlewares na ordem correta
    app.add_middleware(RateLimitDashboardMiddleware, rate_limiter=rate_limiter)
    app.add_middleware(IPWhitelistMiddleware, rate_limiter=rate_limiter)
    app.add_middleware(
        AdaptiveRateLimitMiddleware,
        rate_limiter=rate_limiter,
        security_manager=security_manager,
    )
    app.add_middleware(
        AdvancedRateLimitMiddleware,
        rate_limiter=rate_limiter,
        security_manager=security_manager,
    )

    return rate_limiter, security_manager
