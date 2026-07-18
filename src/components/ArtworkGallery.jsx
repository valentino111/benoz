function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he">{he}</span>
      <span data-lang="en">{en}</span>
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

function Artwork({ work, index, total, songsById }) {
  return (
    <section className="artwork fade" data-artwork-slug={work.id} data-img={work.image} id={work.id}>
      <div className="art-media">
        <img alt={work.titleHe || work.titleEn} src={work.image} />
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

export default function ArtworkGallery({ works = [], songs = [] }) {
  const exhibitionWorks = works.filter((work) => work.collectionId === 'exhibition');
  const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));

  return exhibitionWorks.map((work, index) => (
    <Artwork key={work.id} work={work} index={index} total={exhibitionWorks.length} songsById={songsById} />
  ));
}
