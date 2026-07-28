export default function ExhibitionsSection({ standalone = false }) {
  const Heading = standalone ? 'h1' : 'h2';

  return (
    <section className={`exhibitions fade${standalone ? ' show' : ''}`} id="exhibitions">
      <div className="exhibitions-wrap">
        <div className="story-kicker">
          <span data-lang="he">תערוכה נוכחית</span>
          <span data-lang="en">Current Exhibition</span>
        </div>
        <Heading>Artists of the South</Heading>
        <div className="exhibition-meta">Israel • 2026</div>
        <p>
          <span data-lang="he">ארבע עבודות מתוך הסדרה &quot;הגאומטריה הנסתרת של הנפש&quot; מוצגות בתערוכה קבוצתית של אמנים מדרום ישראל.</span>
          <span data-lang="en">Four works from The Hidden Geometry of the Soul are presented in a group exhibition featuring artists from southern Israel.</span>
        </p>
        <div className="exhibition-placeholder">
          <span data-lang="he">תיעוד מן התערוכה יתווסף לאחר הפתיחה</span>
          <span data-lang="en">Exhibition documentation will be added after the opening</span>
        </div>
      </div>
    </section>
  );
}
