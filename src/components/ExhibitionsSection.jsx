import RawMarkup from './RawMarkup.jsx';

const markup = "<section class=\"exhibitions fade\" id=\"exhibitions\">\n<div class=\"exhibitions-wrap\">\n<div class=\"story-kicker\"><span data-lang=\"he\">תערוכה נוכחית</span><span data-lang=\"en\">Current Exhibition</span></div>\n<h2>Artists of the South</h2>\n<div class=\"exhibition-meta\">Israel • 2026</div>\n<p>\n<span data-lang=\"he\">ארבע עבודות מתוך הסדרה \"הגאומטריה הנסתרת של הנפש\" מוצגות בתערוכה קבוצתית של אמנים מדרום ישראל.</span>\n<span data-lang=\"en\">Four works from The Hidden Geometry of the Soul are presented in a group exhibition featuring artists from southern Israel.</span>\n</p>\n<div class=\"exhibition-placeholder\">\n<span data-lang=\"he\">תיעוד מן התערוכה יתווסף לאחר הפתיחה</span>\n<span data-lang=\"en\">Exhibition documentation will be added after the opening</span>\n</div>\n</div>\n</section>";

export default function ExhibitionsSection({ standalone = false }) {
  const semanticMarkup = standalone
    ? markup.replace('<h2>', '<h1>').replace('</h2>', '</h1>')
    : markup;
  return <RawMarkup html={semanticMarkup} />;
}
