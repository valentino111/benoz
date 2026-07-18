export default function ProjectHub({ collections = [] }) {
  return (
    <main className="project-hub project-hub-museum" id="projectHub" aria-label="Ben Oz collections">
      <div className="museum-hub-inner">
        <header className="museum-hub-header">
          <img
            className="museum-hub-logo"
            src="/assets/brand/ben-oz-logo-gold-transparent.png"
            alt="Ben Oz"
          />
          <p className="museum-hub-name">Ben Oz Digital Gallery</p>
          <p className="museum-hub-label">Collections</p>
        </header>

        <div className="museum-posters">
          {collections.map((collection) => (
            <button
              key={collection.id}
              className={`museum-poster museum-poster-${collection.id}`}
              data-collection-id={collection.id}
              data-project-target={collection.target}
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

        <button className="museum-about-link" data-project-target="story">
          About Ben Oz
        </button>
      </div>
    </main>
  );
}
