import React from 'react';
import MovieCard from './MovieCard';


export default function MovieGrid({
  movies = [],
  loading = false,
  cardWidth = 150,
  onMovieClick,
  emptyMessage = 'No movies found',
}) {
  const gridColsClass = cardWidth >= 180 ? 'repeat(auto-fill, minmax(180px, 1fr))' : 'repeat(auto-fill, minmax(150px, 1fr))';

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: gridColsClass,
        gap: 'var(--spacing-4)',
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <div
              className="skeleton"
              style={{
                aspectRatio: '2/3',
                borderRadius: 'var(--radius-lg)',
              }}
            />
            <div className="skeleton" style={{ height: 14, marginTop: 8, width: '80%' }} />
            <div className="skeleton" style={{ height: 12, marginTop: 4, width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'var(--spacing-12) var(--spacing-4)',
        color: 'var(--on-surface-variant)',
      }}>
        <p style={{ fontSize: '1rem', marginBottom: 'var(--spacing-2)' }}>🎬</p>
        <p className="body-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: gridColsClass,
      gap: 'var(--spacing-4)',
    }}>
      {movies.map((movie) => (
        <div
          key={movie.id || movie.movie_id}
          onClick={() => onMovieClick?.(movie)}
          style={{ cursor: onMovieClick ? 'pointer' : 'default' }}
        >
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
}
