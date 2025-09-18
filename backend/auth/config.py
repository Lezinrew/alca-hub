# Configuração de Segurança - Alça Hub
import os
from typing import Dict, Any
from datetime import timedelta

# Configurações de JWT
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "alca-hub-jwt-secret-2025")
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Configurações de Rate Limiting
RATE_LIMIT_GENERAL = {
    "max_requests": int(os.getenv("RATE_LIMIT_GENERAL_MAX", "100")),
    "window_seconds": int(os.getenv("RATE_LIMIT_GENERAL_WINDOW", "60"))
}

RATE_LIMIT_LOGIN = {
    "max_requests": int(os.getenv("RATE_LIMIT_LOGIN_MAX", "5")),
    "window_seconds": int(os.getenv("RATE_LIMIT_LOGIN_WINDOW", "900"))  # 15 minutos
}

RATE_LIMIT_REGISTER = {
    "max_requests": int(os.getenv("RATE_LIMIT_REGISTER_MAX", "3")),
    "window_seconds": int(os.getenv("RATE_LIMIT_REGISTER_WINDOW", "3600"))  # 1 hora
}

RATE_LIMIT_PASSWORD_RESET = {
    "max_requests": int(os.getenv("RATE_LIMIT_PASSWORD_RESET_MAX", "3")),
    "window_seconds": int(os.getenv("RATE_LIMIT_PASSWORD_RESET_WINDOW", "3600"))  # 1 hora
}

# Configurações de Segurança
PASSWORD_MIN_LENGTH = int(os.getenv("PASSWORD_MIN_LENGTH", "8"))
PASSWORD_REQUIRE_UPPERCASE = os.getenv("PASSWORD_REQUIRE_UPPERCASE", "true").lower() == "true"
PASSWORD_REQUIRE_LOWERCASE = os.getenv("PASSWORD_REQUIRE_LOWERCASE", "true").lower() == "true"
PASSWORD_REQUIRE_NUMBERS = os.getenv("PASSWORD_REQUIRE_NUMBERS", "true").lower() == "true"
PASSWORD_REQUIRE_SPECIAL = os.getenv("PASSWORD_REQUIRE_SPECIAL", "true").lower() == "true"

# Configurações de Blacklist
BLACKLIST_TOKEN_LIFETIME = int(os.getenv("BLACKLIST_TOKEN_LIFETIME", "86400"))  # 24 horas
BLACKLIST_CLEANUP_INTERVAL = int(os.getenv("BLACKLIST_CLEANUP_INTERVAL", "3600"))  # 1 hora

# Configurações de Logs de Segurança
SECURITY_LOG_RETENTION_DAYS = int(os.getenv("SECURITY_LOG_RETENTION_DAYS", "30"))
SECURITY_LOG_CLEANUP_INTERVAL = int(os.getenv("SECURITY_LOG_CLEANUP_INTERVAL", "86400"))  # 24 horas

# Configurações de CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
CORS_ALLOW_CREDENTIALS = os.getenv("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
CORS_ALLOW_METHODS = os.getenv("CORS_ALLOW_METHODS", "GET,POST,PUT,DELETE,OPTIONS").split(",")
CORS_ALLOW_HEADERS = os.getenv("CORS_ALLOW_HEADERS", "Content-Type,Authorization").split(",")

# Configurações de Headers de Segurança
SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'self'",
    "X-Permitted-Cross-Domain-Policies": "none"
}

# Configurações de Sessão
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", "30"))
SESSION_CLEANUP_INTERVAL = int(os.getenv("SESSION_CLEANUP_INTERVAL", "3600"))  # 1 hora

# Configurações de Detecção de Atividade Suspeita
SUSPICIOUS_ACTIVITY_THRESHOLDS = {
    "max_login_attempts_per_15min": int(os.getenv("MAX_LOGIN_ATTEMPTS_15MIN", "10")),
    "max_unique_ips_per_hour": int(os.getenv("MAX_UNIQUE_IPS_HOUR", "3")),
    "max_denied_attempts_per_30min": int(os.getenv("MAX_DENIED_ATTEMPTS_30MIN", "5"))
}

# Configurações de Notificações de Segurança
SECURITY_NOTIFICATIONS = {
    "email_on_suspicious_activity": os.getenv("EMAIL_ON_SUSPICIOUS_ACTIVITY", "true").lower() == "true",
    "email_on_multiple_logins": os.getenv("EMAIL_ON_MULTIPLE_LOGINS", "true").lower() == "true",
    "email_on_password_change": os.getenv("EMAIL_ON_PASSWORD_CHANGE", "true").lower() == "true"
}

# Configurações de Backup e Recuperação
BACKUP_ENABLED = os.getenv("BACKUP_ENABLED", "true").lower() == "true"
BACKUP_INTERVAL_HOURS = int(os.getenv("BACKUP_INTERVAL_HOURS", "24"))
BACKUP_RETENTION_DAYS = int(os.getenv("BACKUP_RETENTION_DAYS", "30"))

