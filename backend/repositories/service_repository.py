"""
Repository para operações com serviços usando Beanie ODM
"""
from typing import Optional, List
from datetime import datetime
from models.service import Service
from core.enums import ServiceStatus


class ServiceRepository:
    """Repository para operações com serviços"""

    @staticmethod
    async def find_by_id(service_id: str) -> Optional[Service]:
        """Busca serviço por ID"""
        return await Service.get(service_id)

    @staticmethod
    async def find_by_prestador(
        prestador_id: str,
        ativo: Optional[bool] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Busca serviços de um prestador

        Args:
            prestador_id: ID do prestador
            ativo: Filtrar por ativo (None = todos)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Service.find(Service.prestador_id == prestador_id)

        if ativo is not None:
            query = query.find(Service.ativo == ativo)

        return await query.skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_categoria(
        categoria: str,
        ativo: bool = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Busca serviços por categoria

        Args:
            categoria: Categoria do serviço
            ativo: Apenas serviços ativos
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Service.find(
            Service.categoria == categoria,
            Service.ativo == ativo
        ).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_available(
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Busca serviços disponíveis

        Args:
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Service.find(
            Service.ativo == True,
            Service.status == ServiceStatus.DISPONIVEL
        ).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_nearby(
        lat: float,
        lon: float,
        radius_km: float,
        categoria: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Busca serviços próximos usando geolocalização

        Args:
            lat: Latitude
            lon: Longitude
            radius_km: Raio em quilômetros
            categoria: Filtrar por categoria (opcional)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = {
            "ativo": True,
            "status": ServiceStatus.DISPONIVEL.value,
            "latitude": {"$ne": None},
            "longitude": {"$ne": None},
            "$or": [
                {
                    "$and": [
                        {
                            "latitude": {
                                "$gte": lat - (radius_km / 111.0),
                                "$lte": lat + (radius_km / 111.0)
                            }
                        },
                        {
                            "longitude": {
                                "$gte": lon - (radius_km / (111.0 * abs(lat / 90))),
                                "$lte": lon + (radius_km / (111.0 * abs(lat / 90)))
                            }
                        }
                    ]
                }
            ]
        }

        if categoria:
            query["categoria"] = categoria

        return await Service.find(query).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_top_rated(
        limit: int = 10,
        min_rating: float = 4.0
    ) -> List[Service]:
        """
        Busca serviços mais bem avaliados

        Args:
            limit: Limitar resultados
            min_rating: Avaliação mínima
        """
        return await Service.find(
            Service.ativo == True,
            Service.avaliacao_media >= min_rating,
            Service.total_avaliacoes > 0
        ).sort(-Service.avaliacao_media).limit(limit).to_list()

    @staticmethod
    async def create(service: Service) -> Service:
        """
        Cria novo serviço

        Args:
            service: Objeto Service
        """
        await service.insert()
        return service

    @staticmethod
    async def update(service: Service) -> Service:
        """
        Atualiza serviço

        Args:
            service: Objeto Service
        """
        service.updated_at = datetime.utcnow()
        await service.save()
        return service

    @staticmethod
    async def soft_delete(service_id: str) -> bool:
        """
        Soft delete de serviço

        Args:
            service_id: ID do serviço
        """
        service = await Service.get(service_id)
        if service:
            await service.soft_delete()
            return True
        return False

    @staticmethod
    async def count_by_prestador(prestador_id: str, ativo: Optional[bool] = None) -> int:
        """
        Conta serviços de um prestador

        Args:
            prestador_id: ID do prestador
            ativo: Filtrar por ativo (None = todos)
        """
        query = Service.find(Service.prestador_id == prestador_id)

        if ativo is not None:
            query = query.find(Service.ativo == ativo)

        return await query.count()

    @staticmethod
    async def search(
        search_term: str,
        categoria: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Service]:
        """
        Busca serviços por termo de busca

        Args:
            search_term: Termo para buscar (titulo, descricao, tags)
            categoria: Filtrar por categoria (opcional)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = {
            "ativo": True,
            "$or": [
                {"titulo": {"$regex": search_term, "$options": "i"}},
                {"descricao": {"$regex": search_term, "$options": "i"}},
                {"tags": {"$in": [search_term.lower()]}}
            ]
        }

        if categoria:
            query["categoria"] = categoria

        return await Service.find(query).skip(skip).limit(limit).to_list()

    @staticmethod
    async def update_statistics(service_id: str) -> Optional[Service]:
        """
        Atualiza estatísticas agregadas de um serviço

        Args:
            service_id: ID do serviço
        """
        service = await Service.get(service_id)
        if not service:
            return None

        # Aqui poderíamos recalcular estatísticas do banco
        # Por enquanto apenas retorna o serviço
        return service
