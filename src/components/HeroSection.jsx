import { Fragment } from 'react';
import { getCollectionHeroModel } from '../data/collectionPresentation.js';

function TextLines({ text, title = false }) {
  return String(text || '').split('\n').filter(Boolean).map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {title && index > 0 && <br />}
      {title ? line : <span>{line}</span>}
    </Fragment>
  ));
}

function HeroLogo({ alt, src }) {
  return (
    <img
      alt={alt}
      className="hero-logo logo-shimmer parallax-item"
      src={src}
    />
  );
}

export default function HeroSection({ collection }) {
  const hero = getCollectionHeroModel(collection);

  return (
    <>
      <section className="hero fade" id={collection.pageId}>
        <div>
          <HeroLogo alt={hero.logoAlt} src={hero.logoSrc} />
          <h1 className="parallax-item" id={`collection-title-${collection.id}`} tabIndex="-1">
            {hero.he.title && <span data-lang="he" lang={hero.he.language} dir={hero.he.direction}><TextLines text={hero.he.title} title /></span>}
            {hero.en.title && <span data-lang="en" lang={hero.en.language} dir={hero.en.direction}><TextLines text={hero.en.title} title /></span>}
          </h1>
          {(hero.en.intro || hero.he.intro) && (
            <div className="manifesto parallax-item">
              {hero.he.intro && <div data-lang="he" lang={hero.he.language} dir={hero.he.direction}><TextLines text={hero.he.intro} /></div>}
              {hero.en.intro && <div data-lang="en" lang={hero.en.language} dir={hero.en.direction}><TextLines text={hero.en.intro} /></div>}
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