# Configurações de Monitoramento
MONITORING_ENABLED = os.getenv("MONITORING_ENABLED", "true").lower() == "true"
MONITORING_METRICS_INTERVAL = int(os.getenv("MONITORING_METRICS_INTERVAL", "300"))  # 5 minutos
MONITORING_ALERT_THRESHOLDS = {
    "high_error_rate": float(os.getenv("MONITORING_HIGH_ERROR_RATE", "0.05")),  # 5%
    "high_response_time": float(os.getenv("MONITORING_HIGH_RESPONSE_TIME", "2.0")),  # 2 segundos
    "high_memory_usage": float(os.getenv("MONITORING_HIGH_MEMORY_USAGE", "0.8"))  # 80%
}

# Configurações de Desenvolvimento vs Produção
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# Configurações específicas por ambiente
if ENVIRONMENT == "production":
    # Produção: configurações mais restritivas
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    RATE_LIMIT_GENERAL["max_requests"] = 100
    RATE_LIMIT_LOGIN["max_requests"] = 5
    PASSWORD_MIN_LENGTH = 12
    SECURITY_HEADERS["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
    
elif ENVIRONMENT == "development":
    # Desenvolvimento: configurações mais permissivas
    ACCESS_TOKEN_EXPIRE_MINUTES = 60
    REFRESH_TOKEN_EXPIRE_DAYS = 30
    RATE_LIMIT_GENERAL["max_requests"] = 1000
    RATE_LIMIT_LOGIN["max_requests"] = 50
    PASSWORD_MIN_LENGTH = 6
    DEBUG = True

# Função para obter configurações
def get_security_config() -> Dict[str, Any]:
    """Obter configurações de segurança."""
    return {
        "jwt": {
            "secret_key": JWT_SECRET_KEY,
            "algorithm": JWT_ALGORITHM,
            "access_token_expire_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
            "refresh_token_expire_days": REFRESH_TOKEN_EXPIRE_DAYS
        },
        "rate_limiting": {
            "general": RATE_LIMIT_GENERAL,
            "login": RATE_LIMIT_LOGIN,
            "register": RATE_LIMIT_REGISTER,
            "password_reset": RATE_LIMIT_PASSWORD_RESET
        },
        "password": {
            "min_length": PASSWORD_MIN_LENGTH,
            "require_uppercase": PASSWORD_REQUIRE_UPPERCASE,
            "require_lowercase": PASSWORD_REQUIRE_LOWERCASE,
            "require_numbers": PASSWORD_REQUIRE_NUMBERS,
            "require_special": PASSWORD_REQUIRE_SPECIAL
        },
        "blacklist": {
            "token_lifetime": BLACKLIST_TOKEN_LIFETIME,
            "cleanup_interval": BLACKLIST_CLEANUP_INTERVAL
        },
        "security_headers": SECURITY_HEADERS,
        "cors": {
            "origins": CORS_ORIGINS,
            "allow_credentials": CORS_ALLOW_CREDENTIALS,
            "allow_methods": CORS_ALLOW_METHODS,
            "allow_headers": CORS_ALLOW_HEADERS
        },
        "monitoring": {
            "enabled": MONITORING_ENABLED,
            "metrics_interval": MONITORING_METRICS_INTERVAL,
            "alert_thresholds": MONITORING_ALERT_THRESHOLDS
        },
        "environment": ENVIRONMENT,
        "debug": DEBUG
    }

# Função para validar configurações
def validate_security_config() -> bool:
    """Validar configurações de segurança."""
    try:
        # Verificar se JWT secret key está definido
        if not JWT_SECRET_KEY or JWT_SECRET_KEY == "alca-hub-jwt-secret-2025":
            if ENVIRONMENT == "production":
                raise ValueError("JWT_SECRET_KEY deve ser definido em produção")
        
        # Verificar se configurações de rate limiting são válidas
        for config_name, config in [
            ("GENERAL", RATE_LIMIT_GENERAL),
            ("LOGIN", RATE_LIMIT_LOGIN),
            ("REGISTER", RATE_LIMIT_REGISTER),
            ("PASSWORD_RESET", RATE_LIMIT_PASSWORD_RESET)
        ]:
            if config["max_requests"] <= 0 or config["window_seconds"] <= 0:
                raise ValueError(f"Configuração de rate limiting {config_name} inválida")
        
        # Verificar se configurações de senha são válidas
        if PASSWORD_MIN_LENGTH < 6:
            raise ValueError("PASSWORD_MIN_LENGTH deve ser pelo menos 6")
        
        return True
        
    except Exception as e:
        print(f"Erro na validação de configurações: {e}")
        return False

# Função para obter configurações de rate limiting
def get_rate_limit_config(limit_type: str) -> Dict[str, int]:
    """Obter configuração de rate limiting por tipo."""
    configs = {
        "general": RATE_LIMIT_GENERAL,
        "login": RATE_LIMIT_LOGIN,
        "register": RATE_LIMIT_REGISTER,
        "password_reset": RATE_LIMIT_PASSWORD_RESET
    }
    
    return configs.get(limit_type, RATE_LIMIT_GENERAL)

# Função para obter configurações de senha
def get_password_config() -> Dict[str, Any]:
    """Obter configurações de validação de senha."""
    return {
        "min_length": PASSWORD_MIN_LENGTH,
        "require_uppercase": PASSWORD_REQUIRE_UPPERCASE,
        "require_lowercase": PASSWORD_REQUIRE_LOWERCASE,
        "require_numbers": PASSWORD_REQUIRE_NUMBERS,
        "require_special": PASSWORD_REQUIRE_SPECIAL
    }
