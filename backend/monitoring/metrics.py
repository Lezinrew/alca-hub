# Sistema de Métricas - Alça Hub
import time
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from collections import defaultdict, deque
import logging

logger = logging.getLogger(__name__)


@dataclass
class MetricPoint:
    """Ponto de métrica individual."""
    timestamp: datetime
    value: float
    tags: Dict[str, str] = field(default_factory=dict)


@dataclass
class MetricSeries:
    """Série de métricas."""
    name: str
    points: deque = field(default_factory=lambda: deque(maxlen=1000))
    tags: Dict[str, str] = field(default_factory=dict)


class MetricsCollector:
    """Coletor de métricas em tempo real."""
    
    def __init__(self):
        self.metrics: Dict[str, MetricSeries] = {}
        self.counters: Dict[str, int] = defaultdict(int)
        self.gauges: Dict[str, float] = {}
        self.histograms: Dict[str, List[float]] = defaultdict(list)
        self.start_time = datetime.utcnow()
    
    def increment_counter(self, name: str, value: int = 1, tags: Dict[str, str] = None):
        """Incrementar contador."""
        self.counters[name] += value
        self._record_metric(name, self.counters[name], tags or {})
    
    def set_gauge(self, name: str, value: float, tags: Dict[str, str] = None):
        """Definir gauge."""
        self.gauges[name] = value
        self._record_metric(name, value, tags or {})
    
    def record_histogram(self, name: str, value: float, tags: Dict[str, str] = None):
        """Registrar valor em histograma."""
        self.histograms[name].append(value)
        # Manter apenas os últimos 1000 valores
        if len(self.histograms[name]) > 1000:
            self.histograms[name] = self.histograms[name][-1000:]
        self._record_metric(name, value, tags or {})
    
    def record_timing(self, name: str, duration: float, tags: Dict[str, str] = None):
        """Registrar tempo de execução."""
        self.record_histogram(f"{name}_duration", duration, tags)
        self.increment_counter(f"{name}_count", tags=tags)
    
    def _record_metric(self, name: str, value: float, tags: Dict[str, str]):
        """Registrar métrica."""
        if name not in self.metrics:
            self.metrics[name] = MetricSeries(name=name, tags=tags)
        
        point = MetricPoint(
            timestamp=datetime.utcnow(),
            value=value,
            tags=tags
        )
        
        self.metrics[name].points.append(point)
    
    def get_metric_summary(self, name: str, window_minutes: int = 5) -> Dict[str, Any]:
        """Obter resumo de métrica."""
        if name not in self.metrics:
            return {}
        
        cutoff_time = datetime.utcnow() - timedelta(minutes=window_minutes)
        recent_points = [
            p for p in self.metrics[name].points 
            if p.timestamp >= cutoff_time
        ]
        
        if not recent_points:
            return {}
        
        values = [p.value for p in recent_points]
        
        return {
            "name": name,
            "count": len(values),
            "min": min(values),
            "max": max(values),
            "avg": sum(values) / len(values),
            "latest": values[-1] if values else 0,
            "window_minutes": window_minutes
        }
    
    def get_all_metrics(self) -> Dict[str, Any]:
        """Obter todas as métricas."""
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": {
                name: {
                    "count": len(values),
                    "min": min(values) if values else 0,
                    "max": max(values) if values else 0,
                    "avg": sum(values) / len(values) if values else 0
                }
                for name, values in self.histograms.items()
            },
            "uptime_seconds": (datetime.utcnow() - self.start_time).total_seconds()
        }


class PerformanceMonitor:
    """Monitor de performance."""
    
    def __init__(self):
        self.metrics = MetricsCollector()
        self.active_requests = 0
        self.request_times = deque(maxlen=1000)
        self.error_count = 0
    
    def start_request(self):
        """Iniciar monitoramento de requisição."""
        self.active_requests += 1
        self.metrics.set_gauge("active_requests", self.active_requests)
        return time.time()
    
    def end_request(self, start_time: float, status_code: int = 200):
        """Finalizar monitoramento de requisição."""
        self.active_requests -= 1
        duration = time.time() - start_time
        
        self.metrics.set_gauge("active_requests", self.active_requests)
        self.metrics.record_timing("request_duration", duration)
        self.metrics.increment_counter("total_requests")
        
        if status_code >= 400:
            self.error_count += 1
            self.metrics.increment_counter("error_requests")
        
        self.request_times.append(duration)
    
    def record_database_operation(self, operation: str, duration: float, success: bool = True):
        """Registrar operação de banco de dados."""
        self.metrics.record_timing(f"db_{operation}", duration, {"success": str(success)})
        self.metrics.increment_counter(f"db_{operation}_count")
        
        if not success:
            self.metrics.increment_counter(f"db_{operation}_errors")
    
    def record_websocket_operation(self, operation: str, duration: float):
        """Registrar operação WebSocket."""
        self.metrics.record_timing(f"ws_{operation}", duration)
        self.metrics.increment_counter(f"ws_{operation}_count")
    
    def record_notification_sent(self, notification_type: str, success: bool = True):
        """Registrar notificação enviada."""
        self.metrics.increment_counter("notifications_sent", tags={"type": notification_type})
        
        if not success:
            self.metrics.increment_counter("notifications_failed", tags={"type": notification_type})
    
    def record_chat_message(self, message_type: str):
        """Registrar mensagem de chat."""
        self.metrics.increment_counter("chat_messages", tags={"type": message_type})
    
    def record_review_created(self, rating: int):
        """Registrar avaliação criada."""
        self.metrics.increment_counter("reviews_created")
        self.metrics.record_histogram("review_ratings", rating)
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Obter resumo de performance."""
        all_metrics = self.metrics.get_all_metrics()
        
        # Calcular estatísticas de tempo de resposta
        if self.request_times:
            response_times = list(self.request_times)
            response_times.sort()
            
            p50 = response_times[int(len(response_times) * 0.5)]
            p95 = response_times[int(len(response_times) * 0.95)]
            p99 = response_times[int(len(response_times) * 0.99)]
        else:
            p50 = p95 = p99 = 0
        
        return {
            **all_metrics,
            "performance": {
                "active_requests": self.active_requests,
                "total_requests": all_metrics["counters"].get("total_requests", 0),
                "error_rate": (
                    all_metrics["counters"].get("error_requests", 0) / 
                    max(all_metrics["counters"].get("total_requests", 1), 1)
                ) * 100,
                "response_time_p50": p50,
                "response_time_p95": p95,
                "response_time_p99": p99,
                "uptime_seconds": all_metrics["uptime_seconds"]
            }
        }


class HealthChecker:
    """Verificador de saúde do sistema."""
    
    def __init__(self, metrics: MetricsCollector):
        self.metrics = metrics
        self.checks = {}
    
    def register_check(self, name: str, check_func):
        """Registrar verificação de saúde."""
        self.checks[name] = check_func
    
    async def run_health_checks(self) -> Dict[str, Any]:
        """Executar verificações de saúde."""
        results = {}
        
        for name, check_func in self.checks.items():
            try:
                start_time = time.time()
                result = await check_func() if asyncio.iscoroutinefunction(check_func) else check_func()
                duration = time.time() - start_time
                
                results[name] = {
                    "status": "healthy" if result else "unhealthy",
                    "duration": duration,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.metrics.record_timing(f"health_check_{name}", duration)
                
            except Exception as e:
                results[name] = {
                    "status": "error",
                    "error": str(e),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                self.metrics.increment_counter(f"health_check_{name}_errors")
        
        return results


# Instâncias globais
performance_monitor = PerformanceMonitor()
health_checker = HealthChecker(performance_monitor.metrics)
