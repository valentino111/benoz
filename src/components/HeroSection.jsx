import RawMarkup from './RawMarkup.jsx';

const markup = "<section class=\"hero fade\" id=\"gallery\">\n<div>\n<img alt=\"Ben Oz\" class=\"hero-logo logo-shimmer parallax-item\" src=\"assets/brand/ben-oz-logo-gold-transparent.png\"/>\n<h1 class=\"parallax-item\"><span data-lang=\"he\">הגאומטריה הנסתרת של הנפש</span><span data-lang=\"en\">The Hidden Geometry<br/>of the Soul</span></h1>\n<div class=\"manifesto parallax-item\">\n<div data-lang=\"he\">\n<span>רעיונות הופכים לשירה</span>\n<span>שירה הופכת לאמנות</span>\n<span>אמנות הופכת למוזיקה</span>\n<span>מוזיקה הופכת לקולנוע</span>\n<span>קולנוע הופך לזיכרון</span>\n</div>\n<div data-lang=\"en\">\n<span>Ideas become Poetry</span>\n<span>Poetry becomes Art</span>\n<span>Art becomes Music</span>\n<span>Music becomes Cinema</span>\n<span>Cinema becomes Memory</span>\n</div>\n</div>\n</div>\n</section><div class=\"exhibition-note fade\">\n<span data-lang=\"he\">הסדרה המלאה כוללת שש עבודות. ארבע מתוכן משתתפות בתערוכה הנוכחית.</span>\n<span data-lang=\"en\">The complete series consists of six works. Four are presented in the current exhibition.</span>\n</div>";

export default function HeroSection() {
  return <RawMarkup html={markup} />;
}
