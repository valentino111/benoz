import { useEffect, useRef, useState } from 'react';

function LanguageLabel({ en, he }) {
  return <><span data-lang="he">{he}</span><span data-lang="en">{en}</span></>;
}

function NavigationLink({
  children,
  href,
  onActivate,
  onNavigate,
  ...props
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onActivate?.();
        onNavigate?.(href, event);
      }}
      {...props}
    >
      {children}
    </a>
  );
}

export default function SiteHeader({
  ambientOn,
  language,
  onNavigate,
  onToggleLanguage,
  onToggleSound,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const topbarRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeFromOutside = (event) => {
      if (!topbarRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeFromEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', closeFromOutside);
    document.addEventListener('keydown', closeFromEscape);
    return () => {
      document.removeEventListener('pointerdown', closeFromOutside);
      document.removeEventListener('keydown', closeFromEscape);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`topbar${menuOpen ? ' menu-open' : ''}`} ref={topbarRef}>
      <NavigationLink aria-label="Ben Oz — Home" className="brand brand-home" href="/" id="brandHome" onActivate={closeMenu} onNavigate={onNavigate}>
        <img alt="" aria-hidden="true" className="brand-logo-thumb" decoding="async" height="1254" loading="lazy" src="/assets/brand/ben-oz-logo-gold-transparent.png" width="1254" />
        <span>Ben Oz | בן עוז</span>
      </NavigationLink>
      <button
        aria-controls="mainMenu"
        aria-expanded={menuOpen}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        className="mobile-menu-toggle"
        id="mobileMenuBtn"
        onClick={() => setMenuOpen((open) => !open)}
        type="button"
      >
        {menuOpen ? '×' : '☰'}
      </button>
      <nav aria-label="Primary navigation" className="main-menu" id="mainMenu">
        <NavigationLink className="menu-link" href="/" id="homeBtn" onActivate={closeMenu} onNavigate={onNavigate}>
          <LanguageLabel en="Home" he="בית" />
        </NavigationLink>
        <NavigationLink className="menu-link" href="/gallery" onActivate={closeMenu} onNavigate={onNavigate}><LanguageLabel en="Gallery" he="גלריה" /></NavigationLink>
        <NavigationLink className="menu-link" href="/story" onActivate={closeMenu} onNavigate={onNavigate}><LanguageLabel en="Story" he="הסיפור" /></NavigationLink>
        <NavigationLink className="menu-link" href="/exhibitions" onActivate={closeMenu} onNavigate={onNavigate}><LanguageLabel en="Exhibitions" he="תערוכות" /></NavigationLink>
        <NavigationLink className="menu-link" href="/contact" onActivate={closeMenu} onNavigate={onNavigate}><LanguageLabel en="Contact" he="יצירת קשר" /></NavigationLink>
      </nav>
      <div className="actions">
        <button
          aria-label={ambientOn ? 'Turn ambient sound off' : 'Turn ambient sound on'}
          aria-pressed={ambientOn}
          className={`pill sound-toggle${ambientOn ? ' is-on' : ''}`}
          id="soundBtn"
          onClick={onToggleSound}
          title="Ambient sound"
          type="button"
        >
          {ambientOn ? '◉' : '◌'}
        </button>
        <button
          aria-label={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
          className="pill"
          id="langBtn"
          onClick={onToggleLanguage}
          type="button"
        >
          {language === 'en' ? 'עברית' : 'English'}
        </button>
      </div>
    </header>
  );
}
