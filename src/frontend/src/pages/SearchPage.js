import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import movieApi from '../api/movieApi';
import MovieCard from '../components/movie/MovieCard';

const DEMO_RESULTS = [
  { id: 1, title: 'Interstellar', vote_average: 8.6, release_year: 2014, genres: ['Sci-Fi', 'Drama'] },
  { id: 2, title: 'Inception', vote_average: 8.8, release_year: 2010, genres: ['Sci-Fi', 'Thriller'] },
  { id: 3, title: 'The Dark Knight', vote_average: 9.0, release_year: 2008, genres: ['Action', 'Crime'] },
  { id: 4, title: 'Dune: Part Two', vote_average: 8.5, release_year: 2024, genres: ['Sci-Fi', 'Adventure'] },
  { id: 5, title: 'Oppenheimer', vote_average: 8.4, release_year: 2023, genres: ['Biography', 'Drama'] },
  { id: 6, title: 'Parasite', vote_average: 8.5, release_year: 2019, genres: ['Thriller', 'Drama'] },
];

const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Documentary'];
const SORT_OPTIONS = [
  { value: 'vote_average', label: '⭐ Top Rated' },
  { value: 'release_year', label: '📅 Newest' },
  { value: 'title', label: '🔤 A–Z' },
  { value: 'popularity', label: '🔥 Popular' },
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [genre, setGenre] = useState('All');
  const [sortBy, setSortBy] = useState('vote_average');
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setSearched(false); setResults([]); return; }
    const timer = setTimeout(() => doSearch(), 500);
    return () => clearTimeout(timer);
  }, [query, genre, sortBy]);

  const doSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = { q: query, sort_by: sortBy, limit: 24 };
      if (genre !== 'All') params.genre = genre;
      const res = await movieApi.searchMovies(params);
      setResults(res.movies || res.items || res || []);
    } catch {
      setResults(DEMO_RESULTS.filter(m => m.title.toLowerCase().includes(query.toLowerCase())));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    doSearch();
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-8)' }}>
        <h1 className="display-md" style={{ marginBottom: 'var(--spacing-2)' }}>
          Discover Films
        </h1>
        <p className="body-lg">Search our curated collection of cinematic masterpieces</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-6)' }}>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: 'var(--spacing-5)', top: '50%', transform: 'translateY(-50%)',
            fontSize: '1.25rem', color: 'var(--on-surface-variant)', pointerEvents: 'none',
          }}>⌕</span>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            placeholder="Search for movies, directors, genres..."
            style={{
              paddingLeft: 'calc(var(--spacing-5) + 1.5rem + var(--spacing-3))',
              paddingRight: 'var(--spacing-20)',
              fontSize: '1.0625rem',
              height: 56,
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(73,72,71,0.4)',
              boxShadow: query ? '0 0 0 2px rgba(0,210,253,0.2)' : 'none',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus(); }}
              style={{
                position: 'absolute', right: 'var(--spacing-5)', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: '1.25rem',
              }}
            >×</button>
          )}
        </div>
      </form>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--spacing-8)', alignItems: 'center', marginBottom: 'var(--spacing-8)', flexWrap: 'wrap' }}>
        {/* Genre chips */}
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', flex: 1 }}>
          {GENRES.map((g) => (
            <button
              key={g}
              id={`genre-${g.toLowerCase()}`}
              onClick={() => setGenre(g)}
              className={`chip ${genre === g ? 'chip-active' : 'chip-default'}`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Sort by */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input-field"
          style={{ width: 'auto', flexShrink: 0, borderRadius: 'var(--radius-full)', paddingTop: 'var(--spacing-2)', paddingBottom: 'var(--spacing-2)' }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Results */}
      {!searched && !query && (
        <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-16)' }}>
          <div style={{ fontSize: '5rem', marginBottom: 'var(--spacing-4)', opacity: 0.3 }}>🎬</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, marginBottom: 'var(--spacing-3)', color: 'var(--on-surface-variant)' }}>
            Start your search
          </h2>
          <p className="body-md">Type a movie title, director name, or genre</p>
        </div>
      )}

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-5)' }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
              <div className="skeleton" style={{ height: 14, marginTop: 10, width: '80%' }} />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && (
        <>
          <div style={{ marginBottom: 'var(--spacing-5)', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            {results.length > 0
              ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
              : `No results found for "${query}"`
            }
          </div>
          {results.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--spacing-5)' }}>
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} width="100%" />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-12)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-4)', opacity: 0.3 }}>🔍</div>
              <p className="body-lg">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
