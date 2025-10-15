"""
Repositories - Camada de acesso a dados
"""
from .base import BaseRepository
from .user_repository import UserRepository

__all__ = ["BaseRepository", "UserRepository"]
