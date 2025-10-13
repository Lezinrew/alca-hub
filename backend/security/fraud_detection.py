# Sistema de Detecção de Fraude - Alça Hub
import asyncio
import hashlib
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RiskLevel(Enum):
    """Níveis de risco."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class FraudAlert:
    """Alerta de fraude."""
    alert_id: str
    user_id: str
    risk_level: RiskLevel
    score: float
    reasons: List[str]
    timestamp: datetime
    action_required: bool = False


@dataclass
class UserBehavior:
    """Comportamento do usuário."""
    user_id: str
    login_patterns: Dict[str, Any]
    transaction_patterns: Dict[str, Any]
    device_fingerprints: List[str]
    location_history: List[Dict[str, Any]]
    risk_score: float = 0.0


class FraudDetectionEngine:
    """Motor de detecção de fraude."""
    
    def __init__(self):
        self.user_behaviors: Dict[str, UserBehavior] = {}
        self.suspicious_patterns = {
            'rapid_transactions': 0.8,
            'unusual_location': 0.7,
            'device_mismatch': 0.6,
            'time_anomaly': 0.5,
            'amount_anomaly': 0.9
        }
        self.risk_thresholds = {
            RiskLevel.LOW: 0.3,
            RiskLevel.MEDIUM: 0.6,
            RiskLevel.HIGH: 0.8,
            RiskLevel.CRITICAL: 0.95
        }
    
    async def analyze_transaction(
        self, 
        user_id: str, 
        transaction_data: Dict[str, Any]
    ) -> Tuple[RiskLevel, float, List[str]]:
        """Analisar transação para fraude."""
        reasons = []
        risk_score = 0.0
        
        # Verificar padrões suspeitos
        if await self._check_rapid_transactions(user_id, transaction_data):
            risk_score += self.suspicious_patterns['rapid_transactions']
            reasons.append("Múltiplas transações em curto período")
        
        if await self._check_unusual_location(user_id, transaction_data):
            risk_score += self.suspicious_patterns['unusual_location']
            reasons.append("Localização incomum para o usuário")
        
        if await self._check_device_mismatch(user_id, transaction_data):
            risk_score += self.suspicious_patterns['device_mismatch']
            reasons.append("Dispositivo diferente do padrão")
        
        if await self._check_time_anomaly(user_id, transaction_data):
            risk_score += self.suspicious_patterns['time_anomaly']
            reasons.append("Horário incomum para transações")
        
        if await self._check_amount_anomaly(user_id, transaction_data):
            risk_score += self.suspicious_patterns['amount_anomaly']
            reasons.append("Valor incomum para o usuário")
        
        # Determinar nível de risco
        risk_level = self._determine_risk_level(risk_score)
        
        # Atualizar comportamento do usuário
        await self._update_user_behavior(user_id, transaction_data)
        
        return risk_level, risk_score, reasons
    
    async def _check_rapid_transactions(self, user_id: str, transaction_data: Dict[str, Any]) -> bool:
        """Verificar transações rápidas."""
        if user_id not in self.user_behaviors:
            return False
        
        behavior = self.user_behaviors[user_id]
        current_time = datetime.utcnow()
        
        # Verificar se há muitas transações nos últimos 10 minutos
        recent_transactions = [
            t for t in behavior.transaction_patterns.get('recent_transactions', [])
            if (current_time - t['timestamp']).total_seconds() < 600
        ]
        
        return len(recent_transactions) >= 5
    
    async def _check_unusual_location(self, user_id: str, transaction_data: Dict[str, Any]) -> bool:
        """Verificar localização incomum."""
        if user_id not in self.user_behaviors:
            return False
        
        behavior = self.user_behaviors[user_id]
        current_location = transaction_data.get('location')
        
        if not current_location or not behavior.location_history:
            return False
        
        # Verificar se a localização está muito longe do histórico
        for location in behavior.location_history[-5:]:  # Últimas 5 localizações
            distance = self._calculate_distance(
                current_location, 
                location
            )
            if distance > 100:  # Mais de 100km
                return True
        
        return False
    
    async def _check_device_mismatch(self, user_id: str, transaction_data: Dict[str, Any]) -> bool:
        """Verificar dispositivo diferente."""
        if user_id not in self.user_behaviors:
            return False
        
        behavior = self.user_behaviors[user_id]
        current_device = transaction_data.get('device_fingerprint')
        
        if not current_device:
            return False
        
        return current_device not in behavior.device_fingerprints
    
    async def _check_time_anomaly(self, user_id: str, transaction_data: Dict[str, Any]) -> bool:
        """Verificar anomalia de tempo."""
        if user_id not in self.user_behaviors:
            return False
        
        behavior = self.user_behaviors[user_id]
        current_hour = datetime.utcnow().hour
        
        # Verificar se está fora do horário normal do usuário
        normal_hours = behavior.transaction_patterns.get('normal_hours', [9, 10, 11, 12, 13, 14, 15, 16, 17, 18])
        
        return current_hour not in normal_hours
    
    async def _check_amount_anomaly(self, user_id: str, transaction_data: Dict[str, Any]) -> bool:
        """Verificar anomalia de valor."""
        if user_id not in self.user_behaviors:
            return False
        
        behavior = self.user_behaviors[user_id]
        current_amount = transaction_data.get('amount', 0)
        
        if not current_amount:
            return False
        
        # Verificar se o valor está muito acima da média
        avg_amount = behavior.transaction_patterns.get('average_amount', 0)
        if avg_amount > 0:
            return current_amount > (avg_amount * 3)  # 3x a média
        
        return False
    
    def _calculate_distance(self, loc1: Dict[str, float], loc2: Dict[str, float]) -> float:
        """Calcular distância entre duas localizações (simplificado)."""
        # Implementação simplificada - em produção usar fórmula de Haversine
        lat_diff = abs(loc1['lat'] - loc2['lat'])
        lng_diff = abs(loc1['lng'] - loc2['lng'])
        return (lat_diff + lng_diff) * 111  # Aproximação em km
    
    def _determine_risk_level(self, risk_score: float) -> RiskLevel:
        """Determinar nível de risco."""
        if risk_score >= self.risk_thresholds[RiskLevel.CRITICAL]:
            return RiskLevel.CRITICAL
        elif risk_score >= self.risk_thresholds[RiskLevel.HIGH]:
            return RiskLevel.HIGH
        elif risk_score >= self.risk_thresholds[RiskLevel.MEDIUM]:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    async def _update_user_behavior(self, user_id: str, transaction_data: Dict[str, Any]):
        """Atualizar comportamento do usuário."""
        if user_id not in self.user_behaviors:
            self.user_behaviors[user_id] = UserBehavior(
                user_id=user_id,
                login_patterns={},
                transaction_patterns={'recent_transactions': []},
                device_fingerprints=[],
                location_history=[]
            )
        
        behavior = self.user_behaviors[user_id]
        
        # Atualizar transações recentes
        behavior.transaction_patterns['recent_transactions'].append({
            'timestamp': datetime.utcnow(),
            'amount': transaction_data.get('amount', 0),
            'location': transaction_data.get('location')
        })
        
        # Manter apenas últimas 20 transações
        behavior.transaction_patterns['recent_transactions'] = \
            behavior.transaction_patterns['recent_transactions'][-20:]
        
        # Atualizar localização
        if transaction_data.get('location'):
            behavior.location_history.append(transaction_data['location'])
            behavior.location_history = behavior.location_history[-10:]  # Últimas 10
        
        # Atualizar dispositivo
        device_fingerprint = transaction_data.get('device_fingerprint')
        if device_fingerprint and device_fingerprint not in behavior.device_fingerprints:
            behavior.device_fingerprints.append(device_fingerprint)
            behavior.device_fingerprints = behavior.device_fingerprints[-5:]  # Últimos 5
        
        # Calcular média de valores
        amounts = [t['amount'] for t in behavior.transaction_patterns['recent_transactions']]
        if amounts:
            behavior.transaction_patterns['average_amount'] = sum(amounts) / len(amounts)
    
    async def generate_fraud_alert(
        self, 
        user_id: str, 
    ) -> Optional[FraudAlert]:
        """Gerar alerta de fraude se necessário."""
        if user_id not in self.user_behaviors:
            return None
        
        behavior = self.user_behaviors[user_id]
        
        # Calcular score de risco baseado no comportamento
        risk_score = 0.0
        reasons = []
        
        # Verificar padrões suspeitos no histórico
        if len(behavior.transaction_patterns.get('recent_transactions', [])) > 10:
            risk_score += 0.3
            reasons.append("Alto volume de transações")
        
        if len(behavior.device_fingerprints) > 3:
            risk_score += 0.4
            reasons.append("Múltiplos dispositivos")
        
        if len(behavior.location_history) > 5:
            risk_score += 0.2
            reasons.append("Múltiplas localizações")
        
        risk_level = self._determine_risk_level(risk_score)
        
        if risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]:
            return FraudAlert(
                alert_id=f"fraud_{user_id}_{int(datetime.utcnow().timestamp())}",
                user_id=user_id,
                risk_level=risk_level,
                score=risk_score,
                reasons=reasons,
                timestamp=datetime.utcnow(),
                action_required=True
            )
        
        return None
    
    async def get_user_risk_profile(self, user_id: str) -> Dict[str, Any]:
        """Obter perfil de risco do usuário."""
        if user_id not in self.user_behaviors:
            return {"risk_level": "unknown", "score": 0.0}
        
        behavior = self.user_behaviors[user_id]
        
        return {
            "user_id": user_id,
            "risk_score": behavior.risk_score,
            "transaction_count": len(behavior.transaction_patterns.get('recent_transactions', [])),
            "device_count": len(behavior.device_fingerprints),
            "location_count": len(behavior.location_history),
            "average_amount": behavior.transaction_patterns.get('average_amount', 0),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def generate_device_fingerprint(self, request_data: Dict[str, Any]) -> str:
        """Gerar fingerprint do dispositivo."""
        fingerprint_data = {
            'user_agent': request_data.get('user_agent', ''),
            'ip_address': request_data.get('ip_address', ''),
            'accept_language': request_data.get('accept_language', ''),
            'screen_resolution': request_data.get('screen_resolution', ''),
            'timezone': request_data.get('timezone', '')
        }
        
        # Criar hash único do dispositivo
        fingerprint_string = '|'.join(str(v) for v in fingerprint_data.values())
        return hashlib.md5(fingerprint_string.encode()).hexdigest()
