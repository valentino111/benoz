import { Fragment } from 'react';

function TextLines({ text, title = false }) {
  return String(text || '').split('\n').filter(Boolean).map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {title && index > 0 && <br />}
      {title ? line : <span>{line}</span>}
    </Fragment>
  ));
}

function HeroMedia({ collection }) {
  if (collection.posterVideo) {
    return (
      <video
        aria-label={collection.heroImageAlt || collection.title}
        autoPlay
        className="hero-logo logo-shimmer parallax-item"
        loop
        muted
        playsInline
        poster={collection.heroImage || collection.cover}
        src={collection.posterVideo}
      />
    );
  }

  if (!collection.heroImage && !collection.cover) return null;
  return (
    <img
      alt={collection.heroImageAlt || collection.title}
      className="hero-logo logo-shimmer parallax-item"
      src={collection.heroImage || collection.cover}
    />
  );
}

export default function HeroSection({ collection }) {
  const titleEn = collection.subtitleEn || collection.title;
  const titleHe = collection.subtitleHe || collection.titleHe;

  return (
    <>
      <section className="hero fade" id={collection.pageId}>
        <div>
          <HeroMedia collection={collection} />
          <h1 className="parallax-item" id={`collection-title-${collection.id}`} tabIndex="-1">
            {titleHe && <span data-lang="he" lang="he" dir="rtl"><TextLines text={titleHe} title /></span>}
            {titleEn && <span data-lang="en" lang="en" dir="ltr"><TextLines text={titleEn} title /></span>}
          </h1>
          {(collection.description || collection.descriptionHe) && (
            <div className="manifesto parallax-item">
              {collection.descriptionHe && <div data-lang="he" lang="he" dir="rtl"><TextLines text={collection.descriptionHe} /></div>}
              {collection.description && <div data-lang="en" lang="en" dir="ltr"><TextLines text={collection.description} /></div>}
            </div>
          )}
        </div>
      </section>
      {(collection.noteEn || collection.noteHe) && (
        <div className="exhibition-note fade">
          {collection.noteHe && <span data-lang="he" lang="he" dir="rtl">{collection.noteHe}</span>}
          {collection.noteEn && <span data-lang="en" lang="en" dir="ltr">{collection.noteEn}</span>}
        </div>
      )}
    </>
  );
}
