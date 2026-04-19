import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';


export default function TrailerModal({ trailerId, title, onClose }) {
  const overlayRef = useRef(null);

  
  const handleKeyDown = useCallback(
    (e) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);


  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const renderModal = (content) => createPortal(content, document.body);

  if (!trailerId) {
    return renderModal(
      <div className="trailer-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="trailer-modal">
          <div className="trailer-modal__header">
            <span className="trailer-modal__title">🎬 {title}</span>
            <button className="trailer-modal__close btn btn-icon" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <div className="trailer-modal__no-trailer">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎬</div>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '1.125rem' }}>
              Trailer not available for this movie.
            </p>
          </div>
        </div>
      </div>
    );
  }

  
  const embedUrl =
    `https://www.youtube.com/embed/${trailerId}` +
    `?autoplay=1&rel=0&modestbranding=1&color=white`;

  return renderModal(
    <div
      className="trailer-modal-overlay fade-in"
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      <div className="trailer-modal slide-up">
        {/* Header */}
        <div className="trailer-modal__header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#000', fontSize: '0.875rem', fontWeight: 700,
            }}>▶</span>
            <span className="trailer-modal__title">{title}</span>
          </div>
          <button
            className="trailer-modal__close btn btn-icon"
            onClick={onClose}
            aria-label="Close trailer"
          >
            ✕
          </button>
        </div>

        {/* YouTube Player */}
        <div className="trailer-modal__player-wrap">
          <iframe
            className="trailer-modal__iframe"
            src={embedUrl}
            title={`${title} – Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Footer hint */}
        <div className="trailer-modal__footer">
          <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>
            Press <kbd style={{
              background: 'var(--surface-container-high)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 4, padding: '1px 6px', fontSize: '0.7rem',
            }}>Esc</kbd> or click outside to close
          </span>
        </div>
      </div>
    </div>
  );
}
