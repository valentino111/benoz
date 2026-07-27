import { useEffect, useRef, useState } from 'react';

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
            <button
              key={collection.id}
              className={`museum-poster museum-poster-${collection.id}${leavingId === collection.id ? ' is-selected' : ''}`}
              data-collection-id={collection.id}
              onClick={() => selectCollection(collection.id)}
              style={{
                '--museum-cover': `url(${collection.cover})`,
                '--museum-fallback-cover': `url(${collection.fallbackCover || collection.cover})`,
              }}
              aria-label={`Enter ${collection.title}`}
            >
              <span className="museum-poster-image" aria-hidden="true">
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
          ))}
        </div>

        <a className="museum-about-link" href="/about" onClick={(event) => onNavigate?.('/about', event)}>
          About Ben Oz
        </a>
      </div>
    </main>
  );
}
