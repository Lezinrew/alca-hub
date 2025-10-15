"""
Base Repository - Repository pattern para acesso ao MongoDB
"""
from typing import Generic, TypeVar, Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from abc import ABC

T = TypeVar('T')


class BaseRepository(Generic[T], ABC):
    """
    Repository base para operações CRUD no MongoDB

    Implementa o padrão Repository para abstrair acesso ao banco de dados.
    """

    def __init__(self, database: AsyncIOMotorDatabase, collection_name: str):
        """
        Inicializa o repository

        Args:
            database: Instância do banco MongoDB
            collection_name: Nome da collection
        """
        self.db = database
        self.collection = database[collection_name]

    async def find_by_id(self, id: str) -> Optional[Dict[str, Any]]:
        """
        Busca documento por ID

        Args:
            id: ID do documento

        Returns:
            Documento encontrado ou None
        """
        return await self.collection.find_one({"_id": id})

    async def find_one(self, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Busca um documento por filtro

        Args:
            filter: Filtro MongoDB

        Returns:
            Documento encontrado ou None
        """
        return await self.collection.find_one(filter)

    async def find_many(
        self,
        filter: Dict[str, Any] = None,
        skip: int = 0,
        limit: int = 100,
        sort: List[tuple] = None
    ) -> List[Dict[str, Any]]:
        """
        Busca múltiplos documentos

        Args:
            filter: Filtro MongoDB
            skip: Número de documentos para pular
            limit: Limite de documentos
            sort: Lista de tuplas (campo, ordem)

        Returns:
            Lista de documentos
        """
        filter = filter or {}
        cursor = self.collection.find(filter).skip(skip).limit(limit)

        if sort:
            cursor = cursor.sort(sort)

        return await cursor.to_list(length=limit)

    async def create(self, data: Dict[str, Any]) -> str:
        """
        Cria novo documento

        Args:
            data: Dados do documento

        Returns:
            ID do documento criado
        """
        result = await self.collection.insert_one(data)
        return str(result.inserted_id)

    async def update(
        self,
        id: str,
        data: Dict[str, Any],
        upsert: bool = False
    ) -> int:
        """
        Atualiza documento por ID

        Args:
            id: ID do documento
            data: Dados para atualizar
            upsert: Se True, cria documento se não existir

        Returns:
            Número de documentos modificados
        """
        result = await self.collection.update_one(
            {"_id": id},
            {"$set": data},
            upsert=upsert
        )
        return result.modified_count

    async def delete(self, id: str) -> int:
        """
        Deleta documento por ID

        Args:
            id: ID do documento

        Returns:
            Número de documentos deletados
        """
        result = await self.collection.delete_one({"_id": id})
        return result.deleted_count

    async def count(self, filter: Dict[str, Any] = None) -> int:
        """
        Conta documentos

        Args:
            filter: Filtro MongoDB

        Returns:
            Número de documentos
        """
        filter = filter or {}
        return await self.collection.count_documents(filter)

    async def exists(self, filter: Dict[str, Any]) -> bool:
        """
        Verifica se documento existe

        Args:
            filter: Filtro MongoDB

        Returns:
            True se existe, False caso contrário
        """
        count = await self.collection.count_documents(filter, limit=1)
        return count > 0
