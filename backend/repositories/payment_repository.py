"""
Repository para operações com pagamentos usando Beanie ODM
"""
from typing import Optional, List, Dict, Any
from datetime import datetime
from models.payment import Payment
from core.enums import PaymentStatus


class PaymentRepository:
    """Repository para operações com pagamentos"""

    @staticmethod
    async def find_by_id(payment_id: str) -> Optional[Payment]:
        """Busca pagamento por ID"""
        return await Payment.get(payment_id)

    @staticmethod
    async def find_by_booking(booking_id: str) -> Optional[Payment]:
        """Busca pagamento por agendamento"""
        return await Payment.find_one(Payment.booking_id == booking_id)

    @staticmethod
    async def find_by_gateway_id(gateway_payment_id: str) -> Optional[Payment]:
        """Busca pagamento por ID do gateway"""
        return await Payment.find_one(
            Payment.gateway_payment_id == gateway_payment_id
        )

    @staticmethod
    async def find_by_morador(
        morador_id: str,
        status: Optional[PaymentStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos de um morador

        Args:
            morador_id: ID do morador
            status: Filtrar por status (None = todos)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Payment.find(Payment.morador_id == morador_id)

        if status:
            query = query.find(Payment.status == status)

        return await query.sort(-Payment.created_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_prestador(
        prestador_id: str,
        status: Optional[PaymentStatus] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos de um prestador

        Args:
            prestador_id: ID do prestador
            status: Filtrar por status (None = todos)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Payment.find(Payment.prestador_id == prestador_id)

        if status:
            query = query.find(Payment.status == status)

        return await query.sort(-Payment.created_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_pending(
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos pendentes

        Args:
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Payment.find(
            Payment.status.in_([
                PaymentStatus.PENDENTE,
                PaymentStatus.PROCESSANDO
            ])
        ).sort(-Payment.created_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_expired(
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos expirados

        Args:
            skip: Pular N resultados
            limit: Limitar resultados
        """
        now = datetime.utcnow()
        return await Payment.find(
            Payment.expires_at != None,
            Payment.expires_at < now,
            Payment.status == PaymentStatus.PENDENTE
        ).skip(skip).limit(limit).to_list()

    @staticmethod
    async def find_by_date_range(
        start_date: datetime,
        end_date: datetime,
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos em um período

        Args:
            start_date: Data inicial
            end_date: Data final
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
            skip: Pular N resultados
            limit: Limitar resultados
        """
        query = Payment.find(
            Payment.created_at >= start_date,
            Payment.created_at <= end_date
        )

        if prestador_id:
            query = query.find(Payment.prestador_id == prestador_id)

        if morador_id:
            query = query.find(Payment.morador_id == morador_id)

        return await query.sort(-Payment.created_at).skip(skip).limit(limit).to_list()

    @staticmethod
    async def create(payment: Payment) -> Payment:
        """
        Cria novo pagamento

        Args:
            payment: Objeto Payment
        """
        await payment.insert()
        return payment

    @staticmethod
    async def update(payment: Payment) -> Payment:
        """
        Atualiza pagamento

        Args:
            payment: Objeto Payment
        """
        payment.updated_at = datetime.utcnow()
        await payment.save()
        return payment

    @staticmethod
    async def count_by_status(
        status: PaymentStatus,
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None
    ) -> int:
        """
        Conta pagamentos por status

        Args:
            status: Status dos pagamentos
            prestador_id: Filtrar por prestador (opcional)
            morador_id: Filtrar por morador (opcional)
        """
        query = Payment.find(Payment.status == status)

        if prestador_id:
            query = query.find(Payment.prestador_id == prestador_id)

        if morador_id:
            query = query.find(Payment.morador_id == morador_id)

        return await query.count()

    @staticmethod
    async def calculate_revenue(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        prestador_id: Optional[str] = None
    ) -> Dict[str, float]:
        """
        Calcula receita total

        Args:
            start_date: Data inicial (opcional)
            end_date: Data final (opcional)
            prestador_id: Filtrar por prestador (opcional)

        Returns:
            Dict com receitas (total, plataforma, prestadores)
        """
        query = {"status": PaymentStatus.PAGO.value}

        if start_date and end_date:
            query["data_pagamento"] = {"$gte": start_date, "$lte": end_date}

        if prestador_id:
            query["prestador_id"] = prestador_id

        # Aggregation pipeline
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": None,
                    "total_revenue": {"$sum": "$valor_total"},
                    "platform_revenue": {"$sum": "$valor_taxa"},
                    "provider_revenue": {"$sum": "$valor_prestador"},
                    "total_refunded": {
                        "$sum": {
                            "$cond": [
                                "$reembolsado",
                                "$valor_reembolsado",
                                0
                            ]
                        }
                    },
                    "count": {"$sum": 1}
                }
            }
        ]

        results = await Payment.aggregate(pipeline).to_list()

        if not results:
            return {
                "total_revenue": 0.0,
                "platform_revenue": 0.0,
                "provider_revenue": 0.0,
                "total_refunded": 0.0,
                "net_revenue": 0.0,
                "count": 0
            }

        result = results[0]
        total_refunded = result.get("total_refunded", 0.0)

        return {
            "total_revenue": result.get("total_revenue", 0.0),
            "platform_revenue": result.get("platform_revenue", 0.0),
            "provider_revenue": result.get("provider_revenue", 0.0),
            "total_refunded": total_refunded,
            "net_revenue": result.get("total_revenue", 0.0) - total_refunded,
            "count": result.get("count", 0)
        }

    @staticmethod
    async def get_statistics(
        prestador_id: Optional[str] = None,
        morador_id: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Retorna estatísticas de pagamentos

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
            query["created_at"] = {"$gte": start_date, "$lte": end_date}

        # Aggregation pipeline para estatísticas detalhadas
        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "total_value": {"$sum": "$valor_total"},
                    "avg_value": {"$avg": "$valor_total"}
                }
            }
        ]

        results = await Payment.aggregate(pipeline).to_list()

        # Formatar resultados
        stats = {
            "total": 0,
            "by_status": {},
            "total_value": 0.0,
            "avg_value": 0.0
        }

        for result in results:
            status = result["_id"]
            count = result["count"]
            total_value = result.get("total_value", 0.0) or 0.0
            avg_value = result.get("avg_value", 0.0) or 0.0

            stats["total"] += count
            stats["total_value"] += total_value
            stats["by_status"][status] = {
                "count": count,
                "total_value": total_value,
                "avg_value": avg_value
            }

        if stats["total"] > 0:
            stats["avg_value"] = stats["total_value"] / stats["total"]

        return stats

    @staticmethod
    async def get_payment_methods_stats(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Retorna estatísticas por método de pagamento

        Args:
            start_date: Data inicial (opcional)
            end_date: Data final (opcional)
        """
        query = {"status": PaymentStatus.PAGO.value}

        if start_date and end_date:
            query["data_pagamento"] = {"$gte": start_date, "$lte": end_date}

        pipeline = [
            {"$match": query},
            {
                "$group": {
                    "_id": "$metodo_pagamento",
                    "count": {"$sum": 1},
                    "total_value": {"$sum": "$valor_total"}
                }
            }
        ]

        results = await Payment.aggregate(pipeline).to_list()

        # Formatar resultados
        stats = {}
        total_count = 0
        total_value = 0.0

        for result in results:
            method = result["_id"]
            count = result["count"]
            value = result.get("total_value", 0.0) or 0.0

            total_count += count
            total_value += value

            stats[method] = {
                "count": count,
                "total_value": value,
                "percentage": 0.0  # Será calculado depois
            }

        # Calcular percentuais
        if total_count > 0:
            for method in stats:
                stats[method]["percentage"] = (stats[method]["count"] / total_count) * 100

        return {
            "by_method": stats,
            "total_count": total_count,
            "total_value": total_value
        }

    @staticmethod
    async def find_refunded(
        skip: int = 0,
        limit: int = 100
    ) -> List[Payment]:
        """
        Busca pagamentos reembolsados

        Args:
            skip: Pular N resultados
            limit: Limitar resultados
        """
        return await Payment.find(
            Payment.reembolsado == True
        ).sort(-Payment.data_reembolso).skip(skip).limit(limit).to_list()
