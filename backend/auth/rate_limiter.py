# Rate Limiter Avançado - Alça Hub
import time
import asyncio
from typing import Dict, Optional, Tuple
from collections import defaultdict, deque
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RateLimitType(Enum):
    """Tipos de rate limiting."""

    GENERAL = "general"
    LOGIN = "login"
    REGISTER = "register"
    PASSWORD_RESET = "password_reset"
    API_CALLS = "api_calls"


@dataclass
class RateLimitConfig:
    """Configuração de rate limiting."""

    max_requests: int
    window_seconds: int
    block_duration: int = 0  # 0 = não bloquear, apenas limitar

    def __post_init__(self):
        if self.block_duration == 0:
            self.block_duration = self.window_seconds


@dataclass
class RateLimitResult:
    """Resultado da verificação de rate limiting."""

    allowed: bool
    remaining: int
    reset_time: float
    retry_after: Optional[int] = None
    reason: Optional[str] = None


class AdvancedRateLimiter:
    """Rate limiter avançado com múltiplas estratégias."""

    def __init__(self):
        self.storage = defaultdict(lambda: defaultdict(deque))
        self.blocked_ips = {}
        self.configs = {
            RateLimitType.GENERAL: RateLimitConfig(100, 60),  # 100 req/min
            RateLimitType.LOGIN: RateLimitConfig(5, 900),  # 5 req/15min
            RateLimitType.REGISTER: RateLimitConfig(3, 3600),  # 3 req/hora
            RateLimitType.PASSWORD_RESET: RateLimitConfig(3, 3600),  # 3 req/hora
            RateLimitType.API_CALLS: RateLimitConfig(1000, 3600),  # 1000 req/hora
        }

    def _get_key(self, identifier: str, rate_limit_type: RateLimitType) -> str:
        """Gerar chave única para rate limiting."""
        return f"{identifier}:{rate_limit_type.value}"

    def _cleanup_expired_entries(self, key: str) -> None:
        """Limpar entradas expiradas."""
        current_time = time.time()
        config = self.configs[RateLimitType.GENERAL]  # Usar config geral como fallback

        # Limpar timestamps antigos
        while (
            self.storage[key]
            and current_time - self.storage[key][0] > config.window_seconds
        ):
            self.storage[key].popleft()

    async def check_rate_limit(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> RateLimitResult:
        """Verificar rate limiting para identificador."""
        current_time = time.time()
        key = self._get_key(identifier, rate_limit_type)
        config = self.configs.get(rate_limit_type, self.configs[RateLimitType.GENERAL])

        # Limpar entradas expiradas
        self._cleanup_expired_entries(key)

        # Verificar se IP está bloqueado
        if identifier in self.blocked_ips:
            block_until = self.blocked_ips[identifier]
            if current_time < block_until:
                return RateLimitResult(
                    allowed=False,
                    remaining=0,
                    reset_time=block_until,
                    retry_after=int(block_until - current_time),
                    reason="IP bloqueado temporariamente",
                )
            else:
                # Remover do bloqueio
                del self.blocked_ips[identifier]

        # Verificar limite
        current_requests = len(self.storage[key])

        if current_requests >= config.max_requests:
            # Bloquear IP se configurado
            if config.block_duration > 0:
                self.blocked_ips[identifier] = current_time + config.block_duration

            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=current_time + config.window_seconds,
                retry_after=config.block_duration,
                reason=f"Limite de {config.max_requests} requisições por {config.window_seconds}s excedido",
            )

        # Adicionar requisição atual
        self.storage[key].append(current_time)

        return RateLimitResult(
            allowed=True,
            remaining=config.max_requests - current_requests - 1,
            reset_time=current_time + config.window_seconds,
        )

    async def get_rate_limit_info(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> Dict:
        """Obter informações de rate limiting."""
        current_time = time.time()
        key = self._get_key(identifier, rate_limit_type)
        config = self.configs.get(rate_limit_type, self.configs[RateLimitType.GENERAL])

        # Limpar entradas expiradas
        self._cleanup_expired_entries(key)

        current_requests = len(self.storage[key])
        remaining = max(0, config.max_requests - current_requests)

        return {
            "limit": config.max_requests,
            "remaining": remaining,
            "reset_time": current_time + config.window_seconds,
            "window_seconds": config.window_seconds,
            "is_blocked": identifier in self.blocked_ips,
            "block_until": self.blocked_ips.get(identifier),
        }

    async def reset_rate_limit(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> bool:
        """Resetar rate limiting para identificador."""
        key = self._get_key(identifier, rate_limit_type)

        if key in self.storage:
            del self.storage[key]

        if identifier in self.blocked_ips:
            del self.blocked_ips[identifier]

        return True

    async def cleanup_expired_blocks(self) -> int:
        """Limpar bloqueios expirados."""
        current_time = time.time()
        expired_blocks = [
            ip
            for ip, block_until in self.blocked_ips.items()
            if current_time >= block_until
        ]

        for ip in expired_blocks:
            del self.blocked_ips[ip]

        return len(expired_blocks)

    async def get_global_stats(self) -> Dict:
        """Obter estatísticas globais de rate limiting."""
        current_time = time.time()
        total_requests = sum(len(requests) for requests in self.storage.values())
        blocked_ips = len(self.blocked_ips)

        # Limpar entradas expiradas
        for key in list(self.storage.keys()):
            self._cleanup_expired_entries(key)
            if not self.storage[key]:
                del self.storage[key]

        return {
            "total_active_requests": total_requests,
            "blocked_ips": blocked_ips,
            "active_rate_limits": len(self.storage),
            "timestamp": current_time,
        }


class AdaptiveRateLimiter(AdvancedRateLimiter):
    """Rate limiter adaptativo que ajusta limites baseado no comportamento."""

    def __init__(self):
        super().__init__()
        self.behavior_scores = defaultdict(float)
        self.adaptive_configs = {}

    def _calculate_behavior_score(self, identifier: str) -> float:
        """Calcular score de comportamento do usuário."""
        # Score baseado em histórico de requisições
        base_score = 1.0

        # Penalizar por rate limiting frequente
        if identifier in self.blocked_ips:
            base_score *= 0.5

        # Bonus por comportamento normal
        if identifier not in self.blocked_ips:
            base_score *= 1.1

        return max(0.1, min(2.0, base_score))

    async def get_adaptive_config(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> RateLimitConfig:
        """Obter configuração adaptativa baseada no comportamento."""
        base_config = self.configs.get(
            rate_limit_type, self.configs[RateLimitType.GENERAL]
        )
        behavior_score = self._calculate_behavior_score(identifier)

        # Ajustar limites baseado no comportamento
        adaptive_max_requests = int(base_config.max_requests * behavior_score)
        adaptive_window = base_config.window_seconds

        return RateLimitConfig(
            max_requests=adaptive_max_requests,
            window_seconds=adaptive_window,
            block_duration=base_config.block_duration,
        )

    async def check_adaptive_rate_limit(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> RateLimitResult:
        """Verificar rate limiting adaptativo."""
        adaptive_config = await self.get_adaptive_config(identifier, rate_limit_type)

        # Temporariamente usar configuração adaptativa
        original_config = self.configs.get(rate_limit_type)
        self.configs[rate_limit_type] = adaptive_config

        try:
            result = await self.check_rate_limit(identifier, rate_limit_type)
            return result
        finally:
            # Restaurar configuração original
            if original_config:
                self.configs[rate_limit_type] = original_config


class DistributedRateLimiter(AdvancedRateLimiter):
    """Rate limiter distribuído para múltiplas instâncias."""

    def __init__(self, redis_client=None):
        super().__init__()
        self.redis_client = redis_client
        self.use_redis = redis_client is not None

    async def _get_redis_key(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> str:
        """Gerar chave Redis para rate limiting."""
        return f"rate_limit:{identifier}:{rate_limit_type.value}"

    async def check_distributed_rate_limit(
        self, identifier: str, rate_limit_type: RateLimitType
    ) -> RateLimitResult:
        """Verificar rate limiting distribuído."""
        if not self.use_redis:
            return await self.check_rate_limit(identifier, rate_limit_type)

        current_time = time.time()
        config = self.configs.get(rate_limit_type, self.configs[RateLimitType.GENERAL])
        key = await self._get_redis_key(identifier, rate_limit_type)

        # Usar Redis para rate limiting distribuído
        pipe = self.redis_client.pipeline()

        # Limpar entradas expiradas
        pipe.zremrangebyscore(key, 0, current_time - config.window_seconds)

        # Contar requisições atuais
        pipe.zcard(key)

        # Adicionar requisição atual
        pipe.zadd(key, {str(current_time): current_time})

        # Definir expiração
        pipe.expire(key, config.window_seconds)

        results = await pipe.execute()
        current_requests = results[1]

        if current_requests >= config.max_requests:
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=current_time + config.window_seconds,
                retry_after=config.block_duration,
                reason=f"Limite distribuído de {config.max_requests} requisições por {config.window_seconds}s excedido",
            )

        return RateLimitResult(
            allowed=True,
            remaining=config.max_requests - current_requests - 1,
            reset_time=current_time + config.window_seconds,
        )


# Instância global do rate limiter
rate_limiter = AdvancedRateLimiter()


# Funções auxiliares
async def check_rate_limit(
    identifier: str, rate_limit_type: RateLimitType
) -> RateLimitResult:
    """Verificar rate limiting para identificador."""
    return await rate_limiter.check_rate_limit(identifier, rate_limit_type)


async def get_rate_limit_info(identifier: str, rate_limit_type: RateLimitType) -> Dict:
    """Obter informações de rate limiting."""
    return await rate_limiter.get_rate_limit_info(identifier, rate_limit_type)


async def reset_rate_limit(identifier: str, rate_limit_type: RateLimitType) -> bool:
    """Resetar rate limiting para identificador."""
    return await rate_limiter.reset_rate_limit(identifier, rate_limit_type)


async def cleanup_rate_limits() -> int:
    """Limpar rate limits expirados."""
    return await rate_limiter.cleanup_expired_blocks()


async def get_global_rate_limit_stats() -> Dict:
    """Obter estatísticas globais de rate limiting."""
    return await rate_limiter.get_global_stats()
