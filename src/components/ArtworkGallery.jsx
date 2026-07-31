import { useEffect, useRef, useState } from 'react';
import { formatEdition } from '../data/edition.js';
import VideoPreviewButton from './VideoPreviewButton.jsx';

function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he" lang="he" dir="rtl">{he}</span>
      <span data-lang="en" lang="en" dir="ltr">{en}</span>
    </>
  );
}

function ArtworkSoundtrack({ language, onToggle, playing, song }) {
  if (!song) return null;
  const title = language === 'he'
    ? (song.titleHe || song.titleEn || song.title)
    : (song.titleEn || song.titleHe || song.title);
  const action = playing ? 'Pause' : 'Play';

  return (
    <div className="artwork-soundtrack">
      <button
        aria-label={`${action} ${title}`}
        aria-pressed={playing}
        className={playing ? 'is-playing' : ''}
        onClick={() => onToggle(song)}
        type="button"
      >
        <span aria-hidden="true" className="soundtrack-icon">
          <span className="gold-play-glyph" />
        </span>
        <span>
          <span className="soundtrack-kicker">
            <LanguageText en="Music of the Artwork" he="המוזיקה של היצירה" />
          </span>
          <span className="soundtrack-title">{title}</span>
        </span>
      </button>
    </div>
  );
}

function ArtworkMedia({
  active,
  isFirstVisibleArtwork,
  language,
  musicPlaying,
  onOpen,
  work,
}) {
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
  const imageAlt = language === 'he' ? work.titleHe : work.titleEn;

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
          alt={imageAlt}
          data-alt-en={work.titleEn}
          data-alt-he={work.titleHe}
          data-full-src={work.image}
          decoding="async"
          fetchPriority={isFirstVisibleArtwork ? 'high' : 'auto'}
          height={previewHeight}
          loading={isFirstVisibleArtwork ? 'eager' : 'lazy'}
          onClick={(event) => onOpen(event.currentTarget)}
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
            muted={musicPlaying}
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
        <span
          aria-label={imageAlt || 'View artwork'}
          className="image-shield"
          onClick={(event) => onOpen(event.currentTarget)}
          onContextMenu={(event) => event.preventDefault()}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            onOpen(event.currentTarget);
          }}
          role="button"
          tabIndex="0"
        />
      </span>
    </div>
  );
}

