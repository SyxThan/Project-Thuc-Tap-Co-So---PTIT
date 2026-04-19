import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import movieApi from '../../api/movieApi';
import { useAuth } from '../../context/AuthContext';
import TrailerModal from './TrailerModal';

const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';


const DEMO_MOVIES = [
  {
    id: 1,
    title: 'Interstellar',
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival in a dying world.",
    backdrop_path: null,
    vote_average: 8.6,
    release_year: 2014,
    genres: ['Sci-Fi', 'Drama'],
    backdropColor: 'linear-gradient(135deg, #0a0a1e 0%, #1a1a3e 50%, #0a0a1e 100%)',
    emoji: '🚀',
  },
  {
    id: 2,
    title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    backdrop_path: null,
    vote_average: 8.5,
    release_year: 2024,
    genres: ['Sci-Fi', 'Adventure'],
    backdropColor: 'linear-gradient(135deg, #1a0a00 0%, #3d1f00 50%, #1a0a00 100%)',
    emoji: '🏜️',
  },
  {
    id: 3,
    title: 'Oppenheimer',
    overview: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    backdrop_path: null,
    vote_average: 8.4,
    release_year: 2023,
    genres: ['Biography', 'Drama'],
    backdropColor: 'linear-gradient(135deg, #1a1a0a 0%, #2a2a1a 50%, #1a1a0a 100%)',
    emoji: '💥',
  },
];

export default function HeroBanner({ movies }) {
  const displayMovies = movies?.length > 0 ? movies.slice(0, 3) : DEMO_MOVIES;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  // Trailer modal state
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerId, setTrailerId] = useState(null);
  const [trailerTitle, setTrailerTitle] = useState('');
  const [watchLoading, setWatchLoading] = useState(false);

  const { isAuthenticated } = useAuth();

  const goTo = useCallback((idx) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 300);
  }, [animating]);

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((current + 1) % displayMovies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current, displayMovies.length, goTo]);

  const movie = displayMovies[current];
  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE}${movie.backdrop_path}` : null;

  const handleWatchNow = async (e) => {
    e.preventDefault();
    if (!movie?.id) return;

    setTrailerTitle(movie.title);

    if (isAuthenticated) {
      setWatchLoading(true);
      try {
        const res = await movieApi.watchMovie(movie.id);
        setTrailerId(res.youtube_trailer_id || null);
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

  return (
    <>
      {/* Trailer Modal */}
      {trailerOpen && (
        <TrailerModal
          trailerId={trailerId}
          title={trailerTitle}
          onClose={() => { setTrailerOpen(false); setTrailerId(null); }}
        />
      )}

      <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', height: 480, marginBottom: 'var(--spacing-10)' }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: movie.backdropColor || 'var(--surface-container)',
          transition: 'all 0.6s ease',
        }}>
          {backdropUrl && (
            <img src={backdropUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
          )}
          {!backdropUrl && movie.emoji && (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12rem', opacity: 0.08 }}>
              {movie.emoji}
            </div>
          )}
        </div>

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(14,14,14,0.97) 0%, rgba(14,14,14,0.7) 45%, rgba(14,14,14,0.1) 100%), linear-gradient(to top, rgba(14,14,14,0.9) 0%, transparent 60%)',
        }} />

        {/* Content */}
        <div className="hero-banner__content" style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          {/* Genre chips */}
          <div style={{ display: 'flex', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-4)', flexWrap: 'wrap' }}>
            {(movie.genres || []).slice(0, 3).map((g, i) => (
              <span key={g.id || g.name || i} className="chip chip-default" style={{ fontSize: '0.6875rem' }}>
                {typeof g === 'string' ? g : (g.name || '')}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="display-lg" style={{ color: '#fff', marginBottom: 'var(--spacing-4)', maxWidth: 600 }}>
            {movie.title}
          </h1>

          {/* Overview */}
          <p className="body-lg" style={{ maxWidth: 520, marginBottom: 'var(--spacing-6)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.overview}
          </p>

          {/* Rating + Year */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
            {movie.vote_average > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
                <span style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>★</span>
                <span style={{ fontWeight: 700, fontSize: '1.125rem', color: '#fff' }}>
                  {Number(movie.vote_average).toFixed(1)}
                </span>
                <span className="body-sm">/10</span>
              </div>
            )}
            {movie.release_year && (
              <span className="chip chip-default">{movie.release_year}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            {/* ▶ Watch Now — opens trailer modal */}
            <button
              onClick={handleWatchNow}
              disabled={watchLoading}
              className="btn btn-primary btn-lg"
              style={{ opacity: watchLoading ? 0.75 : 1, cursor: watchLoading ? 'wait' : 'pointer' }}
            >
              {watchLoading ? (
                <>
                  <span style={{
                    display: 'inline-block', width: 16, height: 16,
                    border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                  }} />
                  Loading...
                </>
              ) : '▶ Watch Now'}
            </button>

            {/* ℹ More Info — goes to detail page */}
            <Link to={`/movie/${movie.id}`} className="btn btn-glass btn-lg">
              ℹ More Info
            </Link>
          </div>
        </div>

        {/* Dots navigation */}
        <div style={{
          position: 'absolute', bottom: 'var(--spacing-6)', right: 'var(--spacing-8)',
          display: 'flex', gap: 'var(--spacing-2)',
        }}>
          {displayMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? 24 : 8,
                height: 8,
                borderRadius: 'var(--radius-full)',
                background: i === current ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
                boxShadow: i === current ? '0 0 8px var(--primary)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
