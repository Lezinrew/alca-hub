# Módulo de Segurança - Alça Hub
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from fastapi import HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
import asyncio
from collections import defaultdict
import time

# Configurações de rate limiting
# TODO(security): Mover estes valores hardcoded para variáveis de ambiente no arquivo .env.
RATE_LIMIT_WINDOW = 60  # 1 minuto
RATE_LIMIT_MAX_REQUESTS = 100  # 100 requests por minuto
RATE_LIMIT_LOGIN_ATTEMPTS = 5  # 5 tentativas de login por minuto
RATE_LIMIT_LOGIN_WINDOW = 15  # 15 minutos

# Configurações de blacklist
BLACKLIST_CLEANUP_INTERVAL = 3600  # 1 hora
BLACKLIST_TOKEN_LIFETIME = 86400  # 24 horas


class SecurityManager:
    """Gerenciador de segurança e rate limiting."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.rate_limit_storage = defaultdict(list)
        self.blacklist_storage = set()
        self._start_cleanup_tasks()

    def _start_cleanup_tasks(self):
        """Iniciar tarefas de limpeza em background."""
        asyncio.create_task(self._cleanup_rate_limits())
        asyncio.create_task(self._cleanup_blacklist())

    async def _cleanup_rate_limits(self):
        """Limpar dados de rate limiting expirados."""
        # TODO(refactor): Esta função parece complexa. Avaliar se pode ser quebrada em funções menores e mais simples.
        while True:
            current_time = time.time()
            for key in list(self.rate_limit_storage.keys()):
                self.rate_limit_storage[key] = [
                    timestamp
                    for timestamp in self.rate_limit_storage[key]
                    if current_time - timestamp < RATE_LIMIT_WINDOW
                ]
                if not self.rate_limit_storage[key]:
                    del self.rate_limit_storage[key]
            await asyncio.sleep(RATE_LIMIT_WINDOW)

    async def _cleanup_blacklist(self):
        """Limpar blacklist de tokens expirados."""
        while True:
            current_time = time.time()
            expired_tokens = [
                token
                for token, timestamp in self.blacklist_storage
                if current_time - timestamp > BLACKLIST_TOKEN_LIFETIME
            ]
            for token in expired_tokens:
                self.blacklist_storage.discard(token)
            await asyncio.sleep(BLACKLIST_CLEANUP_INTERVAL)

    def _get_client_identifier(self, request: Request) -> str:
        """Obter identificador único do cliente."""
        # Usar IP + User-Agent para identificação
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent", "")
        return f"{client_ip}:{hashlib.md5(user_agent.encode()).hexdigest()[:8]}"

    async def check_rate_limit(
        self, request: Request, endpoint: str = "general"
    ) -> bool:
        """Verificar rate limiting para endpoint."""
        client_id = self._get_client_identifier(request)
        key = f"{client_id}:{endpoint}"
        current_time = time.time()

        # Limpar timestamps antigos
        self.rate_limit_storage[key] = [
            timestamp
            for timestamp in self.rate_limit_storage[key]
            if current_time - timestamp < RATE_LIMIT_WINDOW
        ]

        # Verificar limite
        if len(self.rate_limit_storage[key]) >= RATE_LIMIT_MAX_REQUESTS:
            return False

        # Adicionar timestamp atual
        self.rate_limit_storage[key].append(current_time)
        return True

    async def check_login_rate_limit(self, request: Request, email: str) -> bool:
        """Verificar rate limiting para tentativas de login."""
        client_id = self._get_client_identifier(request)
        key = f"{client_id}:login:{email}"
        current_time = time.time()

        # Limpar tentativas antigas
        self.rate_limit_storage[key] = [
            timestamp
            for timestamp in self.rate_limit_storage[key]
            if current_time - timestamp < RATE_LIMIT_LOGIN_WINDOW
        ]

        # Verificar limite
        if len(self.rate_limit_storage[key]) >= RATE_LIMIT_LOGIN_ATTEMPTS:
            return False

        # Adicionar timestamp atual
        self.rate_limit_storage[key].append(current_time)
        return True

    async def add_to_blacklist(self, token: str) -> None:
        """Adicionar token à blacklist."""
        current_time = time.time()
        self.blacklist_storage.add((token, current_time))

        # Armazenar no banco para persistência
        await self.db.blacklisted_tokens.insert_one(
            {
                "token_hash": hashlib.sha256(token.encode()).hexdigest(),
                "blacklisted_at": datetime.utcnow(),
                "expires_at": datetime.utcnow()
                + timedelta(seconds=BLACKLIST_TOKEN_LIFETIME),
            }
        )

    async def is_token_blacklisted(self, token: str) -> bool:
        """Verificar se token está na blacklist."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        # Verificar em memória
        for blacklisted_token, _ in self.blacklist_storage:
            if hashlib.sha256(blacklisted_token.encode()).hexdigest() == token_hash:
                return True

        # Verificar no banco
        blacklisted = await self.db.blacklisted_tokens.find_one(
            {"token_hash": token_hash, "expires_at": {"$gt": datetime.utcnow()}}
        )

        return blacklisted is not None

    async def log_security_event(
        self,
        event_type: str,
        user_id: Optional[str],
        request: Request,
        details: Dict = None,
    ) -> None:
        """Registrar evento de segurança."""
        security_event = {
            "event_type": event_type,
            "user_id": user_id,
            "ip_address": request.client.host,
            "user_agent": request.headers.get("user-agent", ""),
            "timestamp": datetime.utcnow(),
            "details": details or {},
        }

        await self.db.security_logs.insert_one(security_event)

    async def get_user_security_events(
        self, user_id: str, limit: int = 50
    ) -> List[Dict]:
        """Obter eventos de segurança do usuário."""
        events = (
            await self.db.security_logs.find({"user_id": user_id})
            .sort("timestamp", -1)
            .limit(limit)
            .to_list(length=None)
        )

        return events

    async def detect_suspicious_activity(self, user_id: str) -> bool:
        """Detectar atividade suspeita do usuário."""
        # TODO(tests): Criar um teste unitário para validar o comportamento desta função.
        # Verificar tentativas de login recentes
        recent_login_attempts = await self.db.security_logs.count_documents(
            {
                "user_id": user_id,
                "event_type": "login_attempt",
                "timestamp": {"$gte": datetime.utcnow() - timedelta(minutes=15)},
            }
        )

        # Verificar múltiplos IPs
        recent_ips = await self.db.security_logs.distinct(
            "ip_address",
            {
                "user_id": user_id,
                "timestamp": {"$gte": datetime.utcnow() - timedelta(hours=1)},
            },
        )

        # Verificar tentativas de acesso negadas
        denied_attempts = await self.db.security_logs.count_documents(
            {
                "user_id": user_id,
                "event_type": "access_denied",
                "timestamp": {"$gte": datetime.utcnow() - timedelta(minutes=30)},
            }
        )

        # Critérios de atividade suspeita
        suspicious = (
            recent_login_attempts > 10  # Muitas tentativas de login
            or len(recent_ips) > 3  # Múltiplos IPs
            or denied_attempts > 5  # Muitas tentativas negadas
        )

        if suspicious:
            await self.log_security_event(
                "suspicious_activity_detected",
                user_id,
                None,
                {
                    "login_attempts": recent_login_attempts,
                    "unique_ips": len(recent_ips),
                    "denied_attempts": denied_attempts,
                },
            )

        return suspicious


