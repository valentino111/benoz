function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he" lang="he" dir="rtl">{he}</span>
      <span data-lang="en" lang="en" dir="ltr">{en}</span>
    </>
  );
}

function ArtworkSoundtrack({ song }) {
  if (!song) return null;

  return (
    <div className="artwork-soundtrack">
      <a aria-label={`Listen to ${song.title}`} href={`#${song.domId}`}>
        <span aria-hidden="true" className="soundtrack-icon">▶</span>
        <span>
          <span className="soundtrack-kicker">
            <LanguageText en="Music of the Artwork" he="המוזיקה של היצירה" />
          </span>
          <span className="soundtrack-title">{song.title}</span>
        </span>
        <span aria-hidden="true" className="soundtrack-arrow">↓</span>
      </a>
    </div>
  );
}

function Artwork({ active, work, index, total, songsById }) {
  const isFirstVisibleArtwork = active && index === 0;
  return (
    <section className="artwork fade" data-artwork-slug={work.id} data-collection-id={work.collectionId} data-img={work.image} id={work.id}>
      <div className="art-media">
        <img
          alt={work.titleEn || work.titleHe}
          data-alt-en={work.titleEn}
          data-alt-he={work.titleHe}
          data-full-src={work.image}
          decoding="async"
          fetchPriority={isFirstVisibleArtwork ? 'high' : 'auto'}
          height={work.imageHeight}
          loading={isFirstVisibleArtwork ? 'eager' : 'lazy'}
          src={work.image}
          width={work.imageWidth}
        />
      </div>

      <div className="art-copy">
        <span className="status"><LanguageText en={work.statusEn} he={work.statusHe} /></span>
        <h2><LanguageText en={work.titleEn} he={work.titleHe} /></h2>
        <div className="en-title">{work.titleEn}</div>
        {work.meta && <div className="meta">{work.meta}</div>}
        <p className="desc"><LanguageText en={work.descriptionEn} he={work.descriptionHe} /></p>

        {work.songIds?.map((songId) => <ArtworkSoundtrack key={songId} song={songsById[songId]} />)}

        <div className="collector-summary">
          <div className="collector-label"><LanguageText en={work.collectorLabelEn} he={work.collectorLabelHe} /></div>
          <div className={`availability${work.available ? '' : ' muted-status'}`}>
            <LanguageText en={work.availabilityEn} he={work.availabilityHe} />
          </div>
          <button className="details-btn" data-available={String(work.available)} data-price={work.price} data-title-en={work.titleEn} data-title-he={work.titleHe}>
            <LanguageText en="View Details" he="פרטים" />
          </button>
        </div>
      </div>

      <nav aria-label="Artwork navigation" className="art-nav">
        <button className="art-prev">← <LanguageText en="Previous" he="הקודמת" /></button>
        <span className="art-count">{index + 1} / {total}</span>
        <button className="art-next"><LanguageText en="Next" he="הבאה" /> →</button>
      </nav>
    </section>
  );
}

export default function ArtworkGallery({ active = false, works = [], songs = [] }) {
  const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
  const worksByCollection = works.reduce((groups, work) => {
    const collectionWorks = groups.get(work.collectionId) || [];
    collectionWorks.push(work);
    groups.set(work.collectionId, collectionWorks);
    return groups;
  }, new Map());

  return works.map((work) => {
    const collectionWorks = worksByCollection.get(work.collectionId);
    return (
      <Artwork
        key={work.id}
        active={active}
        work={work}
        index={collectionWorks.indexOf(work)}
        total={collectionWorks.length}
        songsById={songsById}
      />
    );
  });
}
