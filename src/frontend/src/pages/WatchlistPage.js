import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import watchlistApi from '../api/watchlistApi';
import { useAuth } from '../context/AuthContext';
import MovieCard from '../components/movie/MovieCard';

const DEMO_WATCHLIST = [
  { id: 1, title: 'Interstellar', vote_average: 8.6, release_year: 2014 },
  { id: 2, title: 'Dune: Part Two', vote_average: 8.5, release_year: 2024 },
  { id: 3, title: 'Oppenheimer', vote_average: 8.4, release_year: 2023 },
];

export default function WatchlistPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return; }
    const fetchWatchlist = async () => {
      setLoading(true);
      try {
        const res = await watchlistApi.getWatchlist();
      
    
        const normalized = (res || []).map(item => ({
          ...item,
          id: item.id || item.movie_id,
          title: item.title || item.movie_title
        }));
        setMovies(normalized);
      } catch {
        setMovies(DEMO_WATCHLIST);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [isAuthenticated]);

  const handleRemove = async (movieId) => {
    try {
      await watchlistApi.removeFromWatchlist(movieId);
      setMovies(prev => prev.filter(m => m.id !== movieId));
    } catch {}
  };

  if (!isAuthenticated) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '5rem', marginBottom: 'var(--spacing-6)', opacity: 0.3 }}>♡</div>
        <h1 className="title-lg" style={{ marginBottom: 'var(--spacing-3)' }}>Your Watchlist</h1>
        <p className="body-lg" style={{ marginBottom: 'var(--spacing-6)', maxWidth: 400 }}>
          Sign in to save movies to your personal watchlist and never miss a film.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Sign In</button>
          <button className="btn btn-glass" onClick={() => navigate('/register')}>Create Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="top-bar" style={{ marginBottom: 'var(--spacing-8)' }}>
        <div>
          <h1 className="display-md" style={{ marginBottom: 'var(--spacing-1)' }}>My Watchlist</h1>
          <p className="body-md">{movies.length} {movies.length === 1 ? 'film' : 'films'} saved</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
          {['all', 'rated', 'unrated'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`chip ${filter === f ? 'chip-active' : 'chip-default'}`}
              style={{ padding: 'var(--spacing-2) var(--spacing-4)' }}
            >
              {f === 'all' ? 'All' : f === 'rated' ? '⭐ Rated' : '○ Unrated'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-5)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ height: 14, marginTop: 10, width: '80%' }} />
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-16)' }}>
          <div style={{ fontSize: '5rem', marginBottom: 'var(--spacing-4)', opacity: 0.2 }}>🎬</div>
          <h2 className="title-lg" style={{ marginBottom: 'var(--spacing-3)', color: 'var(--on-surface-variant)' }}>Your watchlist is empty</h2>
          <p className="body-md" style={{ marginBottom: 'var(--spacing-6)' }}>Discover great films and save them here</p>
          <button className="btn btn-primary" onClick={() => navigate('/discover')}>
            Explore Movies
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--spacing-5)' }}>
          {movies.map((movie) => (
            <div key={movie.id} style={{ position: 'relative' }}>
              <MovieCard movie={movie} width="100%" />
              <button
                id={`remove-watchlist-${movie.id}`}
                onClick={(e) => { e.preventDefault(); handleRemove(movie.id); }}
                title="Remove from watchlist"
                style={{
                  position: 'absolute', top: 8, right: 8,
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'rgba(14,14,14,0.9)',
                  border: '1px solid rgba(73,72,71,0.5)',
                  color: 'var(--error)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  zIndex: 5,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(185,41,2,0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(14,14,14,0.9)'}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
