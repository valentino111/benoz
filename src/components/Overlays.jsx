import ArtworkDetailsDialog from './ArtworkDetailsDialog.jsx';
import RawMarkup from './RawMarkup.jsx';

const markup = `<div class="lightbox" id="lightbox">
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

export default function Overlays({ detailsWork, onCloseDetails }) {
  const accessibleMarkup = markup
    .replace('<div class="lightbox" id="lightbox">', '<div aria-hidden="true" aria-label="Artwork viewer" aria-modal="true" class="lightbox" id="lightbox" role="dialog">')
    .replace('<button class="close">', '<button aria-label="Close artwork viewer" class="close">')
    .replace('<button class="prev">', '<button aria-label="Previous artwork" class="prev">')
    .replace('<button class="next">', '<button aria-label="Next artwork" class="next">');
  return (
    <>
      <ArtworkDetailsDialog onClose={onCloseDetails} work={detailsWork} />
      <RawMarkup html={accessibleMarkup} />
    </>
  );
}
