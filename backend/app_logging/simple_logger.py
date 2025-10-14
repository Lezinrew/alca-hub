# Sistema de Logging Simples - Alça Hub
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path


class SimpleLogger:
    """Logger simples para produção."""
    
    def __init__(self, name: str):
        self.name = name
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
    
    def _write_log(self, level: str, message: str, **kwargs):
        """Escrever log no arquivo."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level.upper(),
            "logger": self.name,
            "message": message,
            **kwargs
        }
        
        log_line = json.dumps(log_data, ensure_ascii=False)
        
        # Escrever no arquivo
        log_file = self.log_dir / f"{level.lower()}.log"
        with open(log_file, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
        
        # Também imprimir no console
        print(f"[{level.upper()}] {self.name}: {message}")
    
    def info(self, message: str, **kwargs):
        """Log de informação."""
        self._write_log("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        """Log de aviso."""
        self._write_log("WARNING", message, **kwargs)
    
    def error(self, message: str, **kwargs):
        """Log de erro."""
        self._write_log("ERROR", message, **kwargs)
    
    def debug(self, message: str, **kwargs):
        """Log de debug."""
        self._write_log("DEBUG", message, **kwargs)
    
    def log_request(self, method: str, url: str, status_code: int, 
                   response_time: float, user_id: Optional[str] = None):
        """Log de requisições HTTP."""
        self.info(f"{method} {url} - {status_code}", 
                 type="http_request",
                 method=method,
                 url=url,
                 status_code=status_code,
                 response_time_ms=response_time * 1000,
                 user_id=user_id)
    
    def log_security_event(self, event_type: str, user_id: str, 
                          ip_address: str, details: Dict[str, Any]):
        """Log de eventos de segurança."""
        self.warning(f"Security event: {event_type}",
                    type="security_event",
                    event_type=event_type,
                    user_id=user_id,
                    ip_address=ip_address,
                    details=details)
    
    def log_business_event(self, event_type: str, user_id: str, 
                          data: Dict[str, Any]):
        """Log de eventos de negócio."""
        self.info(f"Business event: {event_type}",
                 type="business_event",
                 event_type=event_type,
                 user_id=user_id,
                 data=data)
    
    def log_performance(self, operation: str, duration: float, 
                       metadata: Dict[str, Any]):
        """Log de performance."""
        self.info(f"Performance: {operation}",
                 type="performance",
                 operation=operation,
                 duration_ms=duration * 1000,
                 metadata=metadata)


class AuditLogger:
    """Logger de auditoria para eventos críticos."""
    
    def __init__(self):
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
    
    def _write_audit_log(self, data: Dict[str, Any]):
        """Escrever log de auditoria."""
        log_line = json.dumps(data, ensure_ascii=False)
        
        audit_file = self.log_dir / "audit.log"
        with open(audit_file, "a", encoding="utf-8") as f:
            f.write(log_line + "\n")
        
        print(f"[AUDIT] {data.get('action', 'Unknown')} - {data.get('user_id', 'System')}")
    
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
        
        self._write_audit_log(audit_data)
    
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
        
        self._write_audit_log(audit_data)


# Instâncias globais
app_logger = SimpleLogger("alca_hub")
audit_logger = AuditLogger()


def get_logger(name: str) -> SimpleLogger:
    """Obter logger para um módulo específico."""
    return SimpleLogger(name)


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
