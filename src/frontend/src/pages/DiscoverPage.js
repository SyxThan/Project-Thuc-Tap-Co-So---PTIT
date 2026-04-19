import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieRow from '../components/movie/MovieRow';
import movieApi from '../api/movieApi';

const GENRE_ICONS = {
  'Action': '💥', 'Comedy': '😄', 'Drama': '🎭', 'Horror': '👻',
  'Romance': '❤️', 'Sci-Fi': '🚀', 'Thriller': '🔪', 'Animation': '✨',
  'Documentary': '📹', 'Fantasy': '🧙', 'Crime': '🕵️', 'Adventure': '🗺️',
};

export default function DiscoverPage() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genresLoading, setGenresLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await movieApi.getGenres();
        const genreList = (res.genres || res || []).filter(
          (g) => g.id !== 0 && g.name?.toLowerCase() !== 'unknown'
        );
        setGenres(genreList);
        const defaultGenre = genreList[0];
        if (defaultGenre) {
          setSelectedGenre(defaultGenre);
        }
      } catch (err) {
        console.error('[Discover] Failed to load genres:', err);
        const demoGenres = Object.keys(GENRE_ICONS).map((name, i) => ({ id: i + 1, name }));
        setGenres(demoGenres);
        setSelectedGenre(demoGenres[0]);
      } finally {
        setGenresLoading(false);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const genreId = Number.parseInt(selectedGenre.id, 10);
        const res = await movieApi.getByGenre(genreId, { limit: 20 });
        setMovies(res.movies || res.items || []);
      } catch (err) {
        console.error('[Discover] Failed to load movies by genre:', err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [selectedGenre]);

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 className="display-md" style={{ marginBottom: 'var(--spacing-2)' }}>Discover</h1>
        <p className="body-lg">Explore films by genre and find your next favorite</p>
      </div>

      {/* Genre grid selector */}
      {!genresLoading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 'var(--spacing-3)',
          marginBottom: 'var(--spacing-10)',
        }}>
          {genres.map((g, i) => {
            const isSelected = selectedGenre?.id === g.id;
            const icon = GENRE_ICONS[g.name] || '🎬';
            return (
              <button
                key={g.id || g.name || i}
                id={`genre-card-${g.id || i}`}
                onClick={() => {
                  if (selectedGenre?.id === g.id) return;
                  setSelectedGenre(g);
                }}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(159,255,136,0.15), rgba(0,210,253,0.1))'
                    : 'var(--surface-container)',
                  border: isSelected
                    ? '1px solid rgba(159,255,136,0.3)'
                    : '1px solid rgba(73,72,71,0.2)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--spacing-5)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all var(--transition-smooth)',
                  boxShadow: isSelected ? '0 0 16px rgba(159,255,136,0.1)' : 'none',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>{icon}</div>
                <div style={{
                  fontSize: '0.875rem', fontWeight: 600,
                  color: isSelected ? 'var(--primary)' : 'var(--on-surface)',
                }}>
                  {typeof g === 'string' ? g : g.name}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedGenre && (
        <MovieRow
          title={`${GENRE_ICONS[selectedGenre.name] || '🎬'} ${selectedGenre.name} Films`}
          movies={movies}
          loading={loading}
          cardWidth={180}
          onSeeAll={() =>
            navigate(
              `/movies?genre=${selectedGenre.id}&genreName=${encodeURIComponent(selectedGenre.name)}`
            )
          }
        />
      )}
    </div>
  );
}
