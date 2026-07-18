import RawMarkup from './RawMarkup.jsx';

const markup = "<a class=\"skip-link\" href=\"#gallery\">Skip to gallery</a><div aria-hidden=\"true\" class=\"museum-loader\" id=\"museumLoader\">\n<div class=\"loader-inner\"><div class=\"loader-name\">BEN OZ</div><div class=\"loader-sub\">Digital Gallery</div><div class=\"loader-line\"></div></div>\n</div><section class=\"entry\" id=\"entry\">\n<div aria-hidden=\"true\" class=\"entry-visual\"></div>\n<div aria-hidden=\"true\" class=\"entry-overlay\"></div>\n<div class=\"entry-inner\">\n<img alt=\"Ben Oz Digital Gallery\" class=\"official-logo logo-shimmer\" src=\"assets/brand/ben-oz-logo-gold-transparent.png\"/>\n<div class=\"role\">Artist</div>\n<div class=\"tagline\">One Idea, Many Forms</div>\n<button class=\"enter\" id=\"enterBtn\">Enter Gallery</button>\n</div>\n</section>";

export default function EntryScreen({ loading = false }) {
  const html = loading
    ? `${markup.replace('id="enterBtn"', 'id="enterBtn" disabled aria-describedby="galleryLoadingStatus"')}<p class="sr-only" id="galleryLoadingStatus" role="status">Loading gallery content</p>`
    : markup;
  return <RawMarkup html={html} />;
}
