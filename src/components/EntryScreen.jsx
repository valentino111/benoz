import { useEffect, useRef, useState } from 'react';

export default function EntryScreen({ loading = false, active = true, onEnter }) {
  const heroVideoRef = useRef(null);
  const [heroPlaying, setHeroPlaying] = useState(false);
  const [loaderHidden, setLoaderHidden] = useState(false);

  useEffect(() => {
    if (loading) {
      setLoaderHidden(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setLoaderHidden(true), 1200);
    return () => window.clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (active) return;
    const video = heroVideoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setHeroPlaying(false);
  }, [active]);

  function playHeroAnimation() {
    const video = heroVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const playback = video.play();
    playback?.catch(() => setHeroPlaying(false));
  }

  function resetHeroAnimation() {
    const video = heroVideoRef.current;
    if (video) video.currentTime = 0;
    setHeroPlaying(false);
  }

  function handleEntryInteraction(event) {
    if (event.target.closest('a, button')) return;
    playHeroAnimation();
  }

  function handleEnter(event) {
    setLoaderHidden(true);
    onEnter?.(event);
  }

  return (
    <>
      <a className="skip-link" hidden={!active || loading} href="#projectHub" onClick={handleEnter}>Skip to collections</a>
      <div aria-hidden="true" className={`museum-loader${loaderHidden ? ' is-hidden' : ''}`} id="museumLoader">
        <div className="loader-inner">
          <div className="loader-name">BEN OZ</div>
          <div className="loader-sub">Digital Gallery</div>
          <div className="loader-line" />
        </div>
      </div>
      <section
        className={`entry${heroPlaying ? ' is-hero-playing' : ''}`}
        hidden={!active}
        id="entry"
        onClick={handleEntryInteraction}
      >
        <button
          aria-label="Play Ben Oz hero animation"
          className="entry-visual"
          onClick={playHeroAnimation}
          type="button"
        >
          <video
            aria-hidden="true"
            className={`entry-visual-video${heroPlaying ? ' is-playing' : ''}`}
            onEnded={resetHeroAnimation}
            onError={resetHeroAnimation}
            onPause={() => setHeroPlaying(false)}
            onPlay={() => setHeroPlaying(true)}
            playsInline
            preload="metadata"
            ref={heroVideoRef}
          >
            <source
              media="(max-width: 700px) and (orientation: portrait)"
              src="/assets/BenOzHero-mobile.mp4?v=2"
              type="video/mp4"
            />
            <source src="/assets/BenOzHero.MP4" type="video/mp4" />
          </video>
        </button>
        <div aria-hidden="true" className="entry-overlay" />
        <div className="entry-inner">
          <h1 className="sr-only">Ben Oz — Contemporary Digital Artist and Music Creator</h1>
          <img
            alt="Ben Oz Digital Gallery"
            className="official-logo logo-shimmer"
            decoding="async"
            fetchPriority="high"
            height="1254"
            src="assets/brand/ben-oz-logo-gold-transparent.png"
            width="1254"
          />
          <div className="entry-callout">
            <div className="role">Artist</div>
            <div className="tagline">One Idea, Many Forms</div>
            <button
              aria-describedby={loading ? 'galleryLoadingStatus' : undefined}
              className="enter"
              disabled={loading}
              id="enterBtn"
              onClick={handleEnter}
            >
              Enter Gallery
            </button>
          </div>
        </div>
      </section>
      {loading && <p className="sr-only" id="galleryLoadingStatus" role="status">Loading gallery content</p>}
    </>
  );
}
