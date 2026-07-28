import { useEffect, useRef, useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

function clampZoom(value) {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
}

function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

export default function ArtworkLightbox({
  language,
  onClose,
  onSelect,
  selection,
}) {
  const closeButtonRef = useRef(null);
  const lightboxRef = useRef(null);
  const openerRef = useRef(null);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(1);
  const pinching = useRef(false);
  const swipeStartX = useRef(0);
  const [imageSrc, setImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const open = Boolean(selection);
  const works = selection?.works || [];
  const currentIndex = selection?.index || 0;
  const currentWork = works[currentIndex] || null;

  function showRelative(offset) {
    if (!works.length) return;
    onSelect((currentIndex + offset + works.length) % works.length);
  }

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = selection.opener || document.activeElement;
    const interactionRoots = ['entry', 'site', 'projectHub']
      .map((id) => document.getElementById(id))
      .filter(Boolean);
    const previousInert = interactionRoots.map((element) => element.inert);
    interactionRoots.forEach((element) => { element.inert = true; });
    document.body.classList.add('locked', 'lightbox-open');
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const closeForNavigation = () => onClose();

    window.addEventListener('pagehide', closeForNavigation);
    window.addEventListener('popstate', closeForNavigation);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('pagehide', closeForNavigation);
      window.removeEventListener('popstate', closeForNavigation);
      interactionRoots.forEach((element, index) => {
        element.inert = previousInert[index];
      });
      document.body.classList.remove('lightbox-open');
      document.body.classList.toggle(
        'locked',
        document.getElementById('entry')?.classList.contains('active'),
      );
      if (openerRef.current?.isConnected) openerRef.current.focus?.();
      openerRef.current = null;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showRelative(-1);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showRelative(1);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...lightboxRef.current.querySelectorAll(
        'button:not([disabled]),[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])',
      )];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, onClose, open, works.length]);

  useEffect(() => {
    setZoom(1);
    pinching.current = false;
    if (!currentWork) {
      setImageSrc('');
      return undefined;
    }

    const previewSrc = currentWork.thumbnail || currentWork.image;
    const fullSrc = currentWork.image || previewSrc;
    setImageSrc(previewSrc);
    if (!fullSrc || fullSrc === previewSrc) return undefined;

    let active = true;
    const detailImage = new Image();
    detailImage.decoding = 'async';
    detailImage.src = fullSrc;
    const decoded = typeof detailImage.decode === 'function'
      ? detailImage.decode()
      : new Promise((resolve, reject) => {
        detailImage.onload = resolve;
        detailImage.onerror = reject;
      });
    decoded
      .then(() => {
        if (active) setImageSrc(fullSrc);
      })
      .catch(() => {});

    return () => {
      active = false;
      detailImage.onload = null;
      detailImage.onerror = null;
      detailImage.removeAttribute('src');
    };
  }, [currentWork]);

  const imageAlt = currentWork
    ? (language === 'he' ? currentWork.titleHe : currentWork.titleEn)
    : '';

  return (
    <div
      aria-hidden={!open}
      aria-label="Artwork viewer"
      aria-modal="true"
      className={`lightbox${open ? ' open' : ''}`}
      id="lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={lightboxRef}
      role="dialog"
    >
      <button
        aria-label="Close artwork viewer"
        className="close"
        onClick={onClose}
        ref={closeButtonRef}
        type="button"
      >
        ×
      </button>
      <button
        aria-label="Previous artwork"
        className="prev"
        onClick={() => showRelative(-1)}
        type="button"
      >
        ‹
      </button>
      <div
        className="lb-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget && zoom <= 1.01) onClose();
        }}
        onContextMenu={(event) => event.preventDefault()}
        onDragStart={(event) => event.preventDefault()}
        onTouchCancel={() => { pinching.current = false; }}
        onTouchEnd={(event) => {
          if (pinching.current) {
            if (event.touches.length < 2) pinching.current = false;
            return;
          }
          if (event.changedTouches.length !== 1 || zoom > 1.01) return;
          const dx = event.changedTouches[0].clientX - swipeStartX.current;
          if (Math.abs(dx) > 55) showRelative(dx < 0 ? 1 : -1);
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 2) return;
          if (!pinching.current) {
            pinching.current = true;
            pinchStartDistance.current = touchDistance(event.touches);
            pinchStartZoom.current = zoom;
          }
          const distance = touchDistance(event.touches);
          if (pinchStartDistance.current > 0) {
            setZoom(clampZoom(
              pinchStartZoom.current * (distance / pinchStartDistance.current),
            ));
          }
        }}
        onTouchStart={(event) => {
          if (event.touches.length === 2) {
            pinching.current = true;
            pinchStartDistance.current = touchDistance(event.touches);
            pinchStartZoom.current = zoom;
            return;
          }
          if (event.touches.length === 1) {
            pinching.current = false;
            swipeStartX.current = event.touches[0].clientX;
          }
        }}
        onWheel={(event) => {
          event.preventDefault();
          setZoom((value) => clampZoom(value + (event.deltaY < 0 ? 0.15 : -0.15)));
        }}
      >
        {currentWork && imageSrc && (
          <img
            alt={imageAlt}
            decoding="async"
            draggable={false}
            onDoubleClick={() => setZoom((value) => (value === 1 ? 2 : 1))}
            src={imageSrc}
            style={{
              cursor: zoom > 1 ? 'zoom-out' : 'zoom-in',
              transform: `scale(${zoom})`,
            }}
          />
        )}
      </div>
      <div className="lb-toolbar">
        <button
          aria-label="Zoom out"
          className="zoom-out"
          onClick={() => setZoom((value) => clampZoom(value - 0.25))}
          type="button"
        >
          −
        </button>
        <span className="lb-count">{works.length ? `${currentIndex + 1} / ${works.length}` : ''}</span>
        <button
          aria-label="Zoom in"
          className="zoom-in"
          onClick={() => setZoom((value) => clampZoom(value + 0.25))}
          type="button"
        >
          +
        </button>
        <button
          aria-label="Reset zoom"
          className="zoom-reset"
          onClick={() => setZoom(1)}
          type="button"
        >
          {Math.round(zoom * 100)}%
        </button>
      </div>
      <button
        aria-label="Next artwork"
        className="next"
        onClick={() => showRelative(1)}
        type="button"
      >
        ›
      </button>
    </div>
  );
}
