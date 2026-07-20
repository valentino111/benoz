export default function EntryScreen({ loading = false, active = true, onEnter }) {
  return (
    <>
      <a className="skip-link" hidden={!active || loading} href="#projectHub" onClick={onEnter}>Skip to collections</a>
      <div aria-hidden="true" className="museum-loader" id="museumLoader">
        <div className="loader-inner">
          <div className="loader-name">BEN OZ</div>
          <div className="loader-sub">Digital Gallery</div>
          <div className="loader-line" />
        </div>
      </div>
      <section className="entry" hidden={!active} id="entry">
        <div aria-hidden="true" className="entry-visual" />
        <div aria-hidden="true" className="entry-overlay" />
        <div className="entry-inner">
          <img
            alt="Ben Oz Digital Gallery"
            className="official-logo logo-shimmer"
            decoding="async"
            fetchPriority="high"
            height="1254"
            src="assets/brand/ben-oz-logo-gold-transparent.png"
            width="1254"
          />
          <div className="role">Artist</div>
          <div className="tagline">One Idea, Many Forms</div>
          <button
            aria-describedby={loading ? 'galleryLoadingStatus' : undefined}
            className="enter"
            disabled={loading}
            id="enterBtn"
            onClick={onEnter}
          >
            Enter Gallery
          </button>
        </div>
      </section>
      {loading && <p className="sr-only" id="galleryLoadingStatus" role="status">Loading gallery content</p>}
    </>
  );
}
