import {
  PAGE_CONTACT,
  PAGE_EXHIBITIONS,
  PAGE_MUSIC,
  PAGE_STORY,
  SITE_PATHS,
  VIEW_COLLECTION,
  VIEW_COLLECTIONS,
  VIEW_ENTRY,
} from '../data/siteRoutes.js';

export const SITE_NAME = 'Ben Oz Digital Gallery';
export const ARTIST_NAME = 'Ben Oz';
export const DEFAULT_SITE_URL = 'https://ben-oz-art-v8.netlify.app';
export const DEFAULT_SOCIAL_IMAGE = '/images/web/ben-oz-brand-hero.webp';

const PAGE_COPY = {
  home: {
    en: {
      title: 'Ben Oz — Contemporary Digital Artist and Music Creator',
      description: 'Explore the contemporary digital art, visual collections and original music of Ben Oz, an Israeli multidisciplinary artist from southern Israel.',
    },
    he: {
      title: 'בן עוז — אמן דיגיטלי ויוצר מוזיקה עכשווי',
      description: 'גלו אמנות דיגיטלית עכשווית, אוספים חזותיים ומוזיקה מקורית מאת בן עוז, אמן רב־תחומי מדרום ישראל.',
    },
  },
  gallery: {
    en: {
      title: 'Art Gallery — Ben Oz',
      description: 'Explore digital artworks and visual collections by Ben Oz, including The Hidden Geometry of the Soul and Pearls of Truth.',
    },
    he: {
      title: 'גלריית אמנות — בן עוז',
      description: 'גלו יצירות אמנות דיגיטליות ואוספים חזותיים מאת בן עוז, ובהם הגאומטריה הנסתרת של הנפש ופניני אמת.',
    },
  },
  music: {
    en: {
      title: 'Original Music — Ben Oz',
      description: 'Listen to original music by Ben Oz, created as part of a multidisciplinary dialogue between image, poetry, sound and movement.',
    },
    he: {
      title: 'מוזיקה מקורית — בן עוז',
      description: 'האזינו למוזיקה מקורית מאת בן עוז, שנוצרה כחלק מדיאלוג רב־תחומי בין דימוי, שירה, צליל ותנועה.',
    },
  },
  story: {
    en: {
      title: 'Artist Story — Ben Oz',
      description: 'Discover the story and creative process behind Ben Oz’s digital art, music, poetry and film from southern Israel.',
    },
    he: {
      title: 'סיפור האמן — בן עוז',
      description: 'גלו את הסיפור ואת תהליך היצירה שמאחורי האמנות הדיגיטלית, המוזיקה, השירה והקולנוע של בן עוז מדרום ישראל.',
    },
  },
  exhibitions: {
    en: {
      title: 'Exhibitions — Ben Oz',
      description: 'View current exhibition information for Ben Oz, including works from The Hidden Geometry of the Soul presented by artists of southern Israel.',
    },
    he: {
      title: 'תערוכות — בן עוז',
      description: 'צפו במידע על התערוכות הנוכחיות של בן עוז, ובהן עבודות מהגאומטריה הנסתרת של הנפש המוצגות לצד אמנים מדרום ישראל.',
    },
  },
  contact: {
    en: {
      title: 'Contact Ben Oz — Artwork Enquiries',
      description: 'Contact artist Ben Oz for artwork availability, collection enquiries and further information about the digital gallery.',
    },
    he: {
      title: 'יצירת קשר עם בן עוז — בירור על יצירות',
      description: 'צרו קשר עם האמן בן עוז לבירור זמינות יצירות, שאלות על האוספים ומידע נוסף על הגלריה הדיגיטלית.',
    },
  },
};

export function normalizeLanguage(value) {
  return String(value || '').toLowerCase() === 'he' ? 'he' : 'en';
}

export function languageFromLocation(locationLike = {}) {
  return normalizeLanguage(new URLSearchParams(locationLike.search || '').get('lang'));
}

export function plainText(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function absoluteUrl(path, siteUrl) {
  if (!path) return siteUrl;
  try {
    return new URL(path, `${siteUrl}/`).href;
  } catch {
    return siteUrl;
  }
}

function canonicalPath(route) {
  if (route.view === VIEW_COLLECTION || route.view === VIEW_COLLECTIONS) return SITE_PATHS.gallery;
  if (route.view === VIEW_ENTRY) return SITE_PATHS.home;
  if (route.page === PAGE_MUSIC) return SITE_PATHS.music;
  if (route.page === PAGE_STORY) return SITE_PATHS.story;
  if (route.page === PAGE_EXHIBITIONS) return SITE_PATHS.exhibitions;
  if (route.page === PAGE_CONTACT) return SITE_PATHS.contact;
  return SITE_PATHS.home;
}

function routeSearch(route, collection, language) {
  const params = new URLSearchParams();
  if (route.view === VIEW_COLLECTION && collection) {
    params.set('collection', collection.slug || collection.id);
  }
  if (language === 'he') params.set('lang', 'he');
  const search = params.toString();
  return search ? `?${search}` : '';
}

function localizedCollectionCopy(collection, language) {
  const isHebrew = language === 'he';
  const title = plainText(isHebrew ? collection.titleHe : collection.title) || (isHebrew ? 'אוסף אמנות' : 'Art Collection');
  const sourceDescription = plainText(isHebrew ? collection.descriptionHe : collection.description);
  const description = isHebrew
    ? `גלו את ${title}, אוסף אמנות חזותית מאת בן עוז.${sourceDescription ? ` ${sourceDescription}` : ''}`
    : `Explore ${title}, a visual art collection by Ben Oz.${sourceDescription ? ` ${sourceDescription}` : ''}`;
  return {
    title: isHebrew ? `${title} — אוסף מאת בן עוז` : `${title} — Art Collection by Ben Oz`,
    description,
  };
}

function pageKey(route) {
  if (route.view === VIEW_COLLECTIONS) return 'gallery';
  if (route.page === PAGE_MUSIC) return 'music';
  if (route.page === PAGE_STORY) return 'story';
  if (route.page === PAGE_EXHIBITIONS) return 'exhibitions';
  if (route.page === PAGE_CONTACT) return 'contact';
  return 'home';
}

function artworkSchema(work, collection, siteUrl, canonicalUrl, language) {
  const isHebrew = language === 'he';
  const name = plainText(isHebrew ? work.titleHe : work.titleEn)
    || plainText(work.titleEn || work.titleHe)
    || (isHebrew ? 'יצירה מאת בן עוז' : 'Artwork by Ben Oz');
  const description = plainText(isHebrew ? work.descriptionHe : work.descriptionEn)
    || plainText(work.descriptionEn || work.descriptionHe);
  return {
    '@type': 'VisualArtwork',
    '@id': `${canonicalUrl}#${encodeURIComponent(work.id)}`,
    name,
    ...(description ? { description } : {}),
    image: absoluteUrl(work.image || work.thumbnail, siteUrl),
    artform: 'Digital Art',
    creator: { '@id': `${siteUrl}/#artist` },
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: plainText(isHebrew ? collection.titleHe : collection.title),
    },
  };
}

