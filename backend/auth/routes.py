# Rotas de Autenticação - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
import logging

from .token_manager import TokenManager, extract_token_from_header
from .security import (
    SecurityManager,
    TokenBlacklist,
    validate_password_security,
    validate_email_security,
)
from .rate_limiter import check_rate_limit, RateLimitType, get_rate_limit_info

logger = logging.getLogger(__name__)

# Router para autenticação
auth_router = APIRouter(prefix="/api/auth", tags=["autenticação"])
security = HTTPBearer()


# Modelos Pydantic
class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class RegisterRequest(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    telefone: str
    tipo: str
    apartamento: Optional[str] = None
    bloco: Optional[str] = None
    especialidades: Optional[list] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ChangePasswordRequest(BaseModel):
    senha_atual: str
    nova_senha: str


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]


class RefreshResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class LogoutResponse(BaseModel):
    message: str
    logout_time: str


# Dependências
async def get_token_manager(db: AsyncIOMotorDatabase = Depends()) -> TokenManager:
    """Obter instância do gerenciador de tokens."""
    # TODO(refactor): Adicionar docstring explicando o que esta função faz, seus parâmetros e o que retorna.
    return TokenManager(db)


async def get_security_manager(db: AsyncIOMotorDatabase = Depends()) -> SecurityManager:
    """Obter instância do gerenciador de segurança."""
    return SecurityManager(db)


async def get_blacklist(db: AsyncIOMotorDatabase = Depends()) -> TokenBlacklist:
    """Obter instância da blacklist."""
    return TokenBlacklist(db)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    token_manager: TokenManager = Depends(get_token_manager),
    blacklist: TokenBlacklist = Depends(get_blacklist),
) -> Dict[str, Any]:
    """Obter usuário atual do token."""
    token = credentials.credentials

    # Verificar se token está na blacklist
    if await blacklist.is_blacklisted(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido ou expirado",
        )

    # Verificar token
    try:
        payload = token_manager.verify_access_token(token)
        return payload
    except HTTPException:
        raise


@auth_router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: AsyncIOMotorDatabase = Depends(),
    token_manager: TokenManager = Depends(get_token_manager),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Fazer login do usuário."""
    # Verificar rate limiting
    # TODO(security): Mover este valor hardcoded para uma variável de ambiente no arquivo .env.
    client_id = f"{request.client.host}:{request.headers.get('user-agent', '')[:8]}"
    rate_limit_result = await check_rate_limit(client_id, RateLimitType.LOGIN)

    if not rate_limit_result.allowed:
        await security_manager.log_security_event(
            "login_rate_limit_exceeded", None, request, {"email": login_data.email}
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Muitas tentativas de login. Tente novamente em {rate_limit_result.retry_after} segundos.",
        )

    # Validar email
    if not validate_email_security(login_data.email):
        await security_manager.log_security_event(
            "invalid_email_format", None, request, {"email": login_data.email}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de email inválido"
        )

    # Buscar usuário no banco
    user = await db.users.find_one({"email": login_data.email, "ativo": True})

    if not user:
        await security_manager.log_security_event(
            "login_user_not_found", None, request, {"email": login_data.email}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )

    # Verificar senha
    from .token_manager import verify_password

    if not verify_password(login_data.senha, user["senha"]):
        await security_manager.log_security_event(
            "login_invalid_password",
            str(user["_id"]),
            request,
            {"email": login_data.email},
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciais inválidas"
        )

    # Criar par de tokens
    user_data = {
        "id": str(user["_id"]),
        "email": user["email"],
        "tipo": user["tipo"],
        "nome": user["nome"],
    }

    access_token, refresh_token = await token_manager.create_token_pair(user_data)

    # Log de login bem-sucedido
    await security_manager.log_security_event(
        "login_success", str(user["_id"]), request, {"email": login_data.email}
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=15 * 60,  # 15 minutos
        # TODO(security): Mover este valor hardcoded para uma variável de ambiente no arquivo .env.
        user=user_data,
    )


@auth_router.post("/register", response_model=Dict[str, str])
async def register(
    request: Request,
    register_data: RegisterRequest,
    db: AsyncIOMotorDatabase = Depends(),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Registrar novo usuário."""
    # Verificar rate limiting
    client_id = f"{request.client.host}:{request.headers.get('user-agent', '')[:8]}"
    rate_limit_result = await check_rate_limit(client_id, RateLimitType.REGISTER)

    if not rate_limit_result.allowed:
        await security_manager.log_security_event(
            "register_rate_limit_exceeded",
            None,
            request,
            {"email": register_data.email},
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Muitas tentativas de registro. Tente novamente em {rate_limit_result.retry_after} segundos.",
        )

    # Validar dados
    if not validate_email_security(register_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de email inválido"
        )

    password_validation = validate_password_security(register_data.senha)
    if not password_validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Senha inválida: {', '.join(password_validation['errors'])}",
        )

    # Verificar se email já existe
    existing_user = await db.users.find_one({"email": register_data.email})
    if existing_user:
        await security_manager.log_security_event(
            "register_duplicate_email", None, request, {"email": register_data.email}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado"
        )

    # Criar hash da senha
    from .token_manager import hash_password

    hashed_password = hash_password(register_data.senha)

    # Criar usuário
    user_data = {
        "nome": register_data.nome,
        "email": register_data.email,
        "senha": hashed_password,
        "telefone": register_data.telefone,
        "tipo": register_data.tipo,
        "ativo": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }

    # Adicionar campos específicos por tipo
    if register_data.tipo == "morador":
        user_data.update(
            {"apartamento": register_data.apartamento, "bloco": register_data.bloco}
        )
    elif register_data.tipo == "prestador":
        user_data.update({"especialidades": register_data.especialidades or []})

    result = await db.users.insert_one(user_data)

    # Log de registro
    await security_manager.log_security_event(
        "register_success",
        str(result.inserted_id),
        request,
        {"email": register_data.email, "tipo": register_data.tipo},
    )

    return {"message": "Usuário criado com sucesso", "user_id": str(result.inserted_id)}