class TokenBlacklist:
    """Gerenciador de blacklist de tokens."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def add_token(self, token: str, reason: str = "logout") -> None:
        """Adicionar token à blacklist."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        expires_at = datetime.utcnow() + timedelta(seconds=BLACKLIST_TOKEN_LIFETIME)

        await self.db.blacklisted_tokens.insert_one(
            {
                "token_hash": token_hash,
                "reason": reason,
                "blacklisted_at": datetime.utcnow(),
                "expires_at": expires_at,
            }
        )

    async def is_blacklisted(self, token: str) -> bool:
        """Verificar se token está na blacklist."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()

        blacklisted = await self.db.blacklisted_tokens.find_one(
            {"token_hash": token_hash, "expires_at": {"$gt": datetime.utcnow()}}
        )

        return blacklisted is not None

    async def cleanup_expired(self) -> int:
        """Limpar tokens expirados da blacklist."""
        result = await self.db.blacklisted_tokens.delete_many(
            {"expires_at": {"$lt": datetime.utcnow()}}
        )

        return result.deleted_count


class SecurityMiddleware:
    """Middleware de segurança."""

    def __init__(self, security_manager: SecurityManager):
        self.security_manager = security_manager

    async def __call__(self, request: Request, call_next):
        """Processar requisição com verificações de segurança."""
        # Verificar rate limiting
        if not await self.security_manager.check_rate_limit(request):
            await self.security_manager.log_security_event(
                "rate_limit_exceeded", None, request, {"endpoint": str(request.url)}
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Muitas requisições. Tente novamente em alguns minutos.",
            )

        # Processar requisição
        response = await call_next(request)

        # Log de resposta
        if response.status_code >= 400:
            await self.security_manager.log_security_event(
                "error_response", None, request, {"status_code": response.status_code}
            )

        return response


# Funções auxiliares de segurança
def generate_secure_token(length: int = 32) -> str:
    """Gerar token seguro."""
    return secrets.token_urlsafe(length)


def hash_token(token: str) -> str:
    """Criar hash do token."""
    return hashlib.sha256(token.encode()).hexdigest()


def validate_token_format(token: str) -> bool:
    """Validar formato do token."""
    if not token or len(token) < 10:
        return False

    # Verificar se contém apenas caracteres válidos
    valid_chars = set(
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_"
    )
    return all(c in valid_chars for c in token)


def sanitize_input(input_string: str) -> str:
    """Sanitizar entrada do usuário."""
    if not input_string:
        return ""

    # Remover caracteres perigosos
    dangerous_chars = ["<", ">", '"', "'", "&", ";", "(", ")", "|", "`", "$"]
    sanitized = input_string

    for char in dangerous_chars:
        sanitized = sanitized.replace(char, "")

    return sanitized.strip()


def validate_email_security(email: str) -> bool:
    """Validar segurança do email."""
    if not email or len(email) > 254:
        return False

    # Verificar formato básico
    if "@" not in email or "." not in email:
        return False

    # Verificar se não contém caracteres perigosos
    dangerous_patterns = ["<", ">", '"', "'", ";", "(", ")", "|", "`"]
    return not any(pattern in email for pattern in dangerous_patterns)


def validate_password_security(password: str) -> Dict[str, bool]:
    """Validar segurança da senha."""
    if not password:
        return {"valid": False, "errors": ["Senha é obrigatória"]}

    errors = []

    if len(password) < 8:
        errors.append("Senha deve ter pelo menos 8 caracteres")

    if not any(c.isupper() for c in password):
        errors.append("Senha deve conter pelo menos uma letra maiúscula")

    if not any(c.islower() for c in password):
        errors.append("Senha deve conter pelo menos uma letra minúscula")

    if not any(c.isdigit() for c in password):
        errors.append("Senha deve conter pelo menos um número")

    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Senha deve conter pelo menos um caractere especial")

    return {"valid": len(errors) == 0, "errors": errors}
