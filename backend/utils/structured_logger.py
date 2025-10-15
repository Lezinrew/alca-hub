"""
Logger estruturado para o Alça Hub
"""
import json
import logging
import sys
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path

from .log_sanitizer import sanitize_log_message


class StructuredFormatter(logging.Formatter):
    """Formatter que produz logs estruturados em JSON"""
    
    def format(self, record: logging.LogRecord) -> str:
        """Formata o log como JSON estruturado"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Adicionar campos extras se existirem
        if hasattr(record, 'extra_fields'):
            log_entry.update(record.extra_fields)
        
        # Adicionar informações de request se existirem
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'ip_address'):
            log_entry['ip_address'] = record.ip_address
        
        # Sanitizar dados sensíveis
        log_entry = sanitize_log_message(log_entry)
        
        return json.dumps(log_entry, ensure_ascii=False)


class StructuredLogger:
    """Logger estruturado para o Alça Hub"""
    
    def __init__(self, name: str = "alca_hub", log_level: str = "INFO"):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(getattr(logging, log_level.upper()))
        
        # Remover handlers existentes
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Configurar handler para console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(StructuredFormatter())
        self.logger.addHandler(console_handler)
        
        # Configurar handler para arquivo (se não estiver em teste)
        if not self._is_testing():
            self._setup_file_handler()
    
    def _is_testing(self) -> bool:
        """Verifica se está em ambiente de teste"""
        import os
        return os.environ.get("TESTING") == "1" or os.environ.get("ENV", "").lower() == "test"
    
    def _setup_file_handler(self):
        """Configura handler para arquivo"""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        # Handler para logs gerais
        file_handler = logging.FileHandler(log_dir / "app.log")
        file_handler.setFormatter(StructuredFormatter())
        self.logger.addHandler(file_handler)
        
        # Handler para logs de erro
        error_handler = logging.FileHandler(log_dir / "error.log")
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(StructuredFormatter())
        self.logger.addHandler(error_handler)
    
    def _log_with_context(self, level: str, message: str, **kwargs):
        """Log com contexto adicional"""
        extra_fields = {k: v for k, v in kwargs.items() if k not in ['request_id', 'user_id', 'ip_address']}
        
        # Criar record com campos extras
        record = self.logger.makeRecord(
            self.logger.name,
            getattr(logging, level.upper()),
            "",  # filename
            0,   # lineno
            message,
            (),  # args
            None  # exc_info
        )
        
        # Adicionar campos extras
        record.extra_fields = extra_fields
        
        # Adicionar campos de contexto se fornecidos
        if 'request_id' in kwargs:
            record.request_id = kwargs['request_id']
        if 'user_id' in kwargs:
            record.user_id = kwargs['user_id']
        if 'ip_address' in kwargs:
            record.ip_address = kwargs['ip_address']
        
        self.logger.handle(record)
    
    def info(self, message: str, **kwargs):
        """Log de informação"""
        self._log_with_context("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de aviso"""
        self._log_with_context("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de erro"""
        self._log_with_context("ERROR", message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log de debug"""
        self._log_with_context("DEBUG", message, **kwargs)
    
    def critical(self, message: str, **kwargs):
        """Log crítico"""
        self._log_with_context("CRITICAL", message, **kwargs)


# Instância global do logger
logger = StructuredLogger()


# Funções utilitárias para logging comum
def log_user_action(action: str, user_id: str, **kwargs):
    """Log de ação do usuário"""
    logger.info(f"User action: {action}", user_id=user_id, action=action, **kwargs)


def log_api_request(method: str, endpoint: str, status_code: int, **kwargs):
    """Log de requisição API"""
    logger.info(
        f"API request: {method} {endpoint}",
        method=method,
        endpoint=endpoint,
        status_code=status_code,
        **kwargs
    )


def log_security_event(event_type: str, **kwargs):
    """Log de evento de segurança"""
    logger.warning(
        f"Security event: {event_type}",
        event_type=event_type,
        severity="security",
        **kwargs
    )


def log_performance_metric(metric_name: str, value: float, unit: str = "ms", **kwargs):
    """Log de métrica de performance"""
    logger.info(
        f"Performance metric: {metric_name}",
        metric_name=metric_name,
        value=value,
        unit=unit,
        **kwargs
    )


def log_business_event(event_type: str, **kwargs):
    """Log de evento de negócio"""
    logger.info(
        f"Business event: {event_type}",
        event_type=event_type,
        **kwargs
    )


# Exemplo de uso:
if __name__ == "__main__":
    # Teste do logger
    logger.info("Aplicação iniciada", version="1.0.0")
    
    log_user_action("login", "user123", ip_address="192.168.1.1")
    log_api_request("GET", "/api/providers", 200, response_time=150)
    log_security_event("failed_login", user_id="user123", ip_address="192.168.1.1")
    log_performance_metric("response_time", 150.5, "ms", endpoint="/api/providers")
    log_business_event("booking_created", booking_id="booking123", user_id="user123")