function Artwork({
  active,
  artworkRef,
  index,
  language,
  onNavigate,
  onOpenArtwork,
  onToggleSong,
  onViewDetails,
  playingSongId,
  songsById,
  total,
  work,
}) {
  const swipeStart = useRef(null);
  const isFirstVisibleArtwork = active && index === 0;
  const editionEn = formatEdition(work.editionNumber, work.editionTotal, 'en');
  const editionHe = formatEdition(work.editionNumber, work.editionTotal, 'he');
  const isEditionDescription = /available in two editions/i.test(work.descriptionEn || '');
  return (
    <article
      className="artwork fade"
      data-artwork-slug={work.id}
      data-collection-id={work.collectionId}
      data-img={work.image}
      id={work.id}
      onTouchEnd={(event) => {
        const start = swipeStart.current;
        swipeStart.current = null;
        if (
          !start
          || event.changedTouches.length !== 1
          || document.body.classList.contains('lightbox-open')
        ) return;
        const dx = event.changedTouches[0].clientX - start.x;
        const dy = event.changedTouches[0].clientY - start.y;
        if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.35) return;
        onNavigate(index + (dx < 0 ? 1 : -1), { block: 'start' });
      }}
      onTouchStart={(event) => {
        if (event.touches.length !== 1) {
          swipeStart.current = null;
          return;
        }
        swipeStart.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      ref={artworkRef}
    >
      <ArtworkMedia
        active={active}
        isFirstVisibleArtwork={isFirstVisibleArtwork}
        language={language}
        musicPlaying={Boolean(playingSongId)}
        onOpen={(opener) => onOpenArtwork(index, opener)}
        work={work}
      />

      <div className="art-copy">
        <span className="status"><LanguageText en={work.statusEn} he={work.statusHe} /></span>
        <h2><LanguageText en={work.titleEn} he={work.titleHe} /></h2>
        <div className="en-title">{work.titleEn}</div>
        {work.meta && <div className="meta">{work.meta}</div>}
        {!isEditionDescription && (
          <p className="desc"><LanguageText en={work.descriptionEn} he={work.descriptionHe} /></p>
        )}

        {work.songId && (
          <ArtworkSoundtrack
            language={language}
            onToggle={onToggleSong}
            playing={playingSongId === work.songId}
            song={songsById[work.songId]}
          />
        )}

        <div className="collector-summary">
          <div className="collector-label"><LanguageText en={work.collectorLabelEn} he={work.collectorLabelHe} /></div>
          <div className={`availability${work.available ? '' : ' muted-status'}`}>
            <LanguageText en={work.availabilityEn} he={work.availabilityHe} />
          </div>
          {editionEn && editionHe && (
            <div className="edition-info">
              <span data-lang="he" lang="he" dir="rtl">
                {editionHe.label}: <bdi dir="ltr">{editionHe.fraction}</bdi>
                {editionHe.isUnique && ` (${editionHe.uniqueLabel})`}
              </span>
              <span data-lang="en" lang="en" dir="ltr">
                {editionEn.label}: <bdi dir="ltr">{editionEn.fraction}</bdi>
                {editionEn.isUnique && ` (${editionEn.uniqueLabel})`}
              </span>
            </div>
          )}
          <button
            className="details-btn"
            onClick={() => onViewDetails?.(work)}
            type="button"
          >
            <LanguageText en="View Details" he="פרטים" />
          </button>
        </div>
      </div>

      <nav aria-label="Artwork navigation" className="art-nav">
        <button
          className="art-prev"
          disabled={index === 0}
          onClick={() => onNavigate(index - 1, { block: 'center' })}
          type="button"
        >
          ← <LanguageText en="Previous" he="הקודמת" />
        </button>
        <span className="art-count">{index + 1} / {total}</span>
        <button
          className="art-next"
          disabled={index === total - 1}
          onClick={() => onNavigate(index + 1, { block: 'center' })}
          type="button"
        >
          <LanguageText en="Next" he="הבאה" /> →
        </button>
      </nav>
    </article>
  );
}

export default function ArtworkGallery({
  active = false,
  language = 'en',
  onOpenArtwork,
  onViewDetails,
  songs = [],
  works = [],
}) {
  const artworkElements = useRef(new Map());
  const audioRef = useRef(null);
  const navigationTargetRef = useRef('');
  const navigationUnlockTimerRef = useRef(null);
  const [playingSongId, setPlayingSongId] = useState('');
  const songsById = Object.fromEntries(songs.map((song) => [song.id, song]));
  const worksByCollection = works.reduce((groups, work) => {
    const collectionWorks = groups.get(work.collectionId) || [];
    collectionWorks.push(work);
    groups.set(work.collectionId, collectionWorks);
    return groups;
  }, new Map());

  function navigateToArtwork(collectionWorks, index, { block = 'start' } = {}) {
    const work = collectionWorks[index];
    const target = work ? artworkElements.current.get(work.id) : null;
    if (!target) return;
    window.clearTimeout(navigationUnlockTimerRef.current);
    navigationTargetRef.current = work.id;
    navigationUnlockTimerRef.current = window.setTimeout(() => {
      if (navigationTargetRef.current === work.id) navigationTargetRef.current = '';
    }, 1500);
    const url = new URL(window.location.href);
    url.hash = work.id;
    window.history.replaceState(
      window.history.state,
      '',
      `${url.pathname}${url.search}${url.hash}`,
    );
    target.scrollIntoView({ behavior: 'smooth', block });
  }

  function toggleSong(song) {
    const audio = audioRef.current;
    if (!audio || !song?.audio) return;

    if (playingSongId === song.id && !audio.paused) {
      audio.pause();
      return;
    }

    if (audio.dataset.songId !== song.id) {
      audio.src = song.audio;
      audio.dataset.songId = song.id;
    }
    audio.play()?.catch(() => setPlayingSongId(''));
  }

  useEffect(() => {
    if (active) return undefined;
    audioRef.current?.pause();
    setPlayingSongId('');
    return undefined;
  }, [active]);

  useEffect(() => () => audioRef.current?.pause(), []);

  useEffect(() => {
    if (!active) return undefined;
    let scrollFrame;
    const scrollToHash = () => {
      let slug;
      try {
        slug = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      const target = artworkElements.current.get(slug);
      if (!target) return;
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    };

    window.addEventListener('hashchange', scrollToHash);
    scrollToHash();

    if (typeof IntersectionObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(scrollFrame);
        window.clearTimeout(navigationUnlockTimerRef.current);
        navigationTargetRef.current = '';
        window.removeEventListener('hashchange', scrollToHash);
      };
    }

    const hashObserver = new IntersectionObserver((entries) => {
      const navigationTarget = navigationTargetRef.current;
      const visible = navigationTarget
        ? entries.find((entry) => (
          entry.isIntersecting
          && entry.intersectionRatio >= 0.45
          && entry.target.dataset.artworkSlug === navigationTarget
        ))
        : entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (navigationTarget && !visible) return;
      if (navigationTarget) {
        navigationTargetRef.current = '';
        window.clearTimeout(navigationUnlockTimerRef.current);
      }
      const slug = visible?.target?.dataset.artworkSlug;
      if (!slug) return;
      const url = new URL(window.location.href);
      if (url.hash === `#${slug}`) return;
      url.hash = slug;
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`,
      );
    }, { threshold: [0.45, 0.65] });

    works.forEach((work) => {
      const element = artworkElements.current.get(work.id);
      if (element) hashObserver.observe(element);
    });

    return () => {
      window.cancelAnimationFrame(scrollFrame);
      window.clearTimeout(navigationUnlockTimerRef.current);
      navigationTargetRef.current = '';
      window.removeEventListener('hashchange', scrollToHash);
      hashObserver.disconnect();
    };
  }, [active, works]);

  return (
    <>
      <audio
        onEnded={() => setPlayingSongId('')}
        onError={() => setPlayingSongId('')}
        onPause={() => setPlayingSongId('')}
        onPlay={() => setPlayingSongId(audioRef.current?.dataset.songId || '')}
        preload="none"
        ref={audioRef}
      />
      {works.map((work) => {
        const collectionWorks = worksByCollection.get(work.collectionId);
        const index = collectionWorks.indexOf(work);
        return (
          <Artwork
            key={work.id}
            active={active}
            artworkRef={(element) => {
              if (element) artworkElements.current.set(work.id, element);
              else artworkElements.current.delete(work.id);
            }}
            language={language}
            work={work}
            index={index}
            onNavigate={(targetIndex, options) => {
              navigateToArtwork(collectionWorks, targetIndex, options);
            }}
            onOpenArtwork={(targetIndex, opener) => {
              onOpenArtwork?.(collectionWorks, targetIndex, opener);
            }}
            onToggleSong={toggleSong}
            onViewDetails={onViewDetails}
            playingSongId={playingSongId}
            total={collectionWorks.length}
            songsById={songsById}
          />
        );
      })}
    </>
  );
}
