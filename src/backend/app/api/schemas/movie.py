from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


class GenreResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class MovieResponse(BaseModel):
    id: int
    title: str
    overview: Optional[str]
    release_date: Optional[date]
    poster_path: Optional[str]
    youtube_trailer_id: Optional[str]
    vote_average: Optional[float]
    vote_count: Optional[int]
    genres: List[GenreResponse] = []

    class Config:
        from_attributes = True


class PaginatedMoviesResponse(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[MovieResponse]
