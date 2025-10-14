# Rotas de Avaliações - Alça Hub
from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List, Optional, Dict, Any
import logging

from auth.dependencies import get_db, get_current_user_payload
from reviews.models import (
    ReviewCreate,
    ReviewResponse,
    ReviewUpdate,
    ReviewStats,
    ReviewSearch,
    ReviewAnalytics,
    ReviewReport,
    ReviewModeration
)

logger = logging.getLogger(__name__)

# Router para avaliações
review_router = APIRouter(prefix="/reviews", tags=["reviews"])


async def get_current_user(request: Request) -> Dict[str, Any]:
    """Obter usuário atual do token."""
    return get_current_user_payload(request)


@review_router.post("/", response_model=dict)
async def create_review(
    request: Request,
    review_data: ReviewCreate,
    current_user: dict = Depends(get_current_user),
):
    """Criar nova avaliação."""
    try:
        db = get_db(request)
        review_data.reviewer_id = current_user["user_id"]
        
        # Salvar avaliação no banco
        review_doc = {
            "reviewer_id": review_data.reviewer_id,
            "reviewee_id": review_data.reviewee_id,
            "service_id": review_data.service_id,
            "booking_id": review_data.booking_id,
            "rating": review_data.rating,
            "title": review_data.title,
            "comment": review_data.comment,
            "type": review_data.type.value,
            "status": "pending",
            "anonymous": review_data.anonymous,
            "tags": review_data.tags or [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.reviews.insert_one(review_doc)
        
        return {
            "message": "Avaliação criada com sucesso",
            "review_id": str(result.inserted_id)
        }
    except Exception as e:
        logger.error(f"Erro ao criar avaliação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@review_router.get("/", response_model=List[ReviewResponse])
async def get_reviews(
    request: Request,
    reviewee_id: Optional[str] = None,
    service_id: Optional[str] = None,
    rating_min: Optional[int] = None,
    rating_max: Optional[int] = None,
    limit: int = 20,
    offset: int = 0,
):
    """Obter avaliações."""
    try:
        db = get_db(request)
        query = {"status": "approved"}
        
        if reviewee_id:
            query["reviewee_id"] = reviewee_id
        if service_id:
            query["service_id"] = service_id
        if rating_min:
            query["rating"] = {"$gte": rating_min}
        if rating_max:
            query["rating"] = {"$lte": rating_max}
        
        cursor = db.reviews.find(query).sort("created_at", -1).skip(offset).limit(limit)
        reviews = await cursor.to_list(length=None)
        
        return [
            ReviewResponse(
                id=review["_id"],
                reviewer_id=review["reviewer_id"],
                reviewee_id=review["reviewee_id"],
                service_id=review.get("service_id"),
                booking_id=review.get("booking_id"),
                rating=review["rating"],
                title=review.get("title"),
                comment=review.get("comment"),
                type=review["type"],
                status=review["status"],
                anonymous=review["anonymous"],
                tags=review.get("tags", []),
                created_at=review["created_at"],
                updated_at=review["updated_at"],
                approved_at=review.get("approved_at")
            )
            for review in reviews
        ]
    except Exception as e:
        logger.error(f"Erro ao obter avaliações: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@review_router.get("/stats/{user_id}", response_model=ReviewStats)
async def get_review_stats(
    user_id: str,
    request: Request,
):
    """Obter estatísticas de avaliações do usuário."""
    try:
        db = get_db(request)
        # Total de avaliações
        total_reviews = await db.reviews.count_documents({
            "reviewee_id": user_id,
            "status": "approved"
        })
        
        # Média de avaliações
        pipeline = [
            {"$match": {"reviewee_id": user_id, "status": "approved"}},
            {"$group": {"_id": None, "avg_rating": {"$avg": "$rating"}}}
        ]
        avg_result = await db.reviews.aggregate(pipeline).to_list(1)
        average_rating = avg_result[0]["avg_rating"] if avg_result else 0
        
        # Distribuição de notas
        rating_dist = {}
        for rating in range(1, 6):
            count = await db.reviews.count_documents({
                "reviewee_id": user_id,
                "rating": rating,
                "status": "approved"
            })
            rating_dist[str(rating)] = count
        
        # Avaliações recentes
        recent_reviews = await db.reviews.find({
            "reviewee_id": user_id,
            "status": "approved"
        }).sort("created_at", -1).limit(5).to_list(5)
        
        # Tags mais comuns
        tag_pipeline = [
            {"$match": {"reviewee_id": user_id, "status": "approved"}},
            {"$unwind": "$tags"},
            {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        top_tags = await db.reviews.aggregate(tag_pipeline).to_list(10)
        
        return ReviewStats(
            total_reviews=total_reviews,
            average_rating=round(average_rating, 2),
            rating_distribution=rating_dist,
            recent_reviews=[
                ReviewResponse(
                    id=review["_id"],
                    reviewer_id=review["reviewer_id"],
                    reviewee_id=review["reviewee_id"],
                    service_id=review.get("service_id"),
                    booking_id=review.get("booking_id"),
                    rating=review["rating"],
                    title=review.get("title"),
                    comment=review.get("comment"),
                    type=review["type"],
                    status=review["status"],
                    anonymous=review["anonymous"],
                    tags=review.get("tags", []),
                    created_at=review["created_at"],
                    updated_at=review["updated_at"],
                    approved_at=review.get("approved_at")
                )
                for review in recent_reviews
            ],
            top_tags=[{"tag": tag["_id"], "count": tag["count"]} for tag in top_tags]
        )
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@review_router.patch("/{review_id}", response_model=dict)
async def update_review(
    review_id: str,
    request: Request,
    update_data: ReviewUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Atualizar avaliação."""
    try:
        db = get_db(request)
        # Verificar se o usuário é o autor da avaliação
        review = await db.reviews.find_one({
            "_id": review_id,
            "reviewer_id": current_user["user_id"]
        })
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        # Atualizar avaliação
        update_fields = {}
        if update_data.rating is not None:
            update_fields["rating"] = update_data.rating
        if update_data.title is not None:
            update_fields["title"] = update_data.title
        if update_data.comment is not None:
            update_fields["comment"] = update_data.comment
        if update_data.tags is not None:
            update_fields["tags"] = update_data.tags
        
        update_fields["updated_at"] = datetime.utcnow()
        
        await db.reviews.update_one(
            {"_id": review_id},
            {"$set": update_fields}
        )
        
        return {"message": "Avaliação atualizada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao atualizar avaliação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@review_router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Deletar avaliação."""
    try:
        db = get_db(request)
        # Verificar se o usuário é o autor da avaliação
        review = await db.reviews.find_one({
            "_id": review_id,
            "reviewer_id": current_user["user_id"]
        })
        
        if not review:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avaliação não encontrada"
            )
        
        await db.reviews.delete_one({"_id": review_id})
        return {"message": "Avaliação deletada com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro ao deletar avaliação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@review_router.post("/{review_id}/report")
async def report_review(
    review_id: str,
    request: Request,
    report_data: ReviewReport,
    current_user: dict = Depends(get_current_user),
):
    """Reportar avaliação."""
    try:
        db = get_db(request)
        report_doc = {
            "review_id": review_id,
            "reporter_id": current_user["user_id"],
            "reason": report_data.reason,
            "description": report_data.description,
            "created_at": datetime.utcnow(),
            "status": "pending"
        }
        
        await db.review_reports.insert_one(report_doc)
        return {"message": "Avaliação reportada com sucesso"}
    except Exception as e:
        logger.error(f"Erro ao reportar avaliação: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )
