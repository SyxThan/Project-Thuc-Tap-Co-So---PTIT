import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Sidebar from './components/layout/Sidebar';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import TrendingPage from './pages/TrendingPage';
import DiscoverPage from './pages/DiscoverPage';
import WatchlistPage from './pages/WatchlistPage';
import MovieDetailPage from './pages/MovieDetailPage';
import AllMoviesPage from './pages/AllMoviesPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';

import './index.css';

// Pages that use the sidebar layout
const SIDEBAR_ROUTES = [
  { path: '/', element: <HomePage /> },
  { path: '/movies', element: <AllMoviesPage /> },
  { path: '/search', element: <SearchPage /> },
  { path: '/trending', element: <TrendingPage /> },
  { path: '/discover', element: <DiscoverPage /> },
  { path: '/watchlist', element: <WatchlistPage /> },
  { path: '/movie/:id', element: <MovieDetailPage /> },
];

function AppLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Background light leaks */}
      <div className="light-leak light-leak-1" />
      <div className="light-leak light-leak-2" />
      <div className="light-leak light-leak-3" />

      <Sidebar />

      <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        <Routes>
          {SIDEBAR_ROUTES.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
          {/* Redirect unknown paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages - no sidebar */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Main app with sidebar */}
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
