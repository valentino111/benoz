import { useEffect, useRef, useState } from 'react';
import VideoPreviewButton from './VideoPreviewButton.jsx';

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

function ArtworkMedia({ active, isFirstVisibleArtwork, work }) {
  const videoRef = useRef(null);
  const longPressTimer = useRef(null);
  const longPressStart = useRef(null);
  const suppressNextClick = useRef(false);
  const suppressResetTimer = useRef(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const previewImage = work.thumbnail || work.image;
  const previewWidth = work.thumbnailWidth || work.imageWidth;
  const previewHeight = work.thumbnailHeight || work.imageHeight;
  const hasAnimation = Boolean(work.video);

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
    video.play()?.catch(() => setPreviewPlaying(false));
  }

  function isTouchPreview() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }

  useEffect(() => {
    if (!hasAnimation || !active) {
      clearLongPress();
      stopPreview();
      return undefined;
    }

    return () => {
      clearLongPress();
      window.clearTimeout(suppressResetTimer.current);
      stopPreview();
    };
  }, [active, hasAnimation]);

  function handlePointerDown(event) {
    if (
      !hasAnimation
      || !isTouchPreview()
      || event.button !== 0
      || event.target.closest('.video-preview-trigger')
    ) return;
    clearLongPress();
    longPressStart.current = { x: event.clientX, y: event.clientY };
    longPressTimer.current = window.setTimeout(() => {
      suppressNextClick.current = true;
      startPreview();
      longPressTimer.current = null;
      window.clearTimeout(suppressResetTimer.current);
      suppressResetTimer.current = window.setTimeout(() => {
        suppressNextClick.current = false;
      }, 900);
    }, 150);
  }

  function handlePointerMove(event) {
    const start = longPressStart.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) clearLongPress();
  }

  function handlePreviewClick(event) {
    if (!suppressNextClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressNextClick.current = false;
  }

  return (
    <div
      className={`art-media${hasAnimation ? ' has-artwork-animation' : ''}`}
      onClickCapture={handlePreviewClick}
      onContextMenu={(event) => {
        if (hasAnimation && isTouchPreview()) event.preventDefault();
      }}
      onMouseEnter={() => {
        if (hasAnimation && !isTouchPreview()) startPreview();
      }}
      onMouseLeave={() => {
        if (hasAnimation && !isTouchPreview()) stopPreview();
      }}
      onPointerCancel={() => {
        clearLongPress();
        suppressNextClick.current = false;
        stopPreview();
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={clearLongPress}
    >
      <span className="art-media-frame">
        <img
          alt={work.titleEn || work.titleHe}
          data-alt-en={work.titleEn}
          data-alt-he={work.titleHe}
          data-full-src={work.image}
          decoding="async"
          fetchPriority={isFirstVisibleArtwork ? 'high' : 'auto'}
          height={previewHeight}
          loading={isFirstVisibleArtwork ? 'eager' : 'lazy'}
          src={previewImage}
          width={previewWidth}
        />
        {hasAnimation && (
          <video
            aria-hidden="true"
            className={`artwork-preview-video${previewPlaying ? ' is-playing' : ''}`}
            controls={false}
            disablePictureInPicture
            draggable={false}
            onEnded={stopPreview}
            onError={stopPreview}
            onPlay={() => setPreviewPlaying(true)}
            playsInline
            preload="metadata"
            ref={videoRef}
          >
            <source src={work.video} type="video/mp4" />
          </video>
        )}
        {hasAnimation && (
          <VideoPreviewButton
            label={`${previewPlaying ? 'Pause' : 'Play'} animation for ${work.titleEn || work.titleHe}`}
            onActivate={previewPlaying ? stopPreview : startPreview}
            playing={previewPlaying}
          />
        )}
      </span>
    </div>
  );
}

function Artwork({ active, work, index, total, songsById }) {
  const isFirstVisibleArtwork = active && index === 0;
  return (
    <article className="artwork fade" data-artwork-slug={work.id} data-collection-id={work.collectionId} data-img={work.image} id={work.id}>
      <ArtworkMedia active={active} isFirstVisibleArtwork={isFirstVisibleArtwork} work={work} />

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
    </article>
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
