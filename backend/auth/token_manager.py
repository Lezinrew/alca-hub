# Gerenciador de Tokens - Alça Hub
import jwt
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
from fastapi import HTTPException, status
from passlib.context import CryptContext
import os
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger(__name__)


def _require_env(var_name: str) -> str:
    """Recupera variável de ambiente obrigatória."""
    value = os.getenv(var_name)
    if not value:
        raise RuntimeError(f"Variável de ambiente {var_name} não configurada.")
    return value


# Configurações de segurança
SECRET_KEY = _require_env("SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))  # 15 minutos
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))  # 7 dias
REFRESH_TOKEN_LENGTH = int(os.getenv("REFRESH_TOKEN_LENGTH", "64"))  # 64 caracteres

# Contexto de criptografia
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__max_rounds=12)


class TokenManager:
    """Gerenciador de tokens JWT com refresh tokens."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.secret_key = SECRET_KEY
        self.algorithm = JWT_ALGORITHM
        self.access_token_expire = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        self.refresh_token_expire = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    def create_access_token(self, user_data: Dict) -> str:
        """Criar token de acesso JWT."""
        to_encode = user_data.copy()
        expire = datetime.utcnow() + self.access_token_expire
        to_encode.update({"exp": expire, "iat": datetime.utcnow(), "type": "access"})

        return jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)

    def create_refresh_token(self, user_id: str) -> str:
        """Criar refresh token seguro."""
        # Gerar token aleatório
        random_token = secrets.token_urlsafe(REFRESH_TOKEN_LENGTH)

        # Criar hash do token para armazenar no banco
        token_hash = hashlib.sha256(random_token.encode()).hexdigest()

        return random_token, token_hash

    async def store_refresh_token(self, user_id: str, token_hash: str) -> None:
        """Armazenar refresh token no banco de dados."""
        expire_date = datetime.utcnow() + self.refresh_token_expire

        refresh_token_doc = {
            "user_id": user_id,
            "token_hash": token_hash,
            "expires_at": expire_date,
            "created_at": datetime.utcnow(),
            "is_revoked": False,
            "device_info": {"user_agent": "unknown", "ip_address": "unknown"},
        }

        await self.db.refresh_tokens.insert_one(refresh_token_doc)

    async def validate_refresh_token(self, refresh_token: str) -> Optional[Dict]:
        """Validar refresh token e retornar dados do usuário."""
        # Criar hash do token fornecido
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        # Buscar token no banco
        token_doc = await self.db.refresh_tokens.find_one(
            {
                "token_hash": token_hash,
                "is_revoked": False,
                "expires_at": {"$gt": datetime.utcnow()},
            }
        )

        if not token_doc:
            return None

        # Buscar dados do usuário
        user = await self.db.users.find_one(
            {"_id": token_doc["user_id"], "ativo": True}
        )

        if not user:
            return None

        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "tipo": user["tipo"],
            "nome": user["nome"],
        }

    async def revoke_refresh_token(self, refresh_token: str) -> bool:
        """Revogar refresh token específico."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()

        result = await self.db.refresh_tokens.update_one(
            {"token_hash": token_hash},
            {"$set": {"is_revoked": True, "revoked_at": datetime.utcnow()}},
        )

        return result.modified_count > 0

    async def revoke_all_user_tokens(self, user_id: str) -> int:
        """Revogar todos os refresh tokens de um usuário."""
        result = await self.db.refresh_tokens.update_many(
            {"user_id": user_id, "is_revoked": False},
            {"$set": {"is_revoked": True, "revoked_at": datetime.utcnow()}},
        )

        return result.modified_count

    async def cleanup_expired_tokens(self) -> int:
        """Limpar tokens expirados do banco."""
        result = await self.db.refresh_tokens.delete_many(
            {"expires_at": {"$lt": datetime.utcnow()}}
        )

        return result.deleted_count

    async def get_user_active_tokens(self, user_id: str) -> list:
        """Obter lista de tokens ativos do usuário."""
        tokens = await self.db.refresh_tokens.find(
            {
                "user_id": user_id,
                "is_revoked": False,
                "expires_at": {"$gt": datetime.utcnow()},
            }
        ).to_list(length=None)

        return tokens

    def verify_access_token(self, token: str) -> Dict:
        """Verificar e decodificar token de acesso."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])

            # Verificar se é um token de acesso
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED, 
                    detail="Tipo de token inválido. Token de acesso esperado."
                )

            return payload

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token expirado. Faça login novamente."
            )
        except jwt.InvalidTokenError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token inválido. Formato incorreto."
            )
        except jwt.InvalidKeyError:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro de configuração do servidor."
            )
        except jwt.DecodeError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Token malformado. Não foi possível decodificar."
            )
        except Exception as e:
            # Log de erro interno não esperado
            logger.error(f"Erro inesperado na verificação do token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
                detail="Erro interno do servidor"
            )

    async def create_token_pair(self, user_data: Dict) -> Tuple[str, str]:
        """Criar par de tokens (access + refresh)."""
        # Criar access token
        access_token = self.create_access_token(user_data)

        # Criar refresh token
        refresh_token, token_hash = self.create_refresh_token(user_data["id"])

        # Armazenar refresh token
        await self.store_refresh_token(user_data["id"], token_hash)

        return access_token, refresh_token

    async def refresh_access_token(self, refresh_token: str) -> Tuple[str, str]:
        """Renovar access token usando refresh token."""
        # Validar refresh token
        user_data = await self.validate_refresh_token(refresh_token)
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token inválido ou expirado",
            )

        # Revogar refresh token atual
        await self.revoke_refresh_token(refresh_token)

        # Criar novo par de tokens
        new_access_token, new_refresh_token = await self.create_token_pair(user_data)

        return new_access_token, new_refresh_token

    async def logout_user(self, refresh_token: str) -> bool:
        """Fazer logout revogando refresh token."""
        return await self.revoke_refresh_token(refresh_token)

    async def logout_all_devices(self, user_id: str) -> int:
        """Fazer logout de todos os dispositivos do usuário."""
        return await self.revoke_all_user_tokens(user_id)

    def get_token_expiration_info(self, token: str) -> Dict:
        """Obter informações de expiração do token."""
        try:
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={"verify_exp": False},
            )
            exp_timestamp = payload.get("exp")
            iat_timestamp = payload.get("iat")

            if exp_timestamp and iat_timestamp:
                exp_datetime = datetime.fromtimestamp(exp_timestamp)
                iat_datetime = datetime.fromtimestamp(iat_timestamp)

                return {
                    "issued_at": iat_datetime.isoformat(),
                    "expires_at": exp_datetime.isoformat(),
                    "expires_in_seconds": int(
                        (exp_datetime - datetime.utcnow()).total_seconds()
                    ),
                    "is_expired": exp_datetime < datetime.utcnow(),
                }
        except jwt.JWTError:
            pass

        return {}


# Funções auxiliares
def hash_password(password: str) -> str:
    """Criar hash da senha."""
    # Truncar senha se for muito longa para o bcrypt (máximo 72 bytes)
    if len(password.encode("utf-8")) > 72:
        password = password[:72]

    try:
        return pwd_context.hash(password)
    except Exception as e:
        # Fallback para SHA256 se bcrypt falhar
        import hashlib
        import secrets

        salt = secrets.token_hex(16)
        return f"sha256${salt}${hashlib.sha256((password + salt).encode()).hexdigest()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha."""
    # Truncar senha se for muito longa para o bcrypt (máximo 72 bytes)
    if len(plain_password.encode("utf-8")) > 72:
        plain_password = plain_password[:72]

    # Verificar se é hash SHA256 customizado
    if hashed_password.startswith("sha256$"):
        try:
            import hashlib

            parts = hashed_password.split("$")
            if len(parts) == 3:
                salt = parts[1]
                stored_hash = parts[2]
                computed_hash = hashlib.sha256(
                    (plain_password + salt).encode()
                ).hexdigest()
                return computed_hash == stored_hash
        except:
            pass

    # Tentar verificar com bcrypt
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        # Fallback para SHA256 simples se bcrypt falhar
        import hashlib

        sha256_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        return sha256_hash == hashed_password


def extract_token_from_header(authorization: str) -> str:
    """Extrair token do header Authorization."""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autorização não fornecido",
        )

    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Esquema de autorização inválido",
            )
        return token
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Formato de token inválido"
        )
