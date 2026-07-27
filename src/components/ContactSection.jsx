import RawMarkup from './RawMarkup.jsx';

const markup = "<section class=\"contact fade\" id=\"contact\">\n<div class=\"contact-card\">\n<div class=\"contact-role\"><span data-lang=\"he\">אמן</span><span data-lang=\"en\">Artist</span></div>\n<div class=\"contact-name\">Ben Oz</div>\n<div class=\"contact-disciplines\"><span data-lang=\"he\">אמנות דיגיטלית · מוזיקה · שירה · קולנוע</span><span data-lang=\"en\">Digital Art · Music · Poetry · Film</span></div>\n<h2><span data-lang=\"he\">לרכישה ולפרטים נוספים</span><span data-lang=\"en\">Purchase and enquiries</span></h2>\n<div><span data-lang=\"he\">מחיר ארבע העבודות המוצגות יחד: ₪12,000</span><span data-lang=\"en\">Price for the four exhibited works together: ₪12,000</span></div>\n<a class=\"whatsapp\" href=\"https://wa.me/972544520987\" rel=\"noopener\" target=\"_blank\">WhatsApp</a>\n</div>\n</section>";

export default function ContactSection({ standalone = false }) {
  const semanticMarkup = standalone
    ? markup.replace('<h2>', '<h1>').replace('</h2>', '</h1>')
    : markup;
  return <RawMarkup html={semanticMarkup} />;
}
