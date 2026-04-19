import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MovieGrid from '../components/movie/MovieGrid';
import movieApi from '../api/movieApi';

const SORT_OPTIONS = [
  { label: '⭐ Top Rated', value: 'rating' },
  { label: '📅 Recent Releases', value: 'release_date' },
  { label: '📽️ By Title (A-Z)', value: 'title' },
];

export default function AllMoviesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allMovies, setAllMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [selectedSort, setSelectedSort] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const pageSize = 20;

  // Load genres
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await movieApi.getGenres();
        const genresList = (res.genres || res || []).filter(
          (g) => g.id !== 0 && g.name?.toLowerCase() !== 'unknown'
        );
        setGenres(genresList);

        const queryGenreId = Number.parseInt(searchParams.get('genre'), 10);
        if (!Number.isNaN(queryGenreId)) {
          const matchedGenre = genresList.find((g) => Number(g.id) === queryGenreId);
          if (matchedGenre) {
            setSelectedGenre(matchedGenre);
          }
        }
      } catch (err) {
        console.error('[AllMovies] Failed to load genres:', err);
      }
    };
    fetchGenres();
  }, [searchParams]);

  // Load movies based on filters
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setPage(0);
      try {
        let result;
        
        if (searchQuery) {
          // Search by term
          result = await movieApi.searchMovies({ 
            q: searchQuery, 
            limit: pageSize, 
            offset: 0 
          });
        } else if (selectedGenre) {
          // Filter by genre
          result = await movieApi.getGenreMoviesAll(selectedGenre.id, {
            sort_by: selectedSort,
            limit: pageSize, 
            offset: 0 
          });
        } else {
          // All movies with sorting
          result = await movieApi.getAllMovies({ 
            sort_by: selectedSort,
            limit: pageSize, 
            offset: 0 
          });
        }

        const items = result.items || result.movies || [];
        setAllMovies(items);
        setFilteredMovies(items);
        setHasMore(items.length === pageSize);
      } catch (err) {
        console.error('[AllMovies] Failed to load movies:', err);
        setFilteredMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [selectedGenre, selectedSort, searchQuery]);

  // Load more movies (infinite scroll)
  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const offset = (page + 1) * pageSize;
      let result;

      if (searchQuery) {
        result = await movieApi.searchMovies({ 
          q: searchQuery, 
          limit: pageSize, 
          offset 
        });
      } else if (selectedGenre) {
        result = await movieApi.getGenreMoviesAll(selectedGenre.id, {
          sort_by: selectedSort,
          limit: pageSize, 
          offset 
        });
      } else {
        result = await movieApi.getAllMovies({ 
          sort_by: selectedSort,
          limit: pageSize, 
          offset 
        });
      }

      const items = result.items || result.movies || [];
      if (items.length > 0) {
        setFilteredMovies(prev => [...prev, ...items]);
        setPage(page + 1);
        setHasMore(items.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[AllMovies] Failed to load more:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id || movie.movie_id}`);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedGenre(null); // Clear genre filter when searching
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('genre');
      next.delete('genreName');
      return next;
    });
  };

  const handleGenreSelect = (genre) => {
    const nextGenre = selectedGenre?.id === genre.id ? null : genre;
    setSelectedGenre(nextGenre);
    setSearchQuery(''); 
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (nextGenre) {
        next.set('genre', String(nextGenre.id));
        next.set('genreName', nextGenre.name);
      } else {
        next.delete('genre');
        next.delete('genreName');
      }
      return next;
    });
  };

  const handleSortChange = (sortValue) => {
    setSelectedSort(sortValue);
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        marginBottom: 'var(--spacing-10)',
      }}>
        <h1 className="display-md" style={{ marginBottom: 'var(--spacing-2)' }}>
          🎬 All Movies
        </h1>
        <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
          Explore our complete film library
        </p>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: 'var(--spacing-6)',
        display: 'flex',
        gap: 'var(--spacing-3)',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface-container)',
          borderRadius: 'var(--radius-full)',
          paddingLeft: 'var(--spacing-4)',
          border: '1px solid var(--outline)',
        }}>
          <span style={{ color: 'var(--on-surface-variant)' }}>🔍</span>
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={handleSearch}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              paddingLeft: 'var(--spacing-3)',
              padding: 'var(--spacing-3) var(--spacing-4)',
              fontSize: '0.95rem',
              color: 'var(--on-surface)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Filters Section */}
      <div style={{
        marginBottom: 'var(--spacing-8)',
      }}>
        {/* Sort Options */}
        <div style={{
          marginBottom: 'var(--spacing-4)',
        }}>
          <p className="label-md" style={{
            marginBottom: 'var(--spacing-2)',
            color: 'var(--on-surface-variant)',
          }}>
            Sort by
          </p>
          <div style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            flexWrap: 'wrap',
          }}>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius-full)',
                  background: selectedSort === option.value
                    ? 'rgba(159, 255, 136, 0.15)'
                    : 'var(--surface-container)',
                  border: selectedSort === option.value
                    ? '1px solid rgba(159, 255, 136, 0.3)'
                    : '1px solid rgba(73, 72, 71, 0.2)',
                  color: selectedSort === option.value
                    ? 'var(--primary)'
                    : 'var(--on-surface)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: selectedSort === option.value ? 600 : 400,
                  transition: 'all var(--transition-smooth)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        {genres.length > 0 && (
          <div>
            <p className="label-md" style={{
              marginBottom: 'var(--spacing-2)',
              color: 'var(--on-surface-variant)',
            }}>
              Filter by genre
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 'var(--spacing-2)',
            }}>
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreSelect(genre)}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-3)',
                    borderRadius: 'var(--radius-lg)',
                    background: selectedGenre?.id === genre.id
                      ? 'rgba(0, 210, 253, 0.15)'
                      : 'var(--surface-container)',
                    border: selectedGenre?.id === genre.id
                      ? '1px solid rgba(0, 210, 253, 0.3)'
                      : '1px solid rgba(73, 72, 71, 0.2)',
                    color: selectedGenre?.id === genre.id
                      ? 'var(--primary)'
                      : 'var(--on-surface)',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: selectedGenre?.id === genre.id ? 600 : 400,
                    transition: 'all var(--transition-smooth)',
                    textAlign: 'center',
                  }}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Filters Display */}
      {(selectedGenre || searchQuery) && (
        <div style={{
          marginBottom: 'var(--spacing-4)',
          padding: 'var(--spacing-3) var(--spacing-4)',
          background: 'rgba(159, 255, 136, 0.1)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(159, 255, 136, 0.2)',
        }}>
          <p className="label-md">
            Active Filters:{' '}
            {searchQuery && <span>Search: <strong>"{searchQuery}"</strong></span>}
            {selectedGenre && <span>{selectedGenre.name}</span>}
            {(selectedGenre || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedGenre(null);
                  setSearchQuery('');
                }}
                style={{
                  marginLeft: 'var(--spacing-2)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Clear
              </button>
            )}
          </p>
        </div>
      )}

      {/* Movies Grid */}
      <MovieGrid
        movies={filteredMovies}
        loading={loading && page === 0}
        cardWidth={165}
        onMovieClick={handleMovieClick}
        emptyMessage={
          searchQuery
            ? `No movies found for "${searchQuery}"`
            : 'No movies found for this filter'
        }
      />

      {/* Load More Button */}
      {hasMore && filteredMovies.length > 0 && (
        <div style={{
          marginTop: 'var(--spacing-10)',
          textAlign: 'center',
        }}>
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="btn btn-primary"
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Loading...' : '📥 Load More'}
          </button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && filteredMovies.length > 0 && (
        <div style={{
          marginTop: 'var(--spacing-10)',
          textAlign: 'center',
          color: 'var(--on-surface-variant)',
          paddingBottom: 'var(--spacing-10)',
        }}>
          <p className="body-md">✨ End of results</p>
        </div>
      )}
    </div>
  );
}
