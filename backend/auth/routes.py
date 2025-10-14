# Rotas de Autenticação - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime
import logging
import os

from .token_manager import TokenManager, extract_token_from_header
from .security import (
    SecurityManager,
    TokenBlacklist,
    validate_password_security,
    validate_email_security,
)
from .rate_limiter import check_rate_limit, RateLimitType, get_rate_limit_info
from .services import LoginService
from .dependencies import (
    get_db,
    get_token_manager,
    get_security_manager,
    get_token_blacklist,
    get_current_user_payload,
)

logger = logging.getLogger(__name__)

# Router para autenticação
auth_router = APIRouter(prefix="/api/auth", tags=["autenticação"])


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
async def get_login_service(
    request: Request,
    token_manager: TokenManager = Depends(get_token_manager),
    security_manager: SecurityManager = Depends(get_security_manager),
) -> LoginService:
    """Dependency injection para o serviço de login."""
    db = get_db(request)
    return LoginService(db, token_manager, security_manager)


async def get_current_user(request: Request) -> Dict[str, Any]:
    """Retorna o usuário autenticado definido pelo middleware JWT."""
    return get_current_user_payload(request)


@auth_router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    login_service: LoginService = Depends(get_login_service),
):
    """Fazer login do usuário."""
    result = await login_service.login(request, login_data)
    return TokenResponse(**result)


@auth_router.post("/register", response_model=Dict[str, str])
async def register(
    request: Request,
    register_data: RegisterRequest,
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Registrar novo usuário."""
    db = get_db(request)
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
    token_manager: TokenManager = Depends(get_token_manager),
    security_manager: SecurityManager = Depends(get_security_manager),
):
    """Renovar access token usando refresh token."""
    db = get_db(request)
    try:
        # Renovar tokens
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
            expires_in=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15")) * 60,  # minutos em segundos
        )

    except HTTPException as e:
        # Log específico baseado no tipo de erro
        error_details = {"error": str(e.detail), "status_code": e.status_code}
        
        if e.status_code == 401:
            await security_manager.log_security_event(
                "token_refresh_unauthorized", None, request, error_details
            )
        elif e.status_code == 400:
            await security_manager.log_security_event(
                "token_refresh_bad_request", None, request, error_details
            )
        else:
            await security_manager.log_security_event(
                "token_refresh_failed", None, request, error_details
            )
        raise
    except Exception as e:
        # Log de erro interno não esperado
        await security_manager.log_security_event(
            "token_refresh_internal_error", None, request, {"error": str(e)}
        )
        logger.error(f"Erro interno no refresh token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@auth_router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    logout_data: LogoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token_manager: TokenManager = Depends(get_token_manager),
    blacklist: TokenBlacklist = Depends(get_token_blacklist),
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
