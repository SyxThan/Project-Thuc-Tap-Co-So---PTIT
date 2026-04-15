from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.api.schemas.interaction import RatingRequest, RatingResponse
from app.models import User
from app.services import rating_service

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.post("", response_model=RatingResponse, status_code=200)
def rate_movie(
    payload: RatingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /ratings
    Submit or update a movie rating for the current user.
    - If the user has already rated this movie → UPDATE
    - Otherwise → INSERT
    Payload: { "movie_id": 1, "rating_score": 4.5 }
    """
    rating = rating_service.upsert_rating(db, user_id=current_user.id, payload=payload)
    return RatingResponse.model_validate(rating)
