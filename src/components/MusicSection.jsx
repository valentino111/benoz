import { useEffect, useRef, useState } from 'react';

function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he" lang="he" dir="rtl">{he}</span>
      <span data-lang="en" lang="en" dir="ltr">{en}</span>
    </>
  );
}

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = Math.floor(safeSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

function TrackMedia({ song }) {
  const videoRef = useRef(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  function isTouchPreview() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
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

  useEffect(() => stopPreview, []);

  function toggleTouchPreview() {
    if (!isTouchPreview()) return;
    if (videoRef.current?.paused) startPreview();
    else stopPreview();
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (videoRef.current?.paused) startPreview();
    else stopPreview();
  }

  return (
    <div
      aria-label={`Preview ${song.titleEn || song.title}`}
      className={`track-media${previewPlaying ? ' is-playing' : ''}`}
      onClick={toggleTouchPreview}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (!isTouchPreview()) startPreview();
      }}
      onMouseLeave={() => {
        if (!isTouchPreview()) stopPreview();
      }}
      role={song.animation ? 'button' : undefined}
      tabIndex={song.animation ? 0 : undefined}
    >
      <img
        alt={song.titleEn || song.title}
        className="track-cover-image"
        decoding="async"
        height={song.coverHeight}
        loading="lazy"
        src={song.cover}
        width={song.coverWidth}
      />
      {song.animation && (
        <video
          aria-hidden="true"
          className="track-hover-video"
          muted
          onEnded={stopPreview}
          onError={stopPreview}
          onPlay={() => setPreviewPlaying(true)}
          playsInline
          preload="metadata"
          ref={videoRef}
        >
          <source src={song.animation} type="video/mp4" />
        </video>
      )}
    </div>
  );
}

function Track({ activeSongId, onPlay, song }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const title = song.titleEn || song.title;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    if (activeSongId !== song.id) audioRef.current?.pause();
  }, [activeSongId, song.id]);

  useEffect(() => () => audioRef.current?.pause(), []);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    onPlay(song.id);
    audio.play()?.catch(() => setPlaying(false));
  }

  function updateProgress() {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(audio.currentTime);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  }

  function seek(event) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = (Number(event.target.value) / 100) * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  return (
    <article className="track" id={song.domId}>
      <TrackMedia song={song} />
      <div className="track-body">
        <div className="track-label">Artist Note</div>
        <h3 className="track-title">{song.title}</h3>
        <p className="track-note">
          <LanguageText en={song.noteEn} he={song.noteHe} />
        </p>
        <audio
          onDurationChange={updateProgress}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
          }}
          onLoadedMetadata={updateProgress}
          onPause={() => setPlaying(false)}
          onPlay={() => setPlaying(true)}
          onTimeUpdate={updateProgress}
          preload="metadata"
          ref={audioRef}
          src={song.audio}
        />
        <div className="player" dir="ltr">
          <button
            aria-label={`${playing ? 'Pause' : 'Play'} ${title}`}
            aria-pressed={playing}
            className={`play${playing ? ' is-playing' : ''}`}
            onClick={togglePlayback}
          >
            <span aria-hidden="true" className="gold-play-glyph" />
          </button>
          <input
            aria-label={`Seek in ${title}`}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            className="range"
            dir="ltr"
            max="100"
            min="0"
            onChange={seek}
            type="range"
            value={progress}
          />
          <span className="time">{formatTime(currentTime)}</span>
        </div>
      </div>
    </article>
  );
}

export default function MusicSection({ songs = [], standalone = false }) {
  const [activeSongId, setActiveSongId] = useState('');
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <section className={`music fade${standalone ? ' show' : ''}`} id="music">
      <div className="music-wrap">
        <Heading><LanguageText en="Beyond the Canvas" he="מעבר לקנבס" /></Heading>
        <div className="tracks">
          {songs.map((song) => (
            <Track
              activeSongId={activeSongId}
              key={song.id}
              onPlay={setActiveSongId}
              song={song}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
