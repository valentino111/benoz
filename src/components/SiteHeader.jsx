function LanguageLabel({ en, he }) {
  return <><span data-lang="he">{he}</span><span data-lang="en">{en}</span></>;
}

function NavigationLink({ children, href, onNavigate, ...props }) {
  return <a href={href} onClick={(event) => onNavigate?.(href, event)} {...props}>{children}</a>;
}

export default function SiteHeader({ onNavigate }) {
  return (
    <header className="topbar">
      <NavigationLink aria-label="Ben Oz — Home" className="brand brand-home" href="/" id="brandHome" onNavigate={onNavigate}>
        <img alt="" aria-hidden="true" className="brand-logo-thumb" decoding="async" height="1254" loading="lazy" src="/assets/brand/ben-oz-logo-gold-transparent.png" width="1254" />
        <span>Ben Oz | בן עוז</span>
      </NavigationLink>
      <button aria-controls="mainMenu" aria-expanded="false" aria-label="Open menu" className="mobile-menu-toggle" id="mobileMenuBtn">☰</button>
      <nav aria-label="Primary navigation" className="main-menu" id="mainMenu">
        <NavigationLink className="menu-link" href="/" id="homeBtn" onNavigate={onNavigate}>
          <LanguageLabel en="Home" he="בית" />
        </NavigationLink>
        <NavigationLink className="menu-link" href="/gallery" onNavigate={onNavigate}><LanguageLabel en="Gallery" he="גלריה" /></NavigationLink>
        <NavigationLink className="menu-link" href="/music" onNavigate={onNavigate}><LanguageLabel en="Music" he="מוזיקה" /></NavigationLink>
        <NavigationLink className="menu-link" href="/story" onNavigate={onNavigate}><LanguageLabel en="Story" he="הסיפור" /></NavigationLink>
        <NavigationLink className="menu-link" href="/exhibitions" onNavigate={onNavigate}><LanguageLabel en="Exhibitions" he="תערוכות" /></NavigationLink>
        <NavigationLink className="menu-link" href="/contact" onNavigate={onNavigate}><LanguageLabel en="Contact" he="יצירת קשר" /></NavigationLink>
      </nav>
      <div className="actions">
        <button aria-pressed="false" className="pill sound-toggle" id="soundBtn" title="Ambient sound">◌</button>
        <button className="pill" id="langBtn">עברית</button>
      </div>
    </header>
  );
}
