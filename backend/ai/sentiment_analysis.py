# Análise de Sentimentos - Alça Hub
import re
import asyncio
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


@dataclass
class SentimentResult:
    """Resultado da análise de sentimentos."""
    text: str
    sentiment: str  # 'positive', 'negative', 'neutral'
    confidence: float
    emotions: Dict[str, float]
    keywords: List[str]
    timestamp: datetime


class SentimentAnalyzer:
    """Analisador de sentimentos baseado em regras."""
    
    def __init__(self):
        # Dicionários de palavras para análise
        self.positive_words = {
            'excelente', 'ótimo', 'bom', 'perfeito', 'maravilhoso', 'fantástico',
            'incrível', 'satisfeito', 'feliz', 'recomendo', 'profissional',
            'atendimento', 'qualidade', 'rápido', 'eficiente', 'cuidadoso',
            'educado', 'prestativo', 'competente', 'confiável', 'pontual'
        }
        
        self.negative_words = {
            'ruim', 'péssimo', 'terrível', 'horrível', 'decepcionante',
            'lento', 'atrasado', 'desorganizado', 'mal', 'problema',
            'erro', 'falha', 'insatisfeito', 'frustrado', 'irritado',
            'não recomendo', 'evitar', 'cuidado', 'desleixado', 'incompetente'
        }
        
        self.intensifiers = {
            'muito': 2.0, 'extremamente': 3.0, 'super': 2.5, 'totalmente': 2.0,
            'completamente': 2.0, 'absolutamente': 2.5, 'realmente': 1.5,
            'demais': 2.0, 'demais': 2.0, 'bastante': 1.5
        }
        
        self.negation_words = {
            'não', 'nem', 'nunca', 'jamais', 'nada', 'ninguém'
        }
        
        # Emoções básicas
        self.emotion_words = {
            'alegria': {'feliz', 'alegre', 'contente', 'satisfeito', 'animado'},
            'tristeza': {'triste', 'decepcionado', 'chateado', 'frustrado'},
            'raiva': {'irritado', 'bravo', 'furioso', 'revoltado', 'indignado'},
            'medo': {'preocupado', 'ansioso', 'nervoso', 'inseguro'},
            'surpresa': {'surpreso', 'impressionado', 'admirado', 'chocado'},
            'nojo': {'enojado', 'repugnado', 'envergonhado', 'constrangido'}
        }
    
    async def analyze_text(self, text: str) -> SentimentResult:
        """Analisar sentimento de um texto."""
        if not text or not text.strip():
            return SentimentResult(
                text=text,
                sentiment='neutral',
                confidence=0.0,
                emotions={},
                keywords=[],
                timestamp=datetime.utcnow()
            )
        
        # Limpar e normalizar texto
        cleaned_text = self._clean_text(text)
        
        # Calcular scores
        positive_score = self._calculate_positive_score(cleaned_text)
        negative_score = self._calculate_negative_score(cleaned_text)
        
        # Determinar sentimento
        sentiment, confidence = self._determine_sentiment(positive_score, negative_score)
        
        # Extrair emoções
        emotions = self._extract_emotions(cleaned_text)
        
        # Extrair palavras-chave
        keywords = self._extract_keywords(cleaned_text)
        
        return SentimentResult(
            text=text,
            sentiment=sentiment,
            confidence=confidence,
            emotions=emotions,
            keywords=keywords,
            timestamp=datetime.utcnow()
        )
    
    def _clean_text(self, text: str) -> str:
        """Limpar e normalizar texto."""
        # Converter para minúsculas
        text = text.lower()
        
        # Remover caracteres especiais, mas manter acentos
        text = re.sub(r'[^\w\sáàâãéèêíìîóòôõúùûç]', ' ', text)
        
        # Remover espaços extras
        text = re.sub(r'\s+', ' ', text)
        
        return text.strip()
    
    def _calculate_positive_score(self, text: str) -> float:
        """Calcular score positivo."""
        words = text.split()
        score = 0.0
        
        for i, word in enumerate(words):
            word_score = 0.0
            
            # Verificar se é palavra positiva
            if word in self.positive_words:
                word_score = 1.0
            elif word in self.negative_words:
                word_score = -1.0
            
            # Verificar intensificadores
            if i > 0 and words[i-1] in self.intensifiers:
                intensity = self.intensifiers[words[i-1]]
                word_score *= intensity
            
            # Verificar negação
            if i > 0 and words[i-1] in self.negation_words:
                word_score *= -1.0
            
            score += word_score
        
        return max(0, score)
    
    def _calculate_negative_score(self, text: str) -> float:
        """Calcular score negativo."""
        words = text.split()
        score = 0.0
        
        for i, word in enumerate(words):
            word_score = 0.0
            
            # Verificar se é palavra negativa
            if word in self.negative_words:
                word_score = 1.0
            elif word in self.positive_words:
                word_score = -1.0
            
            # Verificar intensificadores
            if i > 0 and words[i-1] in self.intensifiers:
                intensity = self.intensifiers[words[i-1]]
                word_score *= intensity
            
            # Verificar negação
            if i > 0 and words[i-1] in self.negation_words:
                word_score *= -1.0
            
            score += word_score
        
        return max(0, score)
    
    def _determine_sentiment(self, positive_score: float, negative_score: float) -> Tuple[str, float]:
        """Determinar sentimento e confiança."""
        total_score = positive_score + negative_score
        
        if total_score == 0:
            return 'neutral', 0.0
        
        if positive_score > negative_score:
            sentiment = 'positive'
            confidence = min(1.0, positive_score / (positive_score + negative_score))
        elif negative_score > positive_score:
            sentiment = 'negative'
            confidence = min(1.0, negative_score / (positive_score + negative_score))
        else:
            sentiment = 'neutral'
            confidence = 0.5
        
        return sentiment, confidence
    
    def _extract_emotions(self, text: str) -> Dict[str, float]:
        """Extrair emoções do texto."""
        words = text.split()
        emotions = {emotion: 0.0 for emotion in self.emotion_words.keys()}
        
        for word in words:
            for emotion, emotion_words in self.emotion_words.items():
                if word in emotion_words:
                    emotions[emotion] += 1.0
        
        # Normalizar
        total_emotions = sum(emotions.values())
        if total_emotions > 0:
            for emotion in emotions:
                emotions[emotion] /= total_emotions
        
        return emotions
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extrair palavras-chave do texto."""
        words = text.split()
        
        # Filtrar palavras importantes
        keywords = []
        for word in words:
            if (len(word) > 3 and 
                word not in self.positive_words and 
                word not in self.negative_words and
                word not in self.intensifiers and
                word not in self.negation_words):
                keywords.append(word)
        
        # Retornar as mais frequentes
        word_count = {}
        for word in keywords:
            word_count[word] = word_count.get(word, 0) + 1
        
        sorted_keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
        return [word for word, count in sorted_keywords[:5]]
    
    async def analyze_batch(self, texts: List[str]) -> List[SentimentResult]:
        """Analisar múltiplos textos."""
        results = []
        for text in texts:
            result = await self.analyze_text(text)
            results.append(result)
        return results
    
    async def get_sentiment_summary(self, results: List[SentimentResult]) -> Dict[str, Any]:
        """Obter resumo dos sentimentos."""
        if not results:
            return {}
        
        total = len(results)
        positive_count = sum(1 for r in results if r.sentiment == 'positive')
        negative_count = sum(1 for r in results if r.sentiment == 'negative')
        neutral_count = sum(1 for r in results if r.sentiment == 'neutral')
        
        avg_confidence = sum(r.confidence for r in results) / total
        
        # Emoções mais comuns
        all_emotions = {}
        for result in results:
            for emotion, score in result.emotions.items():
                all_emotions[emotion] = all_emotions.get(emotion, 0) + score
        
        top_emotions = sorted(all_emotions.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # Palavras-chave mais comuns
        all_keywords = []
        for result in results:
            all_keywords.extend(result.keywords)
        
        keyword_count = {}
        for keyword in all_keywords:
            keyword_count[keyword] = keyword_count.get(keyword, 0) + 1
        
        top_keywords = sorted(keyword_count.items(), key=lambda x: x[1], reverse=True)[:5]
        
        return {
            'total_analyses': total,
            'sentiment_distribution': {
                'positive': positive_count / total,
                'negative': negative_count / total,
                'neutral': neutral_count / total
            },
            'average_confidence': avg_confidence,
            'top_emotions': [{'emotion': emotion, 'score': score} for emotion, score in top_emotions],
            'top_keywords': [{'keyword': keyword, 'count': count} for keyword, count in top_keywords]
        }
