function LanguageLabel({ en, he }) {
  return <><span data-lang="he">{he}</span><span data-lang="en">{en}</span></>;
}

export default function SiteHeader({ galleryTarget = 'gallery', onBack }) {
  return (
    <header className="topbar">
      <a aria-label="Ben Oz — Back to collections" className="brand brand-home" href="./" id="brandHome" onClick={onBack}>
        <img alt="" aria-hidden="true" className="brand-logo-thumb" decoding="async" height="1254" loading="lazy" src="assets/brand/ben-oz-logo-gold-transparent.png" width="1254" />
        <span>Ben Oz | בן עוז</span>
      </a>
      <button aria-controls="mainMenu" aria-expanded="false" aria-label="Open menu" className="mobile-menu-toggle" id="mobileMenuBtn">☰</button>
      <nav aria-label="Primary navigation" className="main-menu" id="mainMenu">
        <button aria-label="Back to collections" className="menu-link" id="homeBtn" onClick={onBack}>
          <LanguageLabel en="Home" he="בית" />
        </button>
        <a className="menu-link" href={`#${galleryTarget}`}><LanguageLabel en="Gallery" he="גלריה" /></a>
        <a className="menu-link" href="#music"><LanguageLabel en="Music" he="מוזיקה" /></a>
        <a className="menu-link" href="#story"><LanguageLabel en="Story" he="הסיפור" /></a>
        <a className="menu-link" href="#exhibitions"><LanguageLabel en="Exhibitions" he="תערוכות" /></a>
        <a className="menu-link" href="#contact"><LanguageLabel en="Contact" he="יצירת קשר" /></a>
      </nav>
      <div className="actions">
        <button aria-pressed="false" className="pill sound-toggle" id="soundBtn" title="Ambient sound">◌</button>
        <button className="pill" id="langBtn">עברית</button>
      </div>
    </header>
  );
}
