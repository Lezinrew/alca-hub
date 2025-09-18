# Middleware de Segurança - Alça Hub
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import asyncio
from typing import Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from .security import SecurityManager, TokenBlacklist
from .token_manager import TokenManager
import logging

logger = logging.getLogger(__name__)

class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware de segurança para rate limiting e validação."""
    
    def __init__(self, app: ASGIApp, security_manager: SecurityManager):
        super().__init__(app)
        self.security_manager = security_manager
    
    async def dispatch(self, request: Request, call_next):
        """Processar requisição com verificações de segurança."""
        start_time = time.time()
        
        try:
            # Verificar rate limiting
            if not await self.security_manager.check_rate_limit(request):
                await self.security_manager.log_security_event(
                    "rate_limit_exceeded",
                    None,
                    request,
                    {"endpoint": str(request.url)}
                )
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "detail": "Muitas requisições. Tente novamente em alguns minutos.",
                        "retry_after": 60
                    }
                )
            
            # Processar requisição
            response = await call_next(request)
            
            # Log de resposta
            processing_time = time.time() - start_time
            if response.status_code >= 400:
                await self.security_manager.log_security_event(
                    "error_response",
                    None,
                    request,
                    {
                        "status_code": response.status_code,
                        "processing_time": processing_time
                    }
                )
            
            return response
            
        except Exception as e:
            logger.error(f"Erro no middleware de segurança: {str(e)}")
            await self.security_manager.log_security_event(
                "middleware_error",
                None,
                request,
                {"error": str(e)}
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Erro interno do servidor"}
            )

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware de autenticação para endpoints protegidos."""
    
    def __init__(self, app: ASGIApp, token_manager: TokenManager, 
                 blacklist: TokenBlacklist, security_manager: SecurityManager):
        super().__init__(app)
        self.token_manager = token_manager
        self.blacklist = blacklist
        self.security_manager = security_manager
    
    async def dispatch(self, request: Request, call_next):
        """Processar requisição com verificação de autenticação."""
        # Verificar se endpoint requer autenticação
        if self._requires_auth(request):
            try:
                # Extrair token do header
                auth_header = request.headers.get("Authorization")
                if not auth_header:
                    await self.security_manager.log_security_event(
                        "missing_auth_token",
                        None,
                        request,
                        {"endpoint": str(request.url)}
                    )
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={"detail": "Token de autorização não fornecido"}
                    )
                
                # Verificar se token está na blacklist
                if await self.blacklist.is_blacklisted(auth_header.replace("Bearer ", "")):
                    await self.security_manager.log_security_event(
                        "blacklisted_token_used",
                        None,
                        request,
                        {"endpoint": str(request.url)}
                    )
                    return JSONResponse(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        content={"detail": "Token inválido ou expirado"}
                    )
                
                # Validar token
                token = auth_header.replace("Bearer ", "")
                try:
                    payload = self.token_manager.verify_access_token(token)
                    request.state.user = payload
                except HTTPException as e:
                    await self.security_manager.log_security_event(
                        "invalid_token",
                        None,
                        request,
                        {"endpoint": str(request.url), "error": str(e.detail)}
                    )
                    return JSONResponse(
                        status_code=e.status_code,
                        content={"detail": e.detail}
                    )
                
            except Exception as e:
                logger.error(f"Erro no middleware de autenticação: {str(e)}")
                await self.security_manager.log_security_event(
                    "auth_middleware_error",
                    None,
                    request,
                    {"error": str(e)}
                )
                return JSONResponse(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    content={"detail": "Erro interno do servidor"}
                )
        
        # Processar requisição
        response = await call_next(request)
        return response
    
    def _requires_auth(self, request: Request) -> bool:
        """Verificar se endpoint requer autenticação."""
        # Endpoints públicos
        public_endpoints = [
            "/api/auth/login",
            "/api/auth/register",
            "/api/auth/refresh",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/ping",
            "/health"
        ]
        
        # Verificar se é endpoint público
        for endpoint in public_endpoints:
            if request.url.path.startswith(endpoint):
                return False
        
        # Verificar se é endpoint de autenticação
        if request.url.path.startswith("/api/auth/"):
            return False
        
        # Todos os outros endpoints requerem autenticação
        return True

class LoginRateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware específico para rate limiting de login."""
    
    def __init__(self, app: ASGIApp, security_manager: SecurityManager):
        super().__init__(app)
        self.security_manager = security_manager
    
    async def dispatch(self, request: Request, call_next):
        """Processar requisição com rate limiting de login."""
        if request.url.path == "/api/auth/login":
            # Extrair email da requisição
            try:
                body = await request.body()
                import json
                data = json.loads(body)
                email = data.get("email", "")
                
                # Verificar rate limiting para login
                if not await self.security_manager.check_login_rate_limit(request, email):
                    await self.security_manager.log_security_event(
                        "login_rate_limit_exceeded",
                        None,
                        request,
                        {"email": email}
                    )
                    return JSONResponse(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        content={
                            "detail": "Muitas tentativas de login. Tente novamente em 15 minutos.",
                            "retry_after": 900
                        }
                    )
                
            except Exception as e:
                logger.error(f"Erro ao verificar rate limiting de login: {str(e)}")
        
        # Processar requisição
        response = await call_next(request)
        return response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware para adicionar headers de segurança."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        """Adicionar headers de segurança à resposta."""
        response = await call_next(request)
        
        # Headers de segurança
        security_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Content-Security-Policy": "default-src 'self'",
            "X-Permitted-Cross-Domain-Policies": "none"
        }
        
        for header, value in security_headers.items():
            response.headers[header] = value
        
        return response

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requisições."""
    
    def __init__(self, app: ASGIApp, security_manager: SecurityManager):
        super().__init__(app)
        self.security_manager = security_manager
    
    async def dispatch(self, request: Request, call_next):
        """Log de requisições para auditoria."""
        start_time = time.time()
        
        # Processar requisição
        response = await call_next(request)
        
        # Calcular tempo de processamento
        processing_time = time.time() - start_time
        
        # Log de requisição
        await self.security_manager.log_security_event(
            "request_processed",
            getattr(request.state, 'user', {}).get('id') if hasattr(request.state, 'user') else None,
            request,
            {
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "processing_time": processing_time,
                "user_agent": request.headers.get("user-agent", ""),
                "ip_address": request.client.host
            }
        )
        
        return response

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware para tratamento de erros."""
    
    def __init__(self, app: ASGIApp, security_manager: SecurityManager):
        super().__init__(app)
        self.security_manager = security_manager
    
    async def dispatch(self, request: Request, call_next):
        """Tratar erros de forma segura."""
        try:
            response = await call_next(request)
            return response
        except HTTPException as e:
            # Log de erro HTTP
            await self.security_manager.log_security_event(
                "http_error",
                getattr(request.state, 'user', {}).get('id') if hasattr(request.state, 'user') else None,
                request,
                {
                    "status_code": e.status_code,
                    "detail": str(e.detail)
                }
            )
            return JSONResponse(
                status_code=e.status_code,
                content={"detail": str(e.detail)}
            )
        except Exception as e:
            # Log de erro interno
            logger.error(f"Erro interno: {str(e)}")
            await self.security_manager.log_security_event(
                "internal_error",
                getattr(request.state, 'user', {}).get('id') if hasattr(request.state, 'user') else None,
                request,
                {"error": str(e)}
            )
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Erro interno do servidor"}
            )

# Função para configurar todos os middlewares
def setup_security_middlewares(app: ASGIApp, db: AsyncIOMotorDatabase):
    """Configurar todos os middlewares de segurança."""
    security_manager = SecurityManager(db)
    token_manager = TokenManager(db)
    blacklist = TokenBlacklist(db)
    
    # Adicionar middlewares na ordem correta
    app.add_middleware(ErrorHandlingMiddleware, security_manager=security_manager)
    app.add_middleware(RequestLoggingMiddleware, security_manager=security_manager)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(LoginRateLimitMiddleware, security_manager=security_manager)
    app.add_middleware(AuthenticationMiddleware, 
                       token_manager=token_manager, 
                       blacklist=blacklist, 
                       security_manager=security_manager)
    app.add_middleware(SecurityMiddleware, security_manager=security_manager)
    
    return security_manager, token_manager, blacklist
