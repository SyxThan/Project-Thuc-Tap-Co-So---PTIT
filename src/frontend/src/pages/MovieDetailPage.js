import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import movieApi from '../api/movieApi';
import watchlistApi from '../api/watchlistApi';
import { useAuth } from '../context/AuthContext';
import TrailerModal from '../components/movie/TrailerModal';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

const DEMO_MOVIE = {
  id: 1,
  title: 'Interstellar',
  overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival in a dying world.",
  vote_average: 8.6,
  release_year: 2014,
  runtime: 169,
  genres: ['Science Fiction', 'Drama', 'Adventure'],
  director: 'Christopher Nolan',
  cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
  tagline: 'Mankind was born on Earth. It was never meant to die here.',
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [similar, setSimilar] = useState([]);

  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerId, setTrailerId] = useState(null);
  const [watchLoading, setWatchLoading] = useState(false);

  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const data = await movieApi.getMovieById(id);
        setMovie(data);

        if (isAuthenticated) {
          try {
            const wlCheck = await watchlistApi.isInWatchlist(id);
            setInWatchlist(wlCheck.in_watchlist || false);
          } catch {}
        }

        try {
          const simRes = await movieApi.getMovies({
            genre: data.genres?.[0]?.id || data.genres?.[0],
            limit: 8,
            exclude: id,
          });
          setSimilar(simRes.items || simRes.movies || []);
        } catch {}
      } catch {
        setMovie(DEMO_MOVIE);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id, isAuthenticated]);

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      if (inWatchlist) {
        await watchlistApi.removeFromWatchlist(id);
        setInWatchlist(false);
      } else {
        await watchlistApi.addToWatchlist(id);
        setInWatchlist(true);
      }
    } catch {}
  };

  const handleWatchNow = async () => {
    if (!movie) return;

    if (isAuthenticated) {
      setWatchLoading(true);
      try {
        const res = await movieApi.watchMovie(movie.id);
        setTrailerId(res.youtube_trailer_id || null);
        if (res.added_to_watchlist) setInWatchlist(true);
      } catch {
        setTrailerId(movie.youtube_trailer_id || null);
      } finally {
        setWatchLoading(false);
      }
    } else {
      setTrailerId(movie.youtube_trailer_id || null);
    }
    setTrailerOpen(true);
  };

  if (loading) {
    return (
      <div style={{ width: '100%', padding: 'var(--spacing-8)' }}>
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--spacing-8)' }} />
        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />
      </div>
    );
  }

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : null;
  const posterUrl = movie.poster_path ? `${POSTER_BASE}${movie.poster_path}` : null;
  const hasTrailer = Boolean(movie.youtube_trailer_id);

  return (
    <div className="fade-in" style={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>
      {trailerOpen && (
        <TrailerModal
          trailerId={trailerId}
          title={movie.title}
          onClose={() => { setTrailerOpen(false); setTrailerId(null); }}
        />
      )}

      {/* Hero */}
      <div style={{
        position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        minHeight: 450, marginBottom: 'var(--spacing-10)', display: 'flex', alignItems: 'flex-end',
        boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: backdropUrl ? 'none' : 'linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 100%)' }}>
          {backdropUrl && <img src={backdropUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.35, filter: 'blur(1px)' }} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(14,14,14,1) 0%, rgba(14,14,14,0.8) 40%, rgba(14,14,14,0) 100%), linear-gradient(to top, rgba(14,14,14,1) 0%, transparent 50%)' }} />
        
        <button onClick={() => navigate(-1)} className="btn btn-glass btn-sm" style={{ position: 'absolute', top: 'var(--spacing-6)', left: 'var(--spacing-6)', zIndex: 10 }}>← Back</button>

        <div style={{ position: 'relative', padding: 'var(--spacing-10)', width: '100%' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ width: 220, flexShrink: 0, borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
              {posterUrl ? <img src={posterUrl} alt={movie.title} style={{ width: '100%', display: 'block' }} /> : <div style={{ aspectRatio: '2/3', background: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🎬</div>}
            </div>
            <div style={{ flex: '1 1 400px' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                {movie.release_date && <span className="chip chip-active">{new Date(movie.release_date).getFullYear()}</span>}
                <span className="chip chip-default">★ {Number(movie.vote_average || 0).toFixed(1)}</span>
              </div>
              <h1 className="display-md" style={{ color: '#fff', marginBottom: 'var(--spacing-4)' }}>{movie.title}</h1>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                {(movie.genres || []).map((g, i) => (
                  <span key={g.id || i} className="chip chip-default" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}>{typeof g === 'string' ? g : (g.name || '')}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                <button onClick={handleWatchNow} disabled={watchLoading} className="btn btn-primary btn-lg glow-primary" style={{ minWidth: 200 }}>
                  {watchLoading ? 'Loading...' : <>▶ Watch Now{!hasTrailer ? ' (No Trailer)' : ''}</>}
                </button>
                <button onClick={handleWatchlistToggle} className={`btn btn-lg ${inWatchlist ? 'btn-secondary' : 'btn-glass'}`}>
                  {inWatchlist ? '♥ In Watchlist' : '♡ Add to Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--spacing-12)' }}>
        <div>
          <section style={{ marginBottom: 'var(--spacing-10)' }}>
            <h2 className="section-title">Synopsis</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface)', lineHeight: 1.8 }}>{movie.overview || "No synopsis available."}</p>
          </section>
        </div>
        <div>
          {similar.length > 0 && (
            <>
              <h3 className="title-sm" style={{ marginBottom: 'var(--spacing-4)', color: 'var(--on-surface-variant)' }}>SIMILAR TITLES</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                {similar.map(m => (
                  <div key={m.id} onClick={() => navigate(`/movie/${m.id}`)} style={{ cursor: 'pointer', display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center', padding: 'var(--spacing-2)', borderRadius: 'var(--radius-md)', transition: 'background 0.2s' }} className="hover-bg">
                    <div style={{ width: 48, height: 72, background: 'var(--surface-container-high)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                      {m.poster_path && <img src={`${POSTER_BASE}${m.poster_path}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{m.title}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        .hover-bg:hover { background: rgba(255,255,255,0.05); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
