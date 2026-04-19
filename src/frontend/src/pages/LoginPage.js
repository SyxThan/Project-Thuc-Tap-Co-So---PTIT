import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', full_name: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.detail || err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({ email: form.email, password: form.password, full_name: form.full_name });
      navigate('/onboarding');
    } catch (err) {
      setError(err.detail || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background light leaks */}
      <div className="light-leak light-leak-1" />
      <div className="light-leak light-leak-2" />

      {/* Decorative film strip pattern */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
        background: 'linear-gradient(to left, rgba(14,14,14,0) 0%, rgba(14,14,14,1) 100%)',
        zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 82px)',
        zIndex: 0,
      }} />

      {/* Form Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 440,
        margin: 'var(--spacing-6)',
        animation: 'fadeIn 0.5s ease both',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-8)' }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800,
            color: 'var(--primary)', letterSpacing: '-0.03em',
          }}>
            ◈ The Curator
          </div>
          <div className="body-md" style={{ marginTop: 4 }}>Premium Screening · Personalized Cinema</div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', background: 'var(--surface-container)', borderRadius: 'var(--radius-xl)',
          padding: 4, marginBottom: 'var(--spacing-6)',
        }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); }}
              style={{
                flex: 1, padding: 'var(--spacing-3)', borderRadius: 'calc(var(--radius-xl) - 4px)',
                background: tab === t ? 'var(--surface-container-highest)' : 'transparent',
                color: tab === t ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                fontWeight: 600, fontSize: '0.9375rem',
                border: 'none', cursor: 'pointer', transition: 'all var(--transition-fast)',
                boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: 'rgba(26,25,25,0.8)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(73,72,71,0.4)',
          borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-8)',
        }}>
          <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
            <div style={{ marginBottom: 'var(--spacing-4)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-2)' }}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>

            {tab === 'register' && (
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-2)' }}>
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div style={{ marginBottom: tab === 'register' ? 'var(--spacing-4)' : 'var(--spacing-6)' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-2)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            {tab === 'register' && (
              <div style={{ marginBottom: 'var(--spacing-6)' }}>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--on-surface-variant)', marginBottom: 'var(--spacing-2)' }}>
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,115,81,0.1)',
                border: '1px solid rgba(255,115,81,0.3)',
                color: 'var(--error)',
                fontSize: '0.875rem',
                marginBottom: 'var(--spacing-4)',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              id={tab === 'login' ? 'btn-login' : 'btn-register'}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '...' : tab === 'login' ? '→ Enter the Cinema' : '✦ Create Account'}
            </button>
          </form>

          {tab === 'login' && (
            <p style={{ textAlign: 'center', marginTop: 'var(--spacing-4)', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
              New here?{' '}
              <button onClick={() => setTab('register')} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>
                Create a free account
              </button>
            </p>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 'var(--spacing-6)', fontSize: '0.75rem', color: 'var(--outline)' }}>
          By continuing, you agree to our{' '}
          <Link to="/terms" style={{ color: 'var(--on-surface-variant)' }}>Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" style={{ color: 'var(--on-surface-variant)' }}>Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
