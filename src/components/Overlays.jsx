import RawMarkup from './RawMarkup.jsx';
import { getEditionTranslations } from '../data/edition.js';

const editionEn = getEditionTranslations('en');
const editionHe = getEditionTranslations('he');
const markup = `<dialog class="details-dialog" id="detailsDialog">
<button aria-label="Close" class="dialog-close">×</button>
<div class="dialog-content">
<div class="dialog-kicker">
<span data-lang="he">פרטי היצירה</span><span data-lang="en">Artwork Details</span>
</div>
<h2>
<span data-lang="he" id="dialogTitleHe"></span>
<span data-lang="en" id="dialogTitleEn"></span>
</h2>
<div class="dialog-status" id="dialogStatus"></div>
<div class="dialog-edition" hidden id="dialogEdition">
<div class="dialog-edition-label"><span data-lang="he">${editionHe.label}</span><span data-lang="en">${editionEn.label}</span></div>
<div class="dialog-edition-value"><bdi dir="ltr" id="dialogEditionFraction"></bdi><span data-lang="he" id="dialogEditionUniqueHe"> (${editionHe.unique})</span><span data-lang="en" id="dialogEditionUniqueEn"> (${editionEn.unique})</span></div>
</div>
<p class="dialog-description" hidden id="dialogDescription">
<span data-lang="he" id="dialogDescriptionHe" lang="he" dir="rtl"></span>
<span data-lang="en" id="dialogDescriptionEn" lang="en" dir="ltr"></span>
</p>
<p>
<span data-lang="he">Fine Art Canvas בגודל 40×60 ס״מ, מתוח על מסגרת עץ ומוכן לתלייה.</span>
<span data-lang="en">Fine Art Canvas, 40×60 cm, stretched on a wooden frame and ready to hang.</span>
</p>
<p>
<span data-lang="he">העבודה תימסר חתומה על ידי האמן.</span>
<span data-lang="en">The work will be delivered signed by the artist.</span>
</p>
<div class="dialog-price" id="dialogPrice"></div>
<a class="whatsapp" href="https://wa.me/972544520987" id="dialogWhatsapp" rel="noopener" target="_blank">
<span data-lang="he">יצירת קשר ב-WhatsApp</span>
<span data-lang="en">Contact on WhatsApp</span>
</a>
</div>
</dialog><div class="lightbox" id="lightbox">
<button class="close">×</button>
<button class="prev">‹</button>
<div class="lb-stage">
<img alt="" decoding="async"/>
</div>
<div class="lb-toolbar">
<button aria-label="Zoom out" class="zoom-out">−</button>
<span class="lb-count">1 / 6</span>
<button aria-label="Zoom in" class="zoom-in">+</button>
<button aria-label="Reset zoom" class="zoom-reset">100%</button>
</div>
<button class="next">›</button>
</div>`;

export default function Overlays() {
  const accessibleMarkup = markup
    .replace('<div class="lightbox" id="lightbox">', '<div aria-hidden="true" aria-label="Artwork viewer" aria-modal="true" class="lightbox" id="lightbox" role="dialog">')
    .replace('<button class="close">', '<button aria-label="Close artwork viewer" class="close">')
    .replace('<button class="prev">', '<button aria-label="Previous artwork" class="prev">')
    .replace('<button class="next">', '<button aria-label="Next artwork" class="next">');
  return <RawMarkup html={accessibleMarkup} />;
}
