import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/movie/HeroBanner';
import MovieRow from '../components/movie/MovieRow';
import movieApi from '../api/movieApi';
import { useAuth } from '../context/AuthContext';

const DEMO_TRENDING = [
  { id: 1, title: 'Interstellar', vote_average: 8.6, release_year: 2014 },
  { id: 2, title: 'Dune: Part Two', vote_average: 8.5, release_year: 2024 },
  { id: 3, title: 'Oppenheimer', vote_average: 8.4, release_year: 2023 },
  { id: 4, title: 'The Batman', vote_average: 7.8, release_year: 2022 },
  { id: 5, title: 'Blade Runner 2049', vote_average: 8.0, release_year: 2017 },
  { id: 6, title: 'Everything Everywhere All at Once', vote_average: 8.1, release_year: 2022 },
  { id: 7, title: 'Top Gun: Maverick', vote_average: 8.3, release_year: 2022 },
  { id: 8, title: 'Avatar: The Way of Water', vote_average: 7.6, release_year: 2022 },
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendRes, topRes] = await Promise.all([
          movieApi.getTrending({ limit: 12 }),
          movieApi.getMovies({ limit: 12 }),
        ]);
        setTrending(trendRes.items || trendRes || []);
        setTopRated(topRes.items || topRes || []);

        if (isAuthenticated) {
          try {
            const recRes = await movieApi.getRecommendations({ top_n: 12 });
            setRecommended(recRes.recommendations || []);
          } catch (err) {
            console.error('[recommendation] Failed to fetch:', err);
            setRecommended([]);
          }
        }
      } catch (err) {
        console.error('[home] Failed to fetch movies:', err);
        setTrending(DEMO_TRENDING);
        setTopRated([...DEMO_TRENDING].reverse());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="fade-in">
      {/* Greeting */}
      <div className="top-bar">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: 'var(--on-surface)' }}>
            {isAuthenticated ? `Welcome back, ${user?.username || 'Curator'} 👋` : 'Welcome to The Curator'}
          </h1>
          <p className="body-md" style={{ marginTop: 4 }}>Your personalized cinema experience</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/search')}
          style={{ gap: 'var(--spacing-2)' }}
        >
          ⌕ Search Movies
        </button>
      </div>

      {/* Hero Banner */}
      <HeroBanner movies={trending} />

      {/* Trending Now */}
      <MovieRow
        title="🔥 Trending Now"
        movies={trending}
        loading={loading}
        cardWidth={180}
      />

      {/* Top Rated */}
      <MovieRow
        title="⭐ Top Rated"
        movies={topRated}
        loading={loading}
        cardWidth={180}
      />

      {/* Personalized Recommendations */}
      {isAuthenticated && (
        <MovieRow
          title="🎯 Recommended for You"
          movies={recommended}
          loading={loading}
          cardWidth={180}
        />
      )}

      {/* CTA for guests */}
      {!isAuthenticated && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(159,255,136,0.08), rgba(0,210,253,0.08))',
          border: '1px solid rgba(159,255,136,0.15)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-10)',
          textAlign: 'center',
          marginTop: 'var(--spacing-8)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, marginBottom: 'var(--spacing-3)' }}>
            Get Personalized Recommendations
          </h2>
          <p className="body-lg" style={{ marginBottom: 'var(--spacing-6)', maxWidth: 480, margin: '0 auto var(--spacing-6)' }}>
            Sign in to unlock AI-powered movie recommendations tailored just for you.
          </p>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/register')}>
              Get Started Free
            </button>
            <button className="btn btn-glass btn-lg" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
