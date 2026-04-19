import React from 'react';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  movies = [],
  loading = false,
  cardWidth = 180,
  onSeeAll,
}) {
  const skeletons = Array.from({ length: 6 });

  return (
    <div style={{ marginBottom: 'var(--spacing-10)' }}>
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {movies.length > 6 && (
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--secondary)', fontSize: '0.8125rem' }}
            onClick={onSeeAll}
          >
            See all →
          </button>
        )}
      </div>

      <div className="scroll-row">
        {loading
          ? skeletons.map((_, i) => (
              <div key={i} style={{ width: cardWidth, flexShrink: 0 }}>
                <div className="skeleton" style={{ width: cardWidth, aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                <div className="skeleton" style={{ height: 14, marginTop: 10, borderRadius: 4, width: '80%' }} />
                <div className="skeleton" style={{ height: 12, marginTop: 6, borderRadius: 4, width: '50%' }} />
              </div>
            ))
          : movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} width={cardWidth} />
            ))
        }
        {!loading && movies.length === 0 && (
          <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', padding: 'var(--spacing-8)' }}>
            No movies found.
          </div>
        )}
      </div>
    </div>
  );
}
