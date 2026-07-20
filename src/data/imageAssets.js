const WEB_IMAGE_ROOT = '/images/web';

const IMAGE_PROFILES = {
  'atsdakatkha.png': { stem: 'atsdakatkha', detail: [1610, 2400], thumbnail: [604, 900] },
  'be-yom-shel-hosheh.jpg': { stem: 'be-yom-shel-hosheh', detail: [1610, 2400], thumbnail: [604, 900] },
  'ben-oz-brand-hero.jpg': { stem: 'ben-oz-brand-hero', detail: [1254, 1254], thumbnail: [900, 900] },
  'compassion.jpg': { stem: 'compassion', detail: [1030, 1536], thumbnail: [604, 900] },
  'cover-lachayot.jpg': { stem: 'cover-lachayot', detail: [1254, 1254], thumbnail: [900, 900] },
  'cover-yofi.jpg': { stem: 'cover-yofi', detail: [1254, 1254], thumbnail: [900, 900] },
  'exhibition-poster-2.png': { stem: 'exhibition-poster-2', detail: [2400, 1370], thumbnail: [900, 514] },
  'exhibition-poster.jpg': { stem: 'exhibition-poster', detail: [1030, 1536], thumbnail: [604, 900] },
  'fragility-of-love.jpg': { stem: 'fragility-of-love', detail: [1030, 1536], thumbnail: [604, 900] },
  'gate-to-infinity.jpg': { stem: 'gate-to-infinity', detail: [1030, 1536], thumbnail: [604, 900] },
  'haver-al-tishtol.png': { stem: 'haver-al-tishtol', detail: [1610, 2400], thumbnail: [604, 900] },
  'hidden-harmony.jpg': { stem: 'hidden-harmony', detail: [1030, 1536], thumbnail: [604, 900] },
  'human-creator.jpg': { stem: 'human-creator', detail: [1024, 1536], thumbnail: [600, 900] },
  'inner-light.jpg': { stem: 'inner-light', detail: [1030, 1536], thumbnail: [604, 900] },
  'kulanu-le-lo-reconeynu.png': { stem: 'kulanu-le-lo-reconeynu', detail: [1028, 1530], thumbnail: [605, 900] },
  'lishtol.png': { stem: 'lishtol', detail: [1610, 2400], thumbnail: [604, 900] },
  'lismoh-batuah.png': { stem: 'lismoh-batuah', detail: [1610, 2400], thumbnail: [604, 900] },
  'pearls-of-truth-poster-back.jpg': { stem: 'pearls-of-truth-poster-back', detail: [1254, 1254], thumbnail: [900, 900] },
  'pearls-of-truth-poster.jpg': { stem: 'pearls-of-truth-poster', detail: [2400, 1800], thumbnail: [900, 675] },
  'tov-o-ra.jpg': { stem: 'tov-o-ra', detail: [1610, 2400], thumbnail: [604, 900] },
};

function fileNameFromPath(value) {
  return value.split(/[?#]/, 1)[0].split('/').pop();
}

export function optimizedImage(fileName, variant = 'detail') {
  const value = String(fileName || '').trim();
  if (!value) return { src: '', width: undefined, height: undefined };
  if (/^(https?:)?\/\//.test(value)) return { src: value, width: undefined, height: undefined };

  const profile = IMAGE_PROFILES[fileNameFromPath(value)];
  if (!profile) {
    const src = value.startsWith('/') ? value : `/assets/${fileNameFromPath(value)}`;
    return { src, width: undefined, height: undefined };
  }

  const selectedVariant = variant === 'thumbnail' ? 'thumbnail' : 'detail';
  const suffix = selectedVariant === 'thumbnail' ? '-thumb' : '';
  const [width, height] = profile[selectedVariant];
  return {
    src: `${WEB_IMAGE_ROOT}/${profile.stem}${suffix}.webp`,
    width,
    height,
  };
}
