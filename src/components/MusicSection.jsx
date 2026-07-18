function LanguageText({ en, he }) {
  return (
    <>
      <span data-lang="he">{he}</span>
      <span data-lang="en">{en}</span>
    </>
  );
}

function Track({ song }) {
  return (
    <article className="track" id={song.domId}>
      <div className="track-media">
        <img alt={song.title} className="track-cover-image" src={song.cover} />
        {song.animation && (
          <video aria-hidden="true" className="track-hover-video" muted playsInline preload="metadata">
            <source src={song.animation} type="video/mp4" />
          </video>
        )}
      </div>
      <div className="track-body">
        <div className="track-label">Artist Note</div>
        <h3 className="track-title">{song.title}</h3>
        <p className="track-note">
          <LanguageText en={song.noteEn} he={song.noteHe} />
        </p>
        <audio preload="metadata" src={song.audio}></audio>
        <div className="player">
          <button className="play">▶</button>
          <input className="range" max="100" min="0" type="range" defaultValue="0" />
          <span className="time">0:00</span>
        </div>
      </div>
    </article>
  );
}

export default function MusicSection({ songs = [] }) {
  return (
    <section className="music fade" id="music">
      <div className="music-wrap">
        <h2><LanguageText en="Beyond the Canvas" he="מעבר לקנבס" /></h2>
        <div className="tracks">
          {songs.map((song) => <Track key={song.id} song={song} />)}
        </div>
      </div>
    </section>
  );
}
