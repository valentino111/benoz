import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectionPageUrl,
  collectionSelectionUrl,
  createCollectionPage,
  getCollectionWorks,
  resolveCollectionFromSearch,
} from '../src/data/collectionPages.js';
import {
  buildRemoteContent,
  fallbackContent,
  normalizeCollection,
  normalizeCollections,
} from '../src/data/contentService.js';
import { validateSheetRows } from '../src/data/contentValidation.js';
import {
  COLLECTION_HERO_LOGO,
  getCollectionHeroModel,
} from '../src/data/collectionPresentation.js';

const baseCollections = [
  { id: 'exhibition', slug: 'exhibition', title: 'Exhibition' },
  { id: 'pearls-of-truth', slug: 'pearls-of-truth', title: 'Pearls of Truth' },
];

const mixedWorks = [
  { id: 'exhibition-later', collectionId: 'exhibition', order: 20, sourceOrder: 0 },
  { id: 'pearl-first', collectionId: 'pearls-of-truth', order: 10, sourceOrder: 1 },
  { id: 'exhibition-first', collectionId: 'exhibition', order: 10, sourceOrder: 2 },
  { id: 'pearl-later', collectionId: 'pearls-of-truth', order: 20, sourceOrder: 3 },
];

function collectionRow(overrides = {}) {
  return {
    enabled: 'TRUE',
    sort: '10',
    id: 'exhibition',
    titleEn: 'Exhibition',
    titleHe: 'קולות העוטף',
    posterImage: '',
    posterVideo: '',
    descriptionEn: '',
    descriptionHe: '',
    slug: 'exhibition',
    ...overrides,
  };
}

function workRow(overrides = {}) {
  return {
    enabled: 'TRUE',
    sort: '10',
    id: 'work',
    collectionId: 'exhibition',
    titleEn: 'Work',
    titleHe: 'יצירה',
    image: 'work.jpg',
    available: 'FALSE',
    price: '',
    ...overrides,
  };
}

test('Exhibition selection contains only Exhibition works', () => {
  const page = createCollectionPage(baseCollections[0], mixedWorks);
  assert.deepEqual(page.works.map(({ id }) => id), ['exhibition-first', 'exhibition-later']);
});

test('Pearls of Truth selection contains only Pearls works', () => {
  const page = createCollectionPage(baseCollections[1], mixedWorks);
  assert.deepEqual(page.works.map(({ id }) => id), ['pearl-first', 'pearl-later']);
});

test('each collection page keeps its own title and intro data', () => {
  const exhibition = createCollectionPage({ ...baseCollections[0], description: 'Exhibition intro' }, mixedWorks);
  const pearls = createCollectionPage({ ...baseCollections[1], description: 'Pearls intro' }, mixedWorks);
  assert.deepEqual(
    [exhibition.title, exhibition.description, pearls.title, pearls.description],
    ['Exhibition', 'Exhibition intro', 'Pearls of Truth', 'Pearls intro'],
  );
});

test('works are filtered by collection before numeric local ordering', () => {
  const works = [
    { id: 'other-lowest', collectionId: 'pearls-of-truth', order: 1, sourceOrder: 0 },
    { id: 'selected-last', collectionId: ' exhibition ', order: 30, sourceOrder: 1 },
    { id: 'selected-first', collectionId: 'exhibition', order: 10, sourceOrder: 2 },
  ];
  assert.deepEqual(getCollectionWorks(works, 'exhibition').map(({ id }) => id), ['selected-first', 'selected-last']);
});

