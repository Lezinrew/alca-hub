# Rate Limiter Avançado com Redis - Alça Hub
import redis
import json
import time
import hashlib
from typing import Dict, Optional, List, Tuple
from dataclasses import dataclass
from enum import Enum
import asyncio
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RateLimitStrategy(Enum):
    """Estratégias de rate limiting."""

    FIXED_WINDOW = "fixed_window"
    SLIDING_WINDOW = "sliding_window"
    TOKEN_BUCKET = "token_bucket"
    LEAKY_BUCKET = "leaky_bucket"


@dataclass
class RateLimitRule:
    """Regra de rate limiting."""

    name: str
    max_requests: int
    window_seconds: int
    strategy: RateLimitStrategy
    block_duration: int = 0
    burst_limit: int = 0
    refill_rate: float = 0.0


@dataclass
class RateLimitResult:
    """Resultado da verificação de rate limiting."""

    allowed: bool
    remaining: int
    reset_time: float
    retry_after: Optional[int] = None
    reason: Optional[str] = None
    strategy_used: Optional[str] = None


class RedisRateLimiter:
    """Rate limiter avançado usando Redis."""

    def __init__(self, redis_url: str = "redis://localhost:6379", db: int = 0):
        self.redis_client = redis.from_url(redis_url, db=db, decode_responses=True)
        self.rules = {}
        self.ip_whitelist = set()
        self.ip_blacklist = set()
        self.adaptive_limits = {}
        self._setup_default_rules()

    def _setup_default_rules(self):
        """Configurar regras padrão de rate limiting."""
        self.rules = {
            "general": RateLimitRule(
                name="general",
                max_requests=100,
                window_seconds=60,
                strategy=RateLimitStrategy.SLIDING_WINDOW,
            ),
            "login": RateLimitRule(
                name="login",
                max_requests=5,
                window_seconds=900,  # 15 minutos
                strategy=RateLimitStrategy.FIXED_WINDOW,
                block_duration=900,
            ),
            "register": RateLimitRule(
                name="register",
                max_requests=3,
                window_seconds=3600,  # 1 hora
                strategy=RateLimitStrategy.FIXED_WINDOW,
                block_duration=3600,
            ),
            "api_calls": RateLimitRule(
                name="api_calls",
                max_requests=1000,
                window_seconds=3600,  # 1 hora
                strategy=RateLimitStrategy.TOKEN_BUCKET,
                burst_limit=100,
                refill_rate=0.5,
            ),
            "password_reset": RateLimitRule(
                name="password_reset",
                max_requests=3,
                window_seconds=3600,
                strategy=RateLimitStrategy.FIXED_WINDOW,
                block_duration=3600,
            ),
        }

    def add_ip_to_whitelist(self, ip: str) -> bool:
        """Adicionar IP à whitelist."""
        self.ip_whitelist.add(ip)
        return True

    def remove_ip_from_whitelist(self, ip: str) -> bool:
        """Remover IP da whitelist."""
        self.ip_whitelist.discard(ip)
        return True

    def add_ip_to_blacklist(self, ip: str) -> bool:
        """Adicionar IP à blacklist."""
        self.ip_blacklist.add(ip)
        return True

    def remove_ip_from_blacklist(self, ip: str) -> bool:
        """Remover IP da blacklist."""
        self.ip_blacklist.discard(ip)
        return True

    def is_ip_whitelisted(self, ip: str) -> bool:
        """Verificar se IP está na whitelist."""
        return ip in self.ip_whitelist

    def is_ip_blacklisted(self, ip: str) -> bool:
        """Verificar se IP está na blacklist."""
        return ip in self.ip_blacklist

    def _get_redis_key(self, identifier: str, rule_name: str) -> str:
        """Gerar chave Redis para rate limiting."""
        return f"rate_limit:{rule_name}:{identifier}"

    def _get_adaptive_limit(self, identifier: str, rule_name: str) -> int:
        """Obter limite adaptativo para identificador."""
        key = f"adaptive_limit:{rule_name}:{identifier}"
        cached_limit = self.redis_client.get(key)

        if cached_limit:
            return int(cached_limit)

        # Calcular limite baseado no comportamento
        behavior_score = self._calculate_behavior_score(identifier, rule_name)
        base_rule = self.rules[rule_name]
        adaptive_limit = int(base_rule.max_requests * behavior_score)

        # Armazenar limite adaptativo
        self.redis_client.setex(key, 3600, adaptive_limit)  # 1 hora

        return adaptive_limit

    def _calculate_behavior_score(self, identifier: str, rule_name: str) -> float:
        """Calcular score de comportamento do usuário."""
        # Score baseado em histórico de requisições
        base_score = 1.0

        # Verificar se está na whitelist
        if self.is_ip_whitelisted(identifier):
            base_score *= 2.0

        # Verificar se está na blacklist
        if self.is_ip_blacklisted(identifier):
            base_score *= 0.1

        # Verificar histórico de rate limiting
        history_key = f"rate_limit_history:{rule_name}:{identifier}"
        history = self.redis_client.lrange(history_key, 0, -1)

        if history:
            # Penalizar por rate limiting frequente
            recent_blocks = sum(1 for h in history[-10:] if h == "blocked")
            if recent_blocks > 3:
                base_score *= 0.5

        return max(0.1, min(3.0, base_score))

    async def check_rate_limit(
        self, identifier: str, rule_name: str
    ) -> RateLimitResult:
        """Verificar rate limiting para identificador."""
        # Verificar whitelist
        if self.is_ip_whitelisted(identifier):
            return RateLimitResult(
                allowed=True,
                remaining=999999,
                reset_time=time.time() + 3600,
                strategy_used="whitelist",
            )

        # Verificar blacklist
        if self.is_ip_blacklisted(identifier):
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=time.time() + 3600,
                retry_after=3600,
                reason="IP está na blacklist",
                strategy_used="blacklist",
            )

        # Obter regra
        rule = self.rules.get(rule_name)
        if not rule:
            return RateLimitResult(
                allowed=True,
                remaining=999999,
                reset_time=time.time() + 3600,
                strategy_used="no_rule",
            )

        # Aplicar estratégia de rate limiting
        if rule.strategy == RateLimitStrategy.FIXED_WINDOW:
            return await self._check_fixed_window(identifier, rule)
        elif rule.strategy == RateLimitStrategy.SLIDING_WINDOW:
            return await self._check_sliding_window(identifier, rule)
        elif rule.strategy == RateLimitStrategy.TOKEN_BUCKET:
            return await self._check_token_bucket(identifier, rule)
        elif rule.strategy == RateLimitStrategy.LEAKY_BUCKET:
            return await self._check_leaky_bucket(identifier, rule)
        else:
            return RateLimitResult(
                allowed=True,
                remaining=999999,
                reset_time=time.time() + 3600,
                strategy_used="unknown",
            )

    async def _check_fixed_window(
        self, identifier: str, rule: RateLimitRule
    ) -> RateLimitResult:
        """Verificar rate limiting com janela fixa."""
        current_time = time.time()
        window_start = int(current_time // rule.window_seconds) * rule.window_seconds
        key = self._get_redis_key(identifier, rule.name)

        # Obter limite adaptativo
        adaptive_limit = self._get_adaptive_limit(identifier, rule.name)

        # Contar requisições na janela atual
        pipe = self.redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start - 1)  # Limpar janelas antigas
        pipe.zcard(key)  # Contar requisições atuais
        pipe.zadd(key, {str(current_time): current_time})  # Adicionar requisição atual
        pipe.expire(key, rule.window_seconds * 2)  # Expirar após 2 janelas

        results = pipe.execute()
        current_requests = results[1]

        if current_requests >= adaptive_limit:
            # Bloquear se configurado
            if rule.block_duration > 0:
                block_key = f"blocked:{rule.name}:{identifier}"
                self.redis_client.setex(block_key, rule.block_duration, "blocked")

            # Registrar histórico
            history_key = f"rate_limit_history:{rule.name}:{identifier}"
            self.redis_client.lpush(history_key, "blocked")
            self.redis_client.ltrim(history_key, 0, 99)  # Manter apenas 100 entradas
            self.redis_client.expire(history_key, 86400)  # 24 horas

            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=window_start + rule.window_seconds,
                retry_after=rule.block_duration,
                reason=f"Limite de {adaptive_limit} requisições por {rule.window_seconds}s excedido",
                strategy_used="fixed_window",
            )

        return RateLimitResult(
            allowed=True,
            remaining=adaptive_limit - current_requests - 1,
            reset_time=window_start + rule.window_seconds,
            strategy_used="fixed_window",
        )

    async def _check_sliding_window(
        self, identifier: str, rule: RateLimitRule
    ) -> RateLimitResult:
        """Verificar rate limiting com janela deslizante."""
        current_time = time.time()
        window_start = current_time - rule.window_seconds
        key = self._get_redis_key(identifier, rule.name)

        # Obter limite adaptativo
        adaptive_limit = self._get_adaptive_limit(identifier, rule.name)

        # Contar requisições na janela deslizante
        pipe = self.redis_client.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)  # Limpar requisições antigas
        pipe.zcard(key)  # Contar requisições atuais
        pipe.zadd(key, {str(current_time): current_time})  # Adicionar requisição atual
        pipe.expire(key, rule.window_seconds * 2)  # Expirar após 2 janelas

        results = pipe.execute()
        current_requests = results[1]

        if current_requests >= adaptive_limit:
            # Bloquear se configurado
            if rule.block_duration > 0:
                block_key = f"blocked:{rule.name}:{identifier}"
                self.redis_client.setex(block_key, rule.block_duration, "blocked")

            # Registrar histórico
            history_key = f"rate_limit_history:{rule.name}:{identifier}"
            self.redis_client.lpush(history_key, "blocked")
            self.redis_client.ltrim(history_key, 0, 99)
            self.redis_client.expire(history_key, 86400)

            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=current_time + rule.window_seconds,
                retry_after=rule.block_duration,
                reason=f"Limite de {adaptive_limit} requisições por {rule.window_seconds}s excedido",
                strategy_used="sliding_window",
            )

        return RateLimitResult(
            allowed=True,
            remaining=adaptive_limit - current_requests - 1,
            reset_time=current_time + rule.window_seconds,
            strategy_used="sliding_window",
        )

    async def _check_token_bucket(
        self, identifier: str, rule: RateLimitRule
    ) -> RateLimitResult:
        """Verificar rate limiting com token bucket."""
        current_time = time.time()
        key = self._get_redis_key(identifier, rule.name)

        # Obter limite adaptativo
        adaptive_limit = self._get_adaptive_limit(identifier, rule.name)

        # Implementar token bucket
        pipe = self.redis_client.pipeline()
        pipe.hgetall(key)  # Obter estado atual do bucket

        results = pipe.execute()
        bucket_data = results[0]

        if not bucket_data:
            # Inicializar bucket
            tokens = adaptive_limit
            last_refill = current_time
        else:
            tokens = float(bucket_data.get("tokens", 0))
            last_refill = float(bucket_data.get("last_refill", current_time))

        # Calcular tokens disponíveis
        time_passed = current_time - last_refill
        tokens_to_add = time_passed * rule.refill_rate
        tokens = min(adaptive_limit, tokens + tokens_to_add)

        if tokens >= 1:
            # Consumir token
            tokens -= 1
            pipe = self.redis_client.pipeline()
            pipe.hset(key, mapping={"tokens": tokens, "last_refill": current_time})
            pipe.expire(key, rule.window_seconds * 2)
            pipe.execute()

            return RateLimitResult(
                allowed=True,
                remaining=int(tokens),
                reset_time=current_time + rule.window_seconds,
                strategy_used="token_bucket",
            )
        else:
            # Sem tokens disponíveis
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=current_time + (1 / rule.refill_rate),
                retry_after=int(1 / rule.refill_rate),
                reason=f"Token bucket vazio. Limite: {adaptive_limit} tokens",
                strategy_used="token_bucket",
            )

    async def _check_leaky_bucket(
        self, identifier: str, rule: RateLimitRule
    ) -> RateLimitResult:
        """Verificar rate limiting com leaky bucket."""
        current_time = time.time()
        key = self._get_redis_key(identifier, rule.name)

        # Obter limite adaptativo
        adaptive_limit = self._get_adaptive_limit(identifier, rule.name)

        # Implementar leaky bucket
        pipe = self.redis_client.pipeline()
        pipe.hgetall(key)  # Obter estado atual do bucket

        results = pipe.execute()
        bucket_data = results[0]

        if not bucket_data:
            # Inicializar bucket
            level = 0
            last_leak = current_time
        else:
            level = float(bucket_data.get("level", 0))
            last_leak = float(bucket_data.get("last_leak", current_time))

        # Calcular vazamento
        time_passed = current_time - last_leak
        leak_amount = time_passed * rule.refill_rate
        level = max(0, level - leak_amount)

        if level < adaptive_limit:
            # Adicionar requisição ao bucket
            level += 1
            pipe = self.redis_client.pipeline()
            pipe.hset(key, mapping={"level": level, "last_leak": current_time})
            pipe.expire(key, rule.window_seconds * 2)
            pipe.execute()

            return RateLimitResult(
                allowed=True,
                remaining=int(adaptive_limit - level),
                reset_time=current_time + rule.window_seconds,
                strategy_used="leaky_bucket",
            )
        else:
            # Bucket cheio
            return RateLimitResult(
                allowed=False,
                remaining=0,
                reset_time=current_time + (1 / rule.refill_rate),
                retry_after=int(1 / rule.refill_rate),
                reason=f"Leaky bucket cheio. Limite: {adaptive_limit}",
                strategy_used="leaky_bucket",
            )

    async def get_rate_limit_info(self, identifier: str, rule_name: str) -> Dict:
        """Obter informações de rate limiting."""
        rule = self.rules.get(rule_name)
        if not rule:
            return {"error": "Regra não encontrada"}

        current_time = time.time()
        key = self._get_redis_key(identifier, rule_name)

        # Obter limite adaptativo
        adaptive_limit = self._get_adaptive_limit(identifier, rule_name)

        # Obter informações baseadas na estratégia
        if rule.strategy == RateLimitStrategy.FIXED_WINDOW:
            window_start = (
                int(current_time // rule.window_seconds) * rule.window_seconds
            )
            current_requests = self.redis_client.zcount(key, window_start, current_time)
        elif rule.strategy == RateLimitStrategy.SLIDING_WINDOW:
            window_start = current_time - rule.window_seconds
            current_requests = self.redis_client.zcount(key, window_start, current_time)
        else:
            current_requests = 0

        return {
            "rule_name": rule_name,
            "strategy": rule.strategy.value,
            "limit": adaptive_limit,
            "current_requests": current_requests,
            "remaining": max(0, adaptive_limit - current_requests),
            "window_seconds": rule.window_seconds,
            "is_whitelisted": self.is_ip_whitelisted(identifier),
            "is_blacklisted": self.is_ip_blacklisted(identifier),
            "reset_time": current_time + rule.window_seconds,
        }

    async def reset_rate_limit(self, identifier: str, rule_name: str) -> bool:
        """Resetar rate limiting para identificador."""
        key = self._get_redis_key(identifier, rule_name)
        self.redis_client.delete(key)

        # Limpar histórico
        history_key = f"rate_limit_history:{rule_name}:{identifier}"
        self.redis_client.delete(history_key)

        # Limpar bloqueio
        block_key = f"blocked:{rule_name}:{identifier}"
        self.redis_client.delete(block_key)

        return True

    async def get_global_stats(self) -> Dict:
        """Obter estatísticas globais de rate limiting."""
        current_time = time.time()

        # Contar chaves de rate limiting
        rate_limit_keys = self.redis_client.keys("rate_limit:*")
        blocked_keys = self.redis_client.keys("blocked:*")
        history_keys = self.redis_client.keys("rate_limit_history:*")

        # Obter estatísticas por regra
        rule_stats = {}
        for rule_name in self.rules.keys():
            rule_keys = [k for k in rate_limit_keys if f":{rule_name}:" in k]
            rule_stats[rule_name] = {
                "active_limits": len(rule_keys),
                "blocked_ips": len([k for k in blocked_keys if f":{rule_name}:" in k]),
            }

        return {
            "total_active_limits": len(rate_limit_keys),
            "total_blocked_ips": len(blocked_keys),
            "total_history_entries": len(history_keys),
            "whitelisted_ips": len(self.ip_whitelist),
            "blacklisted_ips": len(self.ip_blacklist),
            "rule_stats": rule_stats,
            "timestamp": current_time,
        }

    async def cleanup_expired_data(self) -> int:
        """Limpar dados expirados."""
        current_time = time.time()
        cleaned = 0

        # Limpar chaves expiradas
        for pattern in ["rate_limit:*", "blocked:*", "rate_limit_history:*"]:
            keys = self.redis_client.keys(pattern)
            for key in keys:
                ttl = self.redis_client.ttl(key)
                if ttl == -1:  # Sem expiração
                    self.redis_client.expire(key, 3600)  # Definir expiração
                elif ttl == -2:  # Chave expirada
                    self.redis_client.delete(key)
                    cleaned += 1

        return cleaned
