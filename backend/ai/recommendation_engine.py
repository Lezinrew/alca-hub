# Sistema de Recomendações com IA - Alça Hub
import asyncio
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from collections import defaultdict
import logging
import json

logger = logging.getLogger(__name__)


@dataclass
class UserProfile:
    """Perfil do usuário para recomendações."""
    user_id: str
    preferences: Dict[str, float]  # Categoria -> peso
    behavior_patterns: Dict[str, Any]
    location: Optional[Dict[str, float]] = None  # lat, lng
    demographics: Optional[Dict[str, Any]] = None


@dataclass
class ServiceProfile:
    """Perfil do serviço para recomendações."""
    service_id: str
    category: str
    features: Dict[str, float]  # Características do serviço
    location: Optional[Dict[str, float]] = None
    rating: float = 0.0
    popularity: float = 0.0


@dataclass
class Recommendation:
    """Recomendação gerada."""
    service_id: str
    score: float
    reason: str
    confidence: float


class RecommendationEngine:
    """Motor de recomendações baseado em IA."""
    
    def __init__(self):
        self.user_profiles: Dict[str, UserProfile] = {}
        self.service_profiles: Dict[str, ServiceProfile] = {}
        self.interaction_matrix: Dict[Tuple[str, str], float] = {}
        self.model_weights = {
            'collaborative': 0.4,
            'content_based': 0.3,
            'location': 0.2,
            'popularity': 0.1
        }
    
    async def build_user_profile(self, user_id: str, interactions: List[Dict[str, Any]]) -> UserProfile:
        """Construir perfil do usuário baseado em interações."""
        preferences = defaultdict(float)
        behavior_patterns = {
            'booking_frequency': 0,
            'preferred_categories': [],
            'time_patterns': {},
            'price_sensitivity': 0.5
        }
        
        # Analisar interações
        for interaction in interactions:
            category = interaction.get('category', 'unknown')
            preferences[category] += 1
            
            # Padrões de comportamento
            if interaction.get('type') == 'booking':
                behavior_patterns['booking_frequency'] += 1
            
            # Análise de preço
            if 'price' in interaction:
                behavior_patterns['price_sensitivity'] = min(
                    behavior_patterns['price_sensitivity'],
                    interaction['price'] / 100  # Normalizar
                )
        
        # Normalizar preferências
        total_interactions = sum(preferences.values())
        if total_interactions > 0:
            for category in preferences:
                preferences[category] /= total_interactions
        
        # Identificar categorias preferidas
        behavior_patterns['preferred_categories'] = sorted(
            preferences.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        profile = UserProfile(
            user_id=user_id,
            preferences=dict(preferences),
            behavior_patterns=behavior_patterns
        )
        
        self.user_profiles[user_id] = profile
        return profile
    
    async def build_service_profile(self, service_id: str, service_data: Dict[str, Any]) -> ServiceProfile:
        """Construir perfil do serviço."""
        features = {
            'rating': service_data.get('rating', 0.0),
            'price_range': service_data.get('price_range', 'medium'),
            'availability': service_data.get('availability', 0.8),
            'experience_years': service_data.get('experience_years', 0),
            'certifications': len(service_data.get('certifications', [])),
            'response_time': service_data.get('response_time', 24)  # horas
        }
        
        # Normalizar features
        features['price_range'] = {
            'low': 0.2, 'medium': 0.5, 'high': 0.8
        }.get(features['price_range'], 0.5)
        
        features['response_time'] = max(0, 1 - (features['response_time'] / 168))  # Normalizar para semana
        
        profile = ServiceProfile(
            service_id=service_id,
            category=service_data.get('category', 'unknown'),
            features=features,
            rating=service_data.get('rating', 0.0),
            popularity=service_data.get('popularity', 0.0)
        )
        
        self.service_profiles[service_id] = profile
        return profile
    
    def calculate_collaborative_score(self, user_id: str, service_id: str) -> float:
        """Calcular score baseado em filtragem colaborativa."""
        if user_id not in self.user_profiles:
            return 0.0
        
        user_profile = self.user_profiles[user_id]
        
        # Encontrar usuários similares
        similar_users = self._find_similar_users(user_id)
        
        if not similar_users:
            return 0.0
        
        # Calcular score baseado em usuários similares
        total_score = 0.0
        total_weight = 0.0
        
        for similar_user_id, similarity in similar_users:
            if (similar_user_id, service_id) in self.interaction_matrix:
                rating = self.interaction_matrix[(similar_user_id, service_id)]
                total_score += rating * similarity
                total_weight += similarity
        
        return total_score / max(total_weight, 1.0)
    
    def calculate_content_based_score(self, user_id: str, service_id: str) -> float:
        """Calcular score baseado em conteúdo."""
        if user_id not in self.user_profiles or service_id not in self.service_profiles:
            return 0.0
        
        user_profile = self.user_profiles[user_id]
        service_profile = self.service_profiles[service_id]
        
        # Score baseado em categoria
        category_score = user_profile.preferences.get(service_profile.category, 0.0)
        
        # Score baseado em features
        feature_score = 0.0
        for feature, value in service_profile.features.items():
            # Peso baseado na importância da feature para o usuário
            weight = self._get_feature_weight(user_profile, feature)
            feature_score += value * weight
        
        feature_score /= len(service_profile.features)
        
        return (category_score * 0.7) + (feature_score * 0.3)
    
    def calculate_location_score(self, user_id: str, service_id: str) -> float:
        """Calcular score baseado em localização."""
        if user_id not in self.user_profiles or service_id not in self.service_profiles:
            return 0.0
        
        user_location = self.user_profiles[user_id].location
        service_location = self.service_profiles[service_id].location
        
        if not user_location or not service_location:
            return 0.5  # Score neutro se não há localização
        
        # Calcular distância (simplificado)
        distance = np.sqrt(
            (user_location['lat'] - service_location['lat'])**2 +
            (user_location['lng'] - service_location['lng'])**2
        )
        
        # Score inversamente proporcional à distância
        max_distance = 0.1  # Ajustar conforme necessário
        return max(0, 1 - (distance / max_distance))
    
    def calculate_popularity_score(self, service_id: str) -> float:
        """Calcular score baseado em popularidade."""
        if service_id not in self.service_profiles:
            return 0.0
        
        service_profile = self.service_profiles[service_id]
        return (service_profile.rating * 0.6) + (service_profile.popularity * 0.4)
    
    def _find_similar_users(self, user_id: str, limit: int = 10) -> List[Tuple[str, float]]:
        """Encontrar usuários similares."""
        if user_id not in self.user_profiles:
            return []
        
        target_profile = self.user_profiles[user_id]
        similarities = []
        
        for other_user_id, other_profile in self.user_profiles.items():
            if other_user_id == user_id:
                continue
            
            similarity = self._calculate_user_similarity(target_profile, other_profile)
            if similarity > 0.1:  # Threshold mínimo
                similarities.append((other_user_id, similarity))
        
        # Ordenar por similaridade
        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:limit]
    
    def _calculate_user_similarity(self, profile1: UserProfile, profile2: UserProfile) -> float:
        """Calcular similaridade entre usuários."""
        # Similaridade baseada em preferências
        common_categories = set(profile1.preferences.keys()) & set(profile2.preferences.keys())
        
        if not common_categories:
            return 0.0
        
        similarity = 0.0
        for category in common_categories:
            similarity += min(profile1.preferences[category], profile2.preferences[category])
        
        return similarity / len(common_categories)
    
    def _get_feature_weight(self, user_profile: UserProfile, feature: str) -> float:
        """Obter peso da feature para o usuário."""
        # Pesos baseados no comportamento do usuário
        weights = {
            'rating': 0.3,
            'price_range': 0.2,
            'availability': 0.2,
            'experience_years': 0.1,
            'certifications': 0.1,
            'response_time': 0.1
        }
        
        # Ajustar baseado na sensibilidade a preço
        if feature == 'price_range':
            weights[feature] *= (1 - user_profile.behavior_patterns.get('price_sensitivity', 0.5))
        
        return weights.get(feature, 0.1)
    
    async def generate_recommendations(
        self, 
        user_id: str, 
        limit: int = 10,
        exclude_services: List[str] = None
    ) -> List[Recommendation]:
        """Gerar recomendações para um usuário."""
        if user_id not in self.user_profiles:
            await self.build_user_profile(user_id, [])
        
        exclude_services = exclude_services or []
        recommendations = []
        
        for service_id, service_profile in self.service_profiles.items():
            if service_id in exclude_services:
                continue
            
            # Calcular scores
            collaborative_score = self.calculate_collaborative_score(user_id, service_id)
            content_score = self.calculate_content_based_score(user_id, service_id)
            location_score = self.calculate_location_score(user_id, service_id)
            popularity_score = self.calculate_popularity_score(service_id)
            
            # Score final ponderado
            final_score = (
                collaborative_score * self.model_weights['collaborative'] +
                content_score * self.model_weights['content_based'] +
                location_score * self.model_weights['location'] +
                popularity_score * self.model_weights['popularity']
            )
            
            if final_score > 0.1:  # Threshold mínimo
                # Gerar razão da recomendação
                reason = self._generate_recommendation_reason(
                    collaborative_score, content_score, location_score, popularity_score
                )
                
                # Calcular confiança
                confidence = min(1.0, final_score * 1.5)
                
                recommendations.append(Recommendation(
                    service_id=service_id,
                    score=final_score,
                    reason=reason,
                    confidence=confidence
                ))
        
        # Ordenar por score
        recommendations.sort(key=lambda x: x.score, reverse=True)
        return recommendations[:limit]
    
    def _generate_recommendation_reason(
        self, 
        collaborative: float, 
        content: float, 
        location: float, 
        popularity: float
    ) -> str:
        """Gerar explicação da recomendação."""
        reasons = []
        
        if collaborative > 0.3:
            reasons.append("usuários similares gostaram")
        
        if content > 0.3:
            reasons.append("combina com suas preferências")
        
        if location > 0.7:
            reasons.append("próximo à sua localização")
        
        if popularity > 0.7:
            reasons.append("muito bem avaliado")
        
        if not reasons:
            return "recomendação baseada em padrões gerais"
        
        return f"recomendado porque {', '.join(reasons)}"
    
    async def update_interaction(self, user_id: str, service_id: str, rating: float):
        """Atualizar interação do usuário."""
        self.interaction_matrix[(user_id, service_id)] = rating
        
        # Reconstruir perfil do usuário se necessário
        if user_id in self.user_profiles:
            # Simular atualização do perfil
            pass
    
    def get_recommendation_insights(self, user_id: str) -> Dict[str, Any]:
        """Obter insights sobre as recomendações."""
        if user_id not in self.user_profiles:
            return {}
        
        profile = self.user_profiles[user_id]
        
        return {
            "user_preferences": profile.preferences,
            "behavior_patterns": profile.behavior_patterns,
            "recommendation_confidence": "high" if len(profile.preferences) > 5 else "medium",
            "suggested_categories": [
                cat for cat, score in sorted(
                    profile.preferences.items(),
                    key=lambda x: x[1],
                    reverse=True
                )[:3]
            ]
        }