test('the same sort values are independent across collections with stable ties', () => {
  const works = [
    { id: 'exhibition-a', collectionId: 'exhibition', order: 10, sourceOrder: 0 },
    { id: 'pearl-a', collectionId: 'pearls-of-truth', order: 10, sourceOrder: 1 },
    { id: 'exhibition-b', collectionId: 'exhibition', order: 10, sourceOrder: 2 },
    { id: 'pearl-b', collectionId: 'pearls-of-truth', order: 10, sourceOrder: 3 },
  ];
  assert.deepEqual(getCollectionWorks(works, 'exhibition').map(({ id }) => id), ['exhibition-a', 'exhibition-b']);
  assert.deepEqual(getCollectionWorks(works, 'pearls-of-truth').map(({ id }) => id), ['pearl-a', 'pearl-b']);
});

test('remote intro fields preserve fallback values when empty and override when non-empty', () => {
  const [preserved] = normalizeCollections([collectionRow({ descriptionEn: '   ' })]);
  const [overridden] = normalizeCollections([collectionRow({ descriptionEn: 'Remote exhibition intro' })]);
  assert.match(preserved.description, /Ideas become Poetry/);
  assert.equal(overridden.description, 'Remote exhibition intro');
});

test('query navigation resolves a selected collection and browser-back selection URL', () => {
  const initialLocation = { href: 'https://gallery.example/gallery?preview=true' };
  const pageUrl = collectionPageUrl(baseCollections[1], initialLocation);
  const selected = resolveCollectionFromSearch(baseCollections, new URL(pageUrl, 'https://gallery.example').search);
  const backUrl = collectionSelectionUrl({ href: `https://gallery.example${pageUrl}#pearl-first` });
  assert.equal(pageUrl, '/gallery?preview=true&collection=pearls-of-truth');
  assert.equal(selected.id, 'pearls-of-truth');
  assert.equal(backUrl, '/gallery?preview=true');
  assert.equal(resolveCollectionFromSearch(baseCollections, new URL(backUrl, 'https://gallery.example').search), null);
});

test('disabled collections and works remain absent from collection pages', () => {
  const validated = validateSheetRows({
    Collections: [collectionRow(), collectionRow({ enabled: 'FALSE', id: 'hidden', slug: 'hidden' })],
    Works: [workRow(), workRow({ enabled: 'FALSE', id: 'hidden-work' })],
    Songs: [],
  });
  const content = buildRemoteContent(validated.rows);
  assert.deepEqual(content.collections.map(({ id }) => id), ['exhibition']);
  assert.deepEqual(content.collections[0].works.map(({ id }) => id), ['work']);
});

test('English and Hebrew collection intro content remains available to the page', () => {
  const content = fallbackContent();
  const exhibition = content.collections.find(({ id }) => id === 'exhibition');
  assert.equal(exhibition.subtitleEn, 'The Hidden Geometry\nof the Soul');
  assert.equal(exhibition.subtitleHe, 'הגאומטריה הנסתרת של הנפש');
  assert.match(exhibition.description, /Cinema becomes Memory/);
  assert.match(exhibition.descriptionHe, /קולנוע הופך לזיכרון/);
});

test('the first collection retains its established hero structure and content data', () => {
  const exhibition = fallbackContent().collections[0];
  const hero = getCollectionHeroModel(exhibition);
  assert.deepEqual(
    {
      pageId: exhibition.pageId,
      heroImage: hero.logoSrc,
      noteEn: exhibition.noteEn,
      noteHe: exhibition.noteHe,
      workIds: exhibition.works.map(({ id }) => id),
    },
    {
      pageId: 'gallery',
      heroImage: '/assets/brand/ben-oz-logo-gold-transparent.png',
      noteEn: 'The complete series consists of six works. Four are presented in the current exhibition. Each artwork is available in its original artistic version with integrated text, where typography is an essential part of the composition, or as a clean image without text, according to the collector’s preference.',
      noteHe: 'הסדרה המלאה כוללת שש עבודות. ארבע מתוכן משתתפות בתערוכה הנוכחית. כל יצירה זמינה בגרסתה האמנותית המקורית, שבה הטקסט מהווה חלק בלתי נפרד מהקומפוזיציה, או בגרסה נקייה ללא טקסט – בהתאם להעדפת האספן.',
      workIds: [
        'human-creator',
        'gaze-of-compassion',
        'inner-light',
        'hidden-harmony',
        'fragility-of-love',
        'gate-to-infinity',
      ],
    },
  );
});

