import { useEffect, useRef, useState } from 'react';

const EXHIBITION_COVER_ANIMATION = '/assets/ExhibitionCoverAnimation.MP4';

function CollectionPoster({ active, collection, leavingId, onSelect }) {
  const videoRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressStart = useRef(null);
  const suppressNextClick = useRef(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const hasAnimation = collection.id === 'exhibition';

  function clearLongPress() {
    window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    longPressStart.current = null;
  }

  function stopPreview() {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPreviewPlaying(false);
  }

  function startPreview() {
    const video = videoRef.current;
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    video.currentTime = 0;
    const playback = video.play();
    playback?.catch(() => setPreviewPlaying(false));
  }

  useEffect(() => {
    if (!hasAnimation || !active) {
      clearLongPress();
      stopPreview();
      return undefined;
    }

    return () => {
      clearLongPress();
      stopPreview();
    };
  }, [active, hasAnimation]);

  function isTouchPreview() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  function handlePointerDown(event) {
    if (!hasAnimation || !isTouchPreview() || event.button !== 0) return;
    clearLongPress();
    longPressStart.current = { x: event.clientX, y: event.clientY };
    longPressTimer.current = window.setTimeout(() => {
      suppressNextClick.current = true;
      startPreview();
      longPressTimer.current = null;
    }, 550);
  }

  function handlePointerMove(event) {
    const start = longPressStart.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) clearLongPress();
  }

  function handlePointerEnd() {
    clearLongPress();
  }

  function handlePointerCancel() {
    clearLongPress();
    suppressNextClick.current = false;
    stopPreview();
  }

  function handleClick(event) {
    if (suppressNextClick.current) {
      event.preventDefault();
      suppressNextClick.current = false;
      return;
    }
    onSelect(collection.id);
  }

  return (
    <button
      className={`museum-poster museum-poster-${collection.id}${leavingId === collection.id ? ' is-selected' : ''}`}
      data-collection-id={collection.id}
      onBlur={stopPreview}
      onClick={handleClick}
      onContextMenu={(event) => {
        if (isTouchPreview()) event.preventDefault();
      }}
      onFocus={() => {
        if (!isTouchPreview()) startPreview();
      }}
      onMouseEnter={() => {
        if (!isTouchPreview()) startPreview();
      }}
      onMouseLeave={() => {
        if (!isTouchPreview()) stopPreview();
      }}
      onPointerCancel={handlePointerCancel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      style={{
        '--museum-cover': `url(${collection.cover})`,
        '--museum-fallback-cover': `url(${collection.fallbackCover || collection.cover})`,
      }}
      aria-label={`Enter ${collection.title}`}
    >
      <span className="museum-poster-image" aria-hidden="true">
        {hasAnimation && (
          <video
            className={`museum-poster-video${previewPlaying ? ' is-playing' : ''}`}
            muted
            onEnded={stopPreview}
            onError={stopPreview}
            onPlay={() => setPreviewPlaying(true)}
            playsInline
            preload="metadata"
            ref={videoRef}
          >
            <source src={EXHIBITION_COVER_ANIMATION} type="video/mp4" />
          </video>
        )}
        <span className="museum-poster-enter">Enter collection</span>
      </span>
      <span className="museum-poster-caption">
        <span className="museum-poster-title">{collection.title}</span>
        {collection.titleHe && (
          <span className="museum-poster-title-he" lang="he" dir="rtl">{collection.titleHe}</span>
        )}
        <span className="museum-poster-type">{collection.type}</span>
      </span>
    </button>
  );
}

export default function ProjectHub({ active = false, collections = [], onNavigate, onSelect }) {
  const [leavingId, setLeavingId] = useState('');
  const transitionTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  function selectCollection(collectionId) {
    if (leavingId) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onSelect?.(collectionId);
      return;
    }

    setLeavingId(collectionId);
    transitionTimer.current = window.setTimeout(() => {
      setLeavingId('');
      onSelect?.(collectionId);
    }, 520);
  }

  return (
    <main
      aria-label="Ben Oz collections"
      className={`project-hub project-hub-museum${active ? ' active' : ''}${leavingId ? ' is-leaving' : ''}`}
      hidden={!active}
      id="projectHub"
      tabIndex="-1"
    >
      <div className="museum-hub-inner">
        <header className="museum-hub-header">
          <a
            aria-label="Return to Ben Oz hero"
            className="museum-hub-home"
            href="/"
            onClick={(event) => onNavigate?.('/', event)}
          >
            <img
              alt="Ben Oz"
              className="museum-hub-logo"
              decoding="async"
              height="1254"
              src="/assets/brand/ben-oz-logo-gold-transparent.png"
              width="1254"
            />
          </a>
          <p className="museum-hub-name">Ben Oz Digital Gallery</p>
          <p className="museum-hub-label">Collections</p>
        </header>

        <div className="museum-posters">
          {collections.map((collection) => (
            <CollectionPoster
              active={active}
              collection={collection}
              key={collection.id}
              leavingId={leavingId}
              onSelect={selectCollection}
            />
          ))}
        </div>

        <a className="museum-about-link" href="/about" onClick={(event) => onNavigate?.('/about', event)}>
          About Ben Oz
        </a>
      </div>
    </main>
  );
}
