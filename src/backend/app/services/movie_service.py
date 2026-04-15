from typing import Optional, List, Tuple
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models import Movie, Genre
from app.models.associations import MovieGenre


def get_all_movies(
    db: Session,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "rating",
) -> Tuple[int, List[Movie]]:
   
    query = db.query(Movie).options(joinedload(Movie.genres))
    
    if sort_by == "release_date":
        query = query.order_by(Movie.release_date.desc())
    elif sort_by == "title":
        query = query.order_by(Movie.title.asc())
    else: 
        query = query.order_by(Movie.vote_average.desc())
    
    total = query.count()
    movies = query.offset(offset).limit(limit).all()
    return total, movies


def get_movies_by_genre(
    db: Session,
    genre_id: int,
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "rating",
) -> Tuple[int, List[Movie]]:
    query = (
        db.query(Movie)
        .options(joinedload(Movie.genres))
        .join(MovieGenre, Movie.id == MovieGenre.movie_id)
        .filter(MovieGenre.genre_id == genre_id)
    )

    if sort_by == "release_date":
        query = query.order_by(Movie.release_date.desc())
    elif sort_by == "title":
        query = query.order_by(Movie.title.asc())
    else:
        query = query.order_by(Movie.vote_average.desc())

    total = query.count()
    movies = query.offset(offset).limit(limit).all()
    return total, movies


def get_movies(
    db: Session,
    limit: int = 20,
    offset: int = 0,
    genre_id: Optional[int] = None,
) -> Tuple[int, List[Movie]]:
    query = db.query(Movie).options(joinedload(Movie.genres))

    if genre_id is not None:
        query = query.join(MovieGenre, Movie.id == MovieGenre.movie_id).filter(
            MovieGenre.genre_id == genre_id
        )

    total = query.count()
    movies = query.order_by(Movie.vote_average.desc()).offset(offset).limit(limit).all()
    return total, movies


def get_movie_by_id(db: Session, movie_id: int) -> Optional[Movie]:
    return (
        db.query(Movie)
        .options(joinedload(Movie.genres))
        .filter(Movie.id == movie_id)
        .first()
    )


def search_movies(
    db: Session,
    q: str,
    limit: int = 20,
    offset: int = 0,
) -> Tuple[int, List[Movie]]:
    query = (
        db.query(Movie)
        .options(joinedload(Movie.genres))
        .filter(Movie.title.ilike(f"%{q}%"))
    )
    total = query.count()
    movies = query.order_by(Movie.vote_average.desc()).offset(offset).limit(limit).all()
    return total, movies
