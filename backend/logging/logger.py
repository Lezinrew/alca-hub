# Sistema de Logging Avançado - Alça Hub
import logging as std_logging
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path
import os

# Evitar conflito de nomes
import logging as _logging


class StructuredLogger:
    """Logger estruturado para produção."""
    
    def __init__(self, name: str, log_level: str = "INFO"):
        self.logger = _logging.getLogger(name)
        self.logger.setLevel(getattr(_logging, log_level.upper()))
        
        # Evitar duplicação de handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Configurar handlers de logging."""
        # Console handler
        console_handler = _logging.StreamHandler(sys.stdout)
        console_handler.setLevel(_logging.INFO)
        console_formatter = _logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler para logs gerais
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        file_handler = _logging.FileHandler(log_dir / "app.log")
        file_handler.setLevel(_logging.INFO)
        file_formatter = _logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)
        
        # Error handler
        error_handler = _logging.FileHandler(log_dir / "error.log")
        error_handler.setLevel(_logging.ERROR)
        error_handler.setFormatter(file_formatter)
        self.logger.addHandler(error_handler)
    
    def log_structured(self, level: str, message: str, **kwargs):
        """Log estruturado com metadados."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level.upper(),
            "message": message,
            **kwargs
        }
        
        log_message = json.dumps(log_data, ensure_ascii=False)
        
        if level.upper() == "ERROR":
            self.logger.error(log_message)
        elif level.upper() == "WARNING":
            self.logger.warning(log_message)
        elif level.upper() == "INFO":
            self.logger.info(log_message)
        elif level.upper() == "DEBUG":
            self.logger.debug(log_message)
    
    def log_request(self, method: str, url: str, status_code: int, 
                   response_time: float, user_id: Optional[str] = None):
        """Log de requisições HTTP."""
        self.log_structured(
            "INFO",
            f"{method} {url} - {status_code}",
            type="http_request",
            method=method,
            url=url,
            status_code=status_code,
            response_time_ms=response_time * 1000,
            user_id=user_id
        )
    
    def log_security_event(self, event_type: str, user_id: str, 
                          ip_address: str, details: Dict[str, Any]):
        """Log de eventos de segurança."""
        self.log_structured(
            "WARNING",
            f"Security event: {event_type}",
            type="security_event",
            event_type=event_type,
            user_id=user_id,
            ip_address=ip_address,
            details=details
        )
    
    def log_business_event(self, event_type: str, user_id: str, 
                          data: Dict[str, Any]):
        """Log de eventos de negócio."""
        self.log_structured(
            "INFO",
            f"Business event: {event_type}",
            type="business_event",
            event_type=event_type,
            user_id=user_id,
            data=data
        )
    
    def log_performance(self, operation: str, duration: float, 
                       metadata: Dict[str, Any]):
        """Log de performance."""
        self.log_structured(
            "INFO",
            f"Performance: {operation}",
            type="performance",
            operation=operation,
            duration_ms=duration * 1000,
            metadata=metadata
        )
    
    def log_error(self, error: Exception, context: Dict[str, Any]):
        """Log de erros com contexto."""
        self.log_structured(
            "ERROR",
            f"Error: {str(error)}",
            type="error",
            error_type=type(error).__name__,
            error_message=str(error),
            context=context
        )


class AuditLogger:
    """Logger de auditoria para eventos críticos."""
    
    def __init__(self):
        self.logger = _logging.getLogger("audit")
        self.logger.setLevel(_logging.INFO)
        
        if not self.logger.handlers:
            self._setup_audit_handler()
    
    def _setup_audit_handler(self):
        """Configurar handler de auditoria."""
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        audit_handler = _logging.FileHandler(log_dir / "audit.log")
        audit_handler.setLevel(_logging.INFO)
        audit_formatter = _logging.Formatter(
            '%(asctime)s - AUDIT - %(message)s'
        )
        audit_handler.setFormatter(audit_formatter)
        self.logger.addHandler(audit_handler)
    
    def log_user_action(self, user_id: str, action: str, resource: str, 
                       details: Dict[str, Any]):
        """Log de ações do usuário."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "details": details
        }
        
        self.logger.info(json.dumps(audit_data, ensure_ascii=False))
    
    def log_system_change(self, admin_id: str, change_type: str, 
                         before: Dict[str, Any], after: Dict[str, Any]):
        """Log de mudanças no sistema."""
        audit_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "admin_id": admin_id,
            "change_type": change_type,
            "before": before,
            "after": after
        }
        
        self.logger.info(json.dumps(audit_data, ensure_ascii=False))


# Instâncias globais
app_logger = StructuredLogger("alca_hub")
audit_logger = AuditLogger()


def get_logger(name: str) -> StructuredLogger:
    """Obter logger para um módulo específico."""
    return StructuredLogger(name)


def log_request(method: str, url: str, status_code: int, 
               response_time: float, user_id: Optional[str] = None):
    """Log de requisição HTTP."""
    app_logger.log_request(method, url, status_code, response_time, user_id)


def log_security_event(event_type: str, user_id: str, ip_address: str, 
                      details: Dict[str, Any]):
    """Log de evento de segurança."""
    app_logger.log_security_event(event_type, user_id, ip_address, details)


def log_business_event(event_type: str, user_id: str, data: Dict[str, Any]):
    """Log de evento de negócio."""
    app_logger.log_business_event(event_type, user_id, data)


def log_performance(operation: str, duration: float, metadata: Dict[str, Any]):
    """Log de performance."""
    app_logger.log_performance(operation, duration, metadata)


def log_error(error: Exception, context: Dict[str, Any]):
    """Log de erro."""
    app_logger.log_error(error, context)
