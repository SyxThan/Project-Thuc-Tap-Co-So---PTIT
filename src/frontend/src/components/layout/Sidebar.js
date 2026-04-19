import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/',        icon: '⊞',  label: 'Home',      exact: true },
  { to: '/movies',  icon: '▦',  label: 'All Movies' },
  { to: '/discover', icon: '◈', label: 'Discover' },
  { to: '/search',  icon: '⌕',  label: 'Search' },
  { to: '/trending', icon: '↑', label: 'Trending' },
  { to: '/watchlist', icon: '♥', label: 'Watchlist' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="nav-sidebar">
      {/* Logo */}
      <div className="nav-logo">
        <span style={{ fontSize: '1.5rem' }}>◈</span>
        <div>
          <div className="logo-text" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>
            The Curator
          </div>
          <span>Premium Screening</span>
        </div>
      </div>

      {/* Nav Items */}
      <div style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon" style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* User Profile */}
      <div style={{ marginTop: 'auto' }}>
        <div className="divider" />
        {user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
            <NavLink
              to="/profile"
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: '#000', flexShrink: 0
              }}>
                {(user.full_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.full_name || user.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>Cinema Curator</div>
              </div>
            </NavLink>
            <button
              onClick={handleLogout}
              className="nav-item btn-ghost"
              style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <span className="nav-icon">⏻</span>
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="nav-item">
            <span className="nav-icon">→</span>
            <span>Sign In</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