test('Pearls of Truth English intro renders its English text', () => {
  const pearls = fallbackContent().collections.find(({ id }) => id === 'pearls-of-truth');
  const hero = getCollectionHeroModel(pearls);
  assert.equal(hero.en.intro, 'A collection where words, images, music and motion meet.');
  assert.equal(hero.he.intro, '');
});

test('Pearls of Truth Hebrew intro renders approved descriptionHe text', () => {
  const fallback = fallbackContent().collections.find(({ id }) => id === 'pearls-of-truth');
  const pearls = normalizeCollection(collectionRow({
    id: 'pearls-of-truth',
    titleEn: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    descriptionHe: 'תיאור עברי מאושר לבדיקה',
    slug: 'pearls-of-truth',
  }), fallback, 1);
  assert.equal(getCollectionHeroModel(pearls).he.intro, 'תיאור עברי מאושר לבדיקה');
});

test('empty remote Pearls Hebrew intro preserves a valid fallback descriptionHe', () => {
  const fallback = {
    ...fallbackContent().collections.find(({ id }) => id === 'pearls-of-truth'),
    descriptionHe: 'תיאור עברי מאושר לבדיקה',
  };
  const pearls = normalizeCollection(collectionRow({
    id: 'pearls-of-truth',
    titleEn: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    descriptionHe: '   ',
    slug: 'pearls-of-truth',
  }), fallback, 1);
  assert.equal(pearls.descriptionHe, 'תיאור עברי מאושר לבדיקה');
});

test('every collection intro uses the canonical Ben Oz logo', () => {
  const heroes = fallbackContent().collections.map(getCollectionHeroModel);
  assert.ok(heroes.every(({ logoSrc }) => logoSrc === COLLECTION_HERO_LOGO));
  assert.equal(COLLECTION_HERO_LOGO, '/assets/brand/ben-oz-logo-gold-transparent.png');
});

test('Pearls collection card keeps its remote poster while its intro uses the logo', () => {
  const fallback = fallbackContent().collections.find(({ id }) => id === 'pearls-of-truth');
  const pearls = normalizeCollection(collectionRow({
    id: 'pearls-of-truth',
    titleEn: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    posterImage: 'pearls-of-truth-poster.jpg',
    slug: 'pearls-of-truth',
  }), fallback, 1);
  assert.equal(pearls.cover, '/images/web/pearls-of-truth-poster-thumb.webp');
  assert.equal(getCollectionHeroModel(pearls).logoSrc, COLLECTION_HERO_LOGO);
  assert.notEqual(pearls.cover, getCollectionHeroModel(pearls).logoSrc);
});

test('Exhibition retains its established bilingual hero and canonical logo', () => {
  const exhibition = fallbackContent().collections.find(({ id }) => id === 'exhibition');
  const hero = getCollectionHeroModel(exhibition);
  assert.equal(hero.en.title, 'The Hidden Geometry\nof the Soul');
  assert.equal(hero.he.title, 'הגאומטריה הנסתרת של הנפש');
  assert.match(hero.en.intro, /Cinema becomes Memory/);
  assert.match(hero.he.intro, /קולנוע הופך לזיכרון/);
  assert.equal(hero.logoSrc, COLLECTION_HERO_LOGO);
});

test('collection hero English and Hebrew directions remain explicit', () => {
  const pearls = getCollectionHeroModel({
    title: 'Pearls of Truth',
    titleHe: 'פניני אמת',
    description: 'English intro',
    descriptionHe: 'תיאור עברי מאושר לבדיקה',
  });
  assert.deepEqual(
    [pearls.en.language, pearls.en.direction, pearls.he.language, pearls.he.direction],
    ['en', 'ltr', 'he', 'rtl'],
  );
});
