from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime



class WatchMovieResponse(BaseModel):
    movie_id: int
    title: str
    youtube_trailer_id: Optional[str]
    added_to_watchlist: bool
    watchlist_message: str

    class Config:
        from_attributes = True


class RatingRequest(BaseModel):
    movie_id: int
    rating_score: float = Field(..., ge=0.5, le=5.0)


class RatingResponse(BaseModel):
    id: int
    movie_id: int
    rating_score: float
    created_at: datetime

    class Config:
        from_attributes = True



class WatchlistItemResponse(BaseModel):
    movie_id: int
    added_at: datetime

    # Nested movie details
    movie_title: Optional[str] = None
    poster_path: Optional[str] = None
    vote_average: Optional[float] = None

    class Config:
        from_attributes = True
