import RawMarkup from './RawMarkup.jsx';

const markup = "<footer>\n<div>Ben Oz | בן עוז</div>\n<div>Artist</div>\n<div>© 2026</div>\n</footer>";

export default function SiteFooter() {
  return <RawMarkup html={markup} />;
}