function songSchema(song, siteUrl, canonicalUrl, language) {
  const isHebrew = language === 'he';
  return {
    '@type': 'MusicRecording',
    '@id': `${canonicalUrl}#${encodeURIComponent(song.id)}`,
    name: plainText(isHebrew ? song.titleHe : song.titleEn) || plainText(song.title),
    byArtist: { '@id': `${siteUrl}/#artist` },
    ...(song.audio ? { contentUrl: absoluteUrl(song.audio, siteUrl) } : {}),
    ...(song.cover ? { image: absoluteUrl(song.cover, siteUrl) } : {}),
    ...(plainText(isHebrew ? song.noteHe : song.noteEn)
      ? { description: plainText(isHebrew ? song.noteHe : song.noteEn) }
      : {}),
  };
}

export function buildSeoModel({
  route,
  content,
  language = 'en',
  siteUrl = DEFAULT_SITE_URL,
} = {}) {
  const lang = normalizeLanguage(language);
  const cleanSiteUrl = String(siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '');
  const collection = route?.view === VIEW_COLLECTION
    ? content?.collections?.find((item) => item.id === route.collectionId)
    : null;
  const copy = collection
    ? localizedCollectionCopy(collection, lang)
    : PAGE_COPY[pageKey(route || {})][lang];
  const pathname = canonicalPath(route || {});
  const baseSearch = routeSearch(route || {}, collection, 'en');
  const hebrewSearch = routeSearch(route || {}, collection, 'he');
  const defaultUrl = absoluteUrl(`${pathname}${baseSearch}`, cleanSiteUrl);
  const hebrewUrl = absoluteUrl(`${pathname}${hebrewSearch}`, cleanSiteUrl);
  const canonical = lang === 'he' ? hebrewUrl : defaultUrl;
  const imagePath = collection?.cover || DEFAULT_SOCIAL_IMAGE;
  const image = absoluteUrl(imagePath, cleanSiteUrl);
  const graph = [
    {
      '@type': 'WebSite',
      '@id': `${cleanSiteUrl}/#website`,
      url: `${cleanSiteUrl}/`,
      name: SITE_NAME,
      inLanguage: ['en', 'he'],
      publisher: { '@id': `${cleanSiteUrl}/#artist` },
    },
    {
      '@type': 'Person',
      '@id': `${cleanSiteUrl}/#artist`,
      name: ARTIST_NAME,
      alternateName: 'בן עוז',
      url: `${cleanSiteUrl}/`,
      image: absoluteUrl(DEFAULT_SOCIAL_IMAGE, cleanSiteUrl),
      additionalType: 'https://schema.org/VisualArtist',
      jobTitle: lang === 'he' ? 'אמן רב־תחומי' : 'Multidisciplinary Artist',
    },
    {
      '@type': collection ? 'CollectionPage' : 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: copy.title,
      description: copy.description,
      inLanguage: lang,
      isPartOf: { '@id': `${cleanSiteUrl}/#website` },
      primaryImageOfPage: { '@type': 'ImageObject', url: image },
    },
  ];

  if (collection) {
    graph.push({
      '@type': 'CreativeWorkSeries',
      '@id': `${canonical}#collection`,
      name: plainText(lang === 'he' ? collection.titleHe : collection.title),
      description: copy.description,
      image,
      creator: { '@id': `${cleanSiteUrl}/#artist` },
      hasPart: (collection.works || []).map((work) => artworkSchema(work, collection, cleanSiteUrl, canonical, lang)),
    });
  }

  if (route?.page === PAGE_MUSIC) {
    graph.push(...(content?.songs || []).map((song) => songSchema(song, cleanSiteUrl, canonical, lang)));
  }

  return {
    title: copy.title,
    description: copy.description,
    canonical,
    robots: 'index, follow',
    language: lang,
    direction: lang === 'he' ? 'rtl' : 'ltr',
    alternates: {
      en: defaultUrl,
      he: hebrewUrl,
      'x-default': defaultUrl,
    },
    openGraph: {
      type: collection ? 'website' : 'website',
      title: copy.title,
      description: copy.description,
      url: canonical,
      image,
      siteName: SITE_NAME,
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      image,
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': graph,
    },
  };
}

export { PAGE_COPY };
