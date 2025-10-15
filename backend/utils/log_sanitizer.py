"""
Utilitário para sanitização de logs - remove informações sensíveis
"""
import re
import json
from typing import Any, Dict, Union


class LogSanitizer:
    """Classe para sanitizar logs removendo informações sensíveis"""
    
    # Padrões de dados sensíveis
    SENSITIVE_PATTERNS = {
        'cpf': r'\d{3}\.\d{3}\.\d{3}-\d{2}',
        'cnpj': r'\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}',
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phone': r'\(\d{2}\)\s?\d{4,5}-?\d{4}',
        'jwt_token': r'Bearer\s+[\w-]+\.[\w-]+\.[\w-]+',
        'credit_card': r'\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}',
        'password': r'["\']?password["\']?\s*[:=]\s*["\'][^"\']+["\']',
        'secret': r'["\']?secret["\']?\s*[:=]\s*["\'][^"\']+["\']',
        'token': r'["\']?token["\']?\s*[:=]\s*["\'][^"\']+["\']',
    }
    
    @classmethod
    def sanitize_string(cls, text: str) -> str:
        """
        Sanitiza uma string removendo informações sensíveis
        
        Args:
            text: String a ser sanitizada
            
        Returns:
            String sanitizada
        """
        if not isinstance(text, str):
            return text
            
        sanitized = text
        
        # Aplicar padrões de sanitização
        for pattern_name, pattern in cls.SENSITIVE_PATTERNS.items():
            sanitized = re.sub(pattern, f'[{pattern_name.upper()}]', sanitized, flags=re.IGNORECASE)
        
        return sanitized
    
    @classmethod
    def sanitize_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sanitiza um dicionário recursivamente
        
        Args:
            data: Dicionário a ser sanitizado
            
        Returns:
            Dicionário sanitizado
        """
        if not isinstance(data, dict):
            return data
            
        sanitized = {}
        
        for key, value in data.items():
            # Sanitizar chaves sensíveis
            if any(sensitive in key.lower() for sensitive in ['password', 'secret', 'token', 'key']):
                sanitized[key] = '[REDACTED]'
            elif isinstance(value, str):
                sanitized[key] = cls.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_dict(value)
            elif isinstance(value, list):
                sanitized[key] = [cls.sanitize_dict(item) if isinstance(item, dict) 
                                else cls.sanitize_string(item) if isinstance(item, str)
                                else item for item in value]
            else:
                sanitized[key] = value
                
        return sanitized
    
    @classmethod
    def sanitize_json(cls, json_str: str) -> str:
        """
        Sanitiza uma string JSON
        
        Args:
            json_str: String JSON a ser sanitizada
            
        Returns:
            String JSON sanitizada
        """
        try:
            data = json.loads(json_str)
            sanitized_data = cls.sanitize_dict(data)
            return json.dumps(sanitized_data, ensure_ascii=False)
        except (json.JSONDecodeError, TypeError):
            # Se não for JSON válido, sanitizar como string
            return cls.sanitize_string(json_str)


def sanitize_log_message(message: Union[str, Dict[str, Any]]) -> Union[str, Dict[str, Any]]:
    """
    Função utilitária para sanitizar mensagens de log
    
    Args:
        message: Mensagem a ser sanitizada (string ou dict)
        
    Returns:
        Mensagem sanitizada
    """
    if isinstance(message, str):
        return LogSanitizer.sanitize_string(message)
    elif isinstance(message, dict):
        return LogSanitizer.sanitize_dict(message)
    else:
        return message


# Exemplo de uso:
if __name__ == "__main__":
    # Teste de sanitização
    test_data = {
        "user_id": "123",
        "email": "usuario@exemplo.com",
        "cpf": "123.456.789-00",
        "password": "senha123",
        "jwt_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "phone": "(11) 99999-9999"
    }
    
    print("Dados originais:")
    print(json.dumps(test_data, indent=2, ensure_ascii=False))
    
    print("\nDados sanitizados:")
    sanitized = LogSanitizer.sanitize_dict(test_data)
    print(json.dumps(sanitized, indent=2, ensure_ascii=False))
