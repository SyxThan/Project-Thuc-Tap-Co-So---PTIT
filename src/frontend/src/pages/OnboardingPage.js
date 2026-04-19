import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/authApi';
import movieApi from '../api/movieApi';

const GENRE_EMOJIS = {
  Action: '💥',
  Adventure: '🗺️',
  Animation: '✨',
  Comedy: '😄',
  Crime: '🕵️',
  Documentary: '📹',
  Drama: '🎭',
  Fantasy: '🧙',
  Horror: '👻',
  Romance: '❤️',
  'Sci-Fi': '🚀',
  Thriller: '🔪',
};

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [step, setStep] = useState(1); // 1=genres, 2=done

  useEffect(() => {
    let mounted = true;

    const fetchGenres = async () => {
      try {
        const res = await movieApi.getGenres();
        const items = res?.genres || [];
        if (mounted) {
          setGenres(items);
        }
      } catch (error) {
        if (mounted) {
          setGenres([]);
        }
      } finally {
        if (mounted) {
          setGenresLoading(false);
        }
      }
    };

    fetchGenres();

    return () => {
      mounted = false;
    };
  }, []);

  const toggleGenre = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = async () => {
    if (step === 1) {
      try {
        await authApi.updatePreferences({ genre_ids: [...selected] });
      } catch (error) {
        return;
      }
      setStep(2);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--background)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 'var(--spacing-6)',
    }}>
      <div className="light-leak light-leak-1" />
      <div className="light-leak light-leak-3" />

      <div style={{ maxWidth: 640, width: '100%', position: 'relative', zIndex: 1 }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-8)' }}>
          {[1, 2].map((s) => (
            <div key={s} style={{
              width: s === step ? 24 : 8, height: 8,
              borderRadius: 'var(--radius-full)',
              background: s <= step ? 'var(--primary)' : 'var(--surface-container-high)',
              transition: 'all var(--transition-smooth)',
              boxShadow: s === step ? '0 0 8px var(--primary)' : 'none',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-4)' }}>🎭</div>
              <h1 className="display-md" style={{ marginBottom: 'var(--spacing-3)' }}>
                What do you love to watch?
              </h1>
              <p className="body-lg">
                Select at least 3 genres to personalize your recommendations
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-8)' }}>
              {genresLoading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
                  Loading genres...
                </div>
              ) : (
                genres.map((g) => {
                const isSelected = selected.has(g.id);
                const icon = GENRE_EMOJIS[g.name] || '🎬';
                return (
                  <button
                    key={g.id}
                    id={`onboard-genre-${g.id}`}
                    onClick={() => toggleGenre(g.id)}
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, rgba(159,255,136,0.2), rgba(0,210,253,0.1))'
                        : 'var(--surface-container)',
                      border: isSelected ? '2px solid rgba(159,255,136,0.5)' : '2px solid transparent',
                      borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-5)',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all var(--transition-smooth)',
                      transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 16px rgba(159,255,136,0.15)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>{icon}</div>
                    <div style={{
                      fontSize: '0.875rem', fontWeight: 600,
                      color: isSelected ? 'var(--primary)' : 'var(--on-surface)',
                    }}>{g.name}</div>
                  </button>
                );
                })
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <button
                id="btn-onboard-continue"
                onClick={handleContinue}
                disabled={selected.size < 3}
                className="btn btn-primary btn-lg"
                style={{ opacity: selected.size < 3 ? 0.5 : 1 }}
              >
                Continue ({selected.size} selected)
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-ghost"
                style={{ display: 'block', margin: 'var(--spacing-4) auto 0', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '5rem', marginBottom: 'var(--spacing-6)', animation: 'neonPulse 2s infinite' }}>✦</div>
            <h1 className="display-md" style={{ marginBottom: 'var(--spacing-4)' }}>
              You're all set, {user?.username || 'Curator'}!
            </h1>
            <p className="body-lg" style={{ marginBottom: 'var(--spacing-8)', maxWidth: 400, margin: '0 auto var(--spacing-8)' }}>
              We've curated your personal screening room. Your recommendations are ready.
            </p>
            <button
              id="btn-enter-cinema"
              onClick={handleContinue}
              className="btn btn-primary btn-lg"
              style={{ margin: '0 auto' }}
            >
              Enter the Cinema →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
