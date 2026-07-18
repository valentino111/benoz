export const COLLECTION_HERO_LOGO = '/assets/brand/ben-oz-logo-gold-transparent.png';

export function getCollectionHeroModel(collection) {
  return {
    logoAlt: 'Ben Oz',
    logoSrc: COLLECTION_HERO_LOGO,
    en: {
      direction: 'ltr',
      intro: collection.description || '',
      language: 'en',
      title: collection.subtitleEn || collection.title || '',
    },
    he: {
      direction: 'rtl',
      intro: collection.descriptionHe || '',
      language: 'he',
      title: collection.subtitleHe || collection.titleHe || '',
    },
  };
}

