from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models import User, Rating, UserInteraction
from app.services.recommendation_adapter import RecommendationDataBuilder, RecommendationResultMapper
from app.services.content_based_service import get_cold_start_recommendations_content_based
from app.api.lib.collaborative_filtering import CF

router = APIRouter(prefix="/recommends", tags=["Recommendations"])


class RecommendationResponse:
    """Simple recommendation response model"""
    def __init__(self, movie_id: int, title: str, poster_path: str = None, 
                 vote_average: float = None, predicted_score: float = None):
        self.movie_id = movie_id
        self.title = title
        self.poster_path = poster_path
        self.vote_average = vote_average
        self.predicted_score = predicted_score


@router.get("/me")
def get_recommendations(
    top_n: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    GET /recommends/me?top_n=5
    
    Get personalized recommendations for the authenticated user.
    
    Strategy:
    1. If user has ratings → use Collaborative Filtering (user-based)
    2. If user has watchlist/interactions but few ratings → combine ratings + watch history
    3. If user is new (no data) → recommend top-rated movies + preferred genres
    
    Returns: { "recommendations": [ {movie_id, title, poster_path, vote_average, predicted_score}, ...] }
    """
    
    # ─── Step 1: Build recommendation data ───────────────────────────────
    builder = RecommendationDataBuilder(db)
    Y_data, n_users, n_items = builder.build_combined_matrix()
    
    # Check if user has any data
    user_idx = builder.get_user_index(current_user.id)
    if user_idx is None:
        # User is new: no ratings, no watches
        return _get_cold_start_recommendations(db, current_user, top_n)
    
    # ─── Step 2: Check if we have enough data for CF ───────────────────
    if Y_data.shape[0] < 2 or n_users < 2:
        # Not enough global data: fallback to cold-start
        return _get_cold_start_recommendations(db, current_user, top_n)
    
    # ─── Step 3: Run Collaborative Filtering ───────────────────────────
    try:
        cf = CF(Y_data, k=min(10, n_users - 1), uuCF=1)
        cf.fit()
        
        # Get recommendations for current user
        recommendations = cf.recommend(user_idx, top_n=top_n)
        
        # Map results back to UUIDs and movie details
        mapper = RecommendationResultMapper(builder.user_idx_to_uuid, db)
        result = mapper.map_recommendations(recommendations)

        # Nếu CF không học được tín hiệu (điểm <= 0) thì fallback cold-start
        has_positive_signal = any((item.get("predicted_score") or 0) > 0 for item in result)
        if not result or not has_positive_signal:
            return _get_cold_start_recommendations(db, current_user, top_n)

        # Nếu kết quả CF chưa đủ top_n thì bù thêm từ cold-start (không trùng movie_id)
        if len(result) < top_n:
            cold_start = _get_cold_start_recommendations(db, current_user, top_n)
            existing_ids = {item["movie_id"] for item in result}
            for item in cold_start["recommendations"]:
                if item["movie_id"] in existing_ids:
                    continue
                result.append(item)
                existing_ids.add(item["movie_id"])
                if len(result) >= top_n:
                    break

        return {"recommendations": result[:top_n]}
    except Exception as e:
        # Fallback on CF error
        print(f"[recommendation] CF failed: {str(e)}")
        return _get_cold_start_recommendations(db, current_user, top_n)


def _get_cold_start_recommendations(db: Session, user: User, top_n: int) -> dict:
    """
    Fallback strategy for new users (cold-start problem).
    
    Uses content-based filtering:
    1. If user selected preferred genres → recommend top movies in those genres
    2. Rank by vote_average + vote_count (popularity)
    3. Fallback to top-rated overall
    """
    preferred_genre_ids = [g.id for g in user.preferred_genres]
    excluded_movie_ids = []
    
    # Exclude movies already watched or rated
    watched = db.query(UserInteraction.movie_id).filter(
        UserInteraction.user_id == user.id
    ).all()
    rated = db.query(Rating.movie_id).filter(
        Rating.user_id == user.id
    ).all()
    excluded_movie_ids = [w[0] for w in watched] + [r[0] for r in rated]
    
    # Use content-based filtering
    recommendations = get_cold_start_recommendations_content_based(
        db,
        preferred_genre_ids,
        exclude_movie_ids=excluded_movie_ids,
        top_n=top_n,
    )
    
    return {"recommendations": recommendations}
