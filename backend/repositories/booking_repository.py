"""
Repository para operações com agendamentos usando Beanie ODM
"""
from typing import Optional, List
from datetime import datetime, timedelta
from models.booking import Booking
from core.enums import BookingStatus


class BookingRepository:
    """Repository para operações com agendamentos"""

    @staticmethod
    async def find_by_id(booking_id: str) -> Optional[Booking]:
        """Busca agendamento por ID"""
        return await Booking.get(booking_id)

    @staticmethod
    async def find_by_morador(
        morador_id: str,
        status: Optional[BookingStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos de um morador

        Args:
            morador_id: ID do morador
            status: Filtrar por status (None = todos)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Booking.find(Booking.morador_id == morador_id)

        if status:
            query = query.find(Booking.status == status)

        return await query.sort(-Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_prestador(
        prestador_id: str,
        status: Optional[BookingStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos de um prestador

        Args:
            prestador_id: ID do prestador
            status: Filtrar por status (None = todos)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Booking.find(Booking.prestador_id == prestador_id)

        if status:
            query = query.find(Booking.status == status)

        return await query.sort(-Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_service(
        service_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos de um serviço

        Args:
            service_id: ID do serviço
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Booking.find(
            Booking.service_id == service_id
        ).sort(-Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_upcoming(
        user_id: str,
        user_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos futuros de um usuário

        Args:
            user_id: ID do usuário
            user_type: "morador" ou "prestador"
            skip: Pular N resultados
            limit: Limitar resultados
        """
        now = datetime.utcnow()
        field = Booking.morador_id if user_type == "morador" else Booking.prestador_id

        return await Booking.find(
            field == user_id,
            Booking.data_agendamento >= now,
            Booking.status != BookingStatus.CANCELADO
        ).sort(+Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_pending_confirmation(
        prestador_id: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos pendentes de confirmação do prestador

        Args:
            prestador_id: ID do prestador
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Booking.find(
            Booking.prestador_id == prestador_id,
            Booking.status == BookingStatus.PENDENTE,
            Booking.confirmado_prestador == False
        ).sort(+Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_date_range(
        start_date: datetime,
        end_date: datetime,
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos em um período

        Args:
            start_date: Data inicial
            end_date: Data final
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Booking.find(
            Booking.data_agendamento >= start_date,
            Booking.data_agendamento <= end_date
        )

        if prestador_id:
            query = query.find(Booking.prestador_id == prestador_id)

        if morador_id:
            query = query.find(Booking.morador_id == morador_id)

        return await query.sort(+Booking.data_agendamento).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_pending_rating(
        user_id: str,
        user_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Booking]:
        """
        Busca agendamentos concluídos pendentes de avaliação

        Args:
            user_id: ID do usuário
            user_type: "morador" ou "prestador"
            skip: Pular N resultados
            limit: Limitar resultados
        """
        if user_type == "morador":
            return await Booking.find(
                Booking.morador_id == user_id,
                Booking.status == BookingStatus.CONCLUIDO,
                Booking.avaliacao_morador == None
            ).sort(-Booking.concluido_at).skip(skip).limit(limit).to_list()
        else:  # prestador
            return await Booking.find(
                Booking.prestador_id == user_id,
                Booking.status == BookingStatus.CONCLUIDO,
                Booking.avaliacao_prestador == None
            ).sort(-Booking.concluido_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def create(booking: Booking) -> Booking:
        """
        Cria novo agendamento

        Args:
            booking: Objeto Booking
        """
        await booking.insert()
        return booking

    @staticmethod
    async def update(booking: Booking) -> Booking:
        """
        Atualiza agendamento

        Args:
            booking: Objeto Booking
        """
        booking.updated_at = datetime.utcnow()
        await booking.save()
        return booking

    @staticmethod
    async def count_by_status(
        status: BookingStatus,
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None
    ) -> int:
        """
        Conta agendamentos por status

        Args:
            status: Status dos agendamentos
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
        """
        query = Booking.find(Booking.status == status)

        if prestador_id:
            query = query.find(Booking.prestador_id == prestador_id)

        if morador_id:
            query = query.find(Booking.morador_id == morador_id)

        return await query.count()

    @staticmethod
    async def count_total(
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None
    ) -> int:
        """
        Conta total de agendamentos

        Args:
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
        """
        query = Booking.find()

        if prestador_id:
            query = query.find(Booking.prestador_id == prestador_id)

        if morador_id:
            query = query.find(Booking.morador_id == morador_id)

        return await query.count()

    @staticmethod
    async def check_conflicts(
        prestador_id: str,
        data_agendamento: datetime,
        duracao_minutos: int
    ) -> List[Booking]:
        """
        Verifica conflitos de horário para um prestador

        Args:
            prestador_id: ID do prestador
            data_agendamento: Data/hora do novo agendamento
            duracao_minutos: Duração em minutos
        """
        start_time = data_agendamento
        end_time = data_agendamento + timedelta(minutes=duracao_minutos)

        # Busca agendamentos ativos no mesmo período
        return await Booking.find(
            Booking.prestador_id == prestador_id,
            Booking.status.in_([
                BookingStatus.PENDENTE,
                BookingStatus.CONFIRMADO,
                BookingStatus.EM_ANDAMENTO
            ]),
            Booking.data_agendamento >= start_time - timedelta(hours=24),
            Booking.data_agendamento <= end_time
        ).to_list()

    @staticmethod
    async def get_statistics(
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> dict:
        """
        Retorna estatísticas de agendamentos

        Args:
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
            start_date: Data inicial (opcional)
            end_date: Data final (opcional)
        """
        query = {}

        if prestador_id:
            query["prestador_id"] = prestador_id

        if morador_id:
            query["morador_id"] = morador_id

        if start_date and end_date:
            query["data_agendamento"] = {"$gte": start_date, "$lte": end_date}

        # Aggregation pipeline para estatísticas
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "total_value": {"$sum": "$valor_acordado"}
                }
            }
        ]

        results = await Booking.aggregate(pipeline).to_list()

        # Formatar resultados
        stats = {
            "total": 0,
            "by_status": {},
            "total_value": 0.0
        }

        for result in results:
            status = result["_id"]
            count = result["count"]
            value = result.get("total_value", 0.0) or 0.0

            stats["total"] += count
            stats["total_value"] += value
            stats["by_status"][status] = {
                "count": count,
                "total_value": value
            }

        return stats
