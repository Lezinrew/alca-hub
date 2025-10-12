# Gerenciador de Cache - Alça Hub
import asyncio
import json
import hashlib
from typing import Any, Optional, Dict, List, Callable
from datetime import datetime, timedelta
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class CacheEntry:
    """Entrada de cache."""
    key: str
    value: Any
    created_at: datetime
    expires_at: Optional[datetime]
    access_count: int = 0
    last_accessed: datetime = None


class CacheManager:
    """Gerenciador de cache inteligente."""
    
    def __init__(self, max_size: int = 1000, default_ttl: int = 300):
        self.cache: Dict[str, CacheEntry] = {}
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cleanup_task = None
        self._start_cleanup_task()
    
    def _start_cleanup_task(self):
        """Iniciar tarefa de limpeza."""
        if not self.cleanup_task:
            try:
                loop = asyncio.get_running_loop()
                self.cleanup_task = loop.create_task(self._cleanup_expired())
            except RuntimeError:
                # Não há loop rodando, pular inicialização
                pass
    
    async def _cleanup_expired(self):
        """Limpar entradas expiradas."""
        while True:
            try:
                await asyncio.sleep(60)  # Limpar a cada minuto
                current_time = datetime.utcnow()
                expired_keys = []
                
                for key, entry in self.cache.items():
                    if entry.expires_at and entry.expires_at <= current_time:
                        expired_keys.append(key)
                
                for key in expired_keys:
                    del self.cache[key]
                
                if expired_keys:
                    logger.info(f"Removidas {len(expired_keys)} entradas expiradas do cache")
                
            except Exception as e:
                logger.error(f"Erro na limpeza do cache: {e}")
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Gerar chave de cache."""
        key_data = f"{prefix}:{':'.join(map(str, args))}"
        if kwargs:
            sorted_kwargs = sorted(kwargs.items())
            key_data += f":{':'.join(f'{k}={v}' for k, v in sorted_kwargs)}"
        
        return f"{prefix}:{hashlib.md5(key_data.encode()).hexdigest()}"
    
    async def get(self, key: str) -> Optional[Any]:
        """Obter valor do cache."""
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        
        # Verificar se expirou
        if entry.expires_at and entry.expires_at <= datetime.utcnow():
            del self.cache[key]
            return None
        
        # Atualizar estatísticas de acesso
        entry.access_count += 1
        entry.last_accessed = datetime.utcnow()
        
        return entry.value
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Definir valor no cache."""
        ttl = ttl or self.default_ttl
        expires_at = datetime.utcnow() + timedelta(seconds=ttl)
        
        # Verificar limite de tamanho
        if len(self.cache) >= self.max_size and key not in self.cache:
            await self._evict_lru()
        
        self.cache[key] = CacheEntry(
            key=key,
            value=value,
            created_at=datetime.utcnow(),
            expires_at=expires_at,
            last_accessed=datetime.utcnow()
        )
    
    async def _evict_lru(self):
        """Remover entrada menos recentemente usada."""
        if not self.cache:
            return
        
        # Encontrar entrada com menor last_accessed
        lru_key = min(
            self.cache.keys(),
            key=lambda k: self.cache[k].last_accessed or self.cache[k].created_at
        )
        
        del self.cache[lru_key]
    
    async def delete(self, key: str) -> bool:
        """Deletar entrada do cache."""
        if key in self.cache:
            del self.cache[key]
            return True
        return False
    
    async def clear(self) -> None:
        """Limpar todo o cache."""
        self.cache.clear()
    
    async def get_or_set(self, key: str, factory: Callable, ttl: Optional[int] = None) -> Any:
        """Obter valor ou definir usando factory."""
        value = await self.get(key)
        if value is not None:
            return value
        
        # Executar factory
        if asyncio.iscoroutinefunction(factory):
            value = await factory()
        else:
            value = factory()
        
        await self.set(key, value, ttl)
        return value
    
    async def get_or_set_with_args(self, prefix: str, factory: Callable, *args, ttl: Optional[int] = None, **kwargs) -> Any:
        """Obter ou definir com argumentos."""
        key = self._generate_key(prefix, *args, **kwargs)
        return await self.get_or_set(key, factory, ttl)
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidar entradas que correspondem ao padrão."""
        keys_to_delete = [key for key in self.cache.keys() if pattern in key]
        
        for key in keys_to_delete:
            del self.cache[key]
        
        return len(keys_to_delete)
    
    def get_stats(self) -> Dict[str, Any]:
        """Obter estatísticas do cache."""
        if not self.cache:
            return {
                "size": 0,
                "max_size": self.max_size,
                "hit_rate": 0,
                "total_entries": 0
            }
        
        total_accesses = sum(entry.access_count for entry in self.cache.values())
        total_entries = len(self.cache)
        
        return {
            "size": total_entries,
            "max_size": self.max_size,
            "hit_rate": total_accesses / max(total_entries, 1),
            "total_entries": total_entries,
            "oldest_entry": min(entry.created_at for entry in self.cache.values()).isoformat(),
            "newest_entry": max(entry.created_at for entry in self.cache.values()).isoformat()
        }


class CacheDecorator:
    """Decorator para cache automático."""
    
    def __init__(self, cache_manager: CacheManager, ttl: int = 300, key_prefix: str = "func"):
        self.cache_manager = cache_manager
        self.ttl = ttl
        self.key_prefix = key_prefix
    
    def __call__(self, func):
        async def wrapper(*args, **kwargs):
            # Gerar chave de cache
            key = self.cache_manager._generate_key(
                f"{self.key_prefix}:{func.__name__}",
                *args,
                **kwargs
            )
            
            # Tentar obter do cache
            cached_result = await self.cache_manager.get(key)
            if cached_result is not None:
                return cached_result
            
            # Executar função
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            # Armazenar no cache
            await self.cache_manager.set(key, result, self.ttl)
            return result
        
        return wrapper


# Instância global
cache_manager = CacheManager()
cache = CacheDecorator(cache_manager)