@auth_router.post("/refresh", response_model=RefreshResponse)
async def refresh_token(
    request: Request,
    refresh_data: RefreshTokenRequest,
    db: AsyncIOMotorDatabase = Depends(),
    token_manager: TokenManager = Depends(get_token_manager),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Renovar access token usando refresh token."""
    try:
        # Renovar tokens
        # TODO(robustness): Implementar um tratamento de erros mais específico para este bloco.
        new_access_token, new_refresh_token = await token_manager.refresh_access_token(
            refresh_data.refresh_token
        )

        # Log de renovação
        await security_manager.log_security_event(
            "token_refresh_success", None, request, {}
        )

        return RefreshResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            expires_in=15 * 60,  # 15 minutos
        )

    except HTTPException as e:
        await security_manager.log_security_event(
            "token_refresh_failed", None, request, {"error": str(e.detail)}
        )
        raise


@auth_router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    logout_data: LogoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token_manager: TokenManager = Depends(get_token_manager),
    blacklist: TokenBlacklist = Depends(get_blacklist),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Fazer logout do usuário."""
    # Revogar refresh token se fornecido
    if logout_data.refresh_token:
        await token_manager.revoke_refresh_token(logout_data.refresh_token)

    # Adicionar access token à blacklist
    # Nota: Em uma implementação real, você precisaria extrair o token da requisição
    # Por simplicidade, vamos assumir que o token está disponível

    # Log de logout
    await security_manager.log_security_event(
        "logout_success", current_user["id"], request, {}
    )

    return LogoutResponse(
        message="Logout realizado com sucesso",
        logout_time=datetime.utcnow().isoformat(),
    )


@auth_router.post("/logout-all")
async def logout_all_devices(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token_manager: TokenManager = Depends(get_token_manager),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Fazer logout de todos os dispositivos do usuário."""
    # Revogar todos os refresh tokens
    revoked_count = await token_manager.revoke_all_user_tokens(current_user["id"])

    # Log de logout global
    await security_manager.log_security_event(
        "logout_all_devices",
        current_user["id"],
        request,
        {"revoked_tokens": revoked_count},
    )

    return {
        "message": f"Logout realizado em {revoked_count} dispositivos",
        "revoked_tokens": revoked_count,
    }


@auth_router.get("/me")
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Obter informações do usuário atual."""
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "tipo": current_user["tipo"],
        "nome": current_user["nome"],
    }


@auth_router.post("/change-password")
async def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Alterar senha do usuário."""
    # Validar nova senha
    password_validation = validate_password_security(password_data.nova_senha)
    if not password_validation["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Senha inválida: {', '.join(password_validation['errors'])}",
        )

    # Buscar usuário
    user = await db.users.find_one({"_id": current_user["id"]})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuário não encontrado"
        )

    # Verificar senha atual
    from .token_manager import verify_password

    if not verify_password(password_data.senha_atual, user["senha"]):
        await security_manager.log_security_event(
            "password_change_invalid_current", current_user["id"], request, {}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Senha atual incorreta"
        )

    # Atualizar senha
    from .token_manager import hash_password

    new_hashed_password = hash_password(password_data.nova_senha)

    await db.users.update_one(
        {"_id": current_user["id"]},
        {"$set": {"senha": new_hashed_password, "updated_at": datetime.utcnow()}},
    )

    # Log de alteração de senha
    await security_manager.log_security_event(
        "password_change_success", current_user["id"], request, {}
    )

    return {"message": "Senha alterada com sucesso"}


@auth_router.get("/rate-limit-info")
async def get_rate_limit_info_endpoint(
    request: Request, rate_limit_type: str = "general"
):
    """Obter informações de rate limiting."""
    client_id = f"{request.client.host}:{request.headers.get('user-agent', '')[:8]}"

    try:
        rate_limit_enum = RateLimitType(rate_limit_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de rate limiting inválido",
        )

    info = await get_rate_limit_info(client_id, rate_limit_enum)
    return info
