import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fallbackContent } from '../src/data/contentService.js';
import {
  PAGE_CONTACT,
  PAGE_EXHIBITIONS,
  PAGE_STORY,
  VIEW_COLLECTION,
  VIEW_COLLECTIONS,
  VIEW_ENTRY,
  VIEW_PAGE,
} from '../src/data/siteRoutes.js';
import {
  buildSeoModel,
  DEFAULT_SITE_URL,
  languageFromLocation,
  plainText,
} from '../src/seo/seo.js';

const content = fallbackContent();
const routes = [
  { key: 'home', view: VIEW_ENTRY, collectionId: '', page: '' },
  { key: 'gallery', view: VIEW_COLLECTIONS, collectionId: '', page: '' },
  { key: 'story', view: VIEW_PAGE, collectionId: '', page: PAGE_STORY },
  { key: 'exhibitions', view: VIEW_PAGE, collectionId: '', page: PAGE_EXHIBITIONS },
  { key: 'contact', view: VIEW_PAGE, collectionId: '', page: PAGE_CONTACT },
];

test('every static page has unique localized titles and descriptions', () => {
  ['en', 'he'].forEach((language) => {
    const models = routes.map((route) => buildSeoModel({ route, content, language }));
    assert.equal(new Set(models.map(({ title }) => title)).size, routes.length);
    assert.equal(new Set(models.map(({ description }) => description)).size, routes.length);
    models.forEach((model) => {
      assert.ok(model.title.length > 10);
      assert.ok(model.description.length > 40);
      assert.equal(model.robots, 'index, follow');
      assert.equal(model.language, language);
      assert.equal(model.direction, language === 'he' ? 'rtl' : 'ltr');
    });
  });
});

test('collection SEO is dynamically formed from collection content', () => {
  const collection = content.collections.find(({ id }) => id === 'pearls-of-truth');
  const route = { view: VIEW_COLLECTION, collectionId: collection.id, page: '' };
  const english = buildSeoModel({ route, content, language: 'en' });
  const hebrew = buildSeoModel({ route, content, language: 'he' });

  assert.match(english.title, /Pearls of Truth/);
  assert.match(hebrew.title, /פניני אמת/);
  assert.match(english.description, /words, images, music and motion/);
  assert.equal(english.canonical, `${DEFAULT_SITE_URL}/gallery?collection=pearls-of-truth`);
  assert.equal(hebrew.canonical, `${DEFAULT_SITE_URL}/gallery?collection=pearls-of-truth&lang=he`);
  assert.equal(english.openGraph.image.startsWith(`${DEFAULT_SITE_URL}/`), true);
});

test('hreflang URLs are real variants of the existing route architecture', () => {
  const model = buildSeoModel({
    route: routes.find(({ key }) => key === 'story'),
    content,
    language: 'he',
  });
  assert.equal(model.alternates.en, `${DEFAULT_SITE_URL}/story`);
  assert.equal(model.alternates.he, `${DEFAULT_SITE_URL}/story?lang=he`);
  assert.equal(model.alternates['x-default'], model.alternates.en);
  assert.equal(languageFromLocation({ search: '?lang=he' }), 'he');
  assert.equal(languageFromLocation({ search: '?lang=en' }), 'en');
});

test('structured data matches actual collections, artworks, and their songs', () => {
  const collectionModel = buildSeoModel({
    route: { view: VIEW_COLLECTION, collectionId: 'exhibition', page: '' },
    content,
    language: 'en',
  });
  const collectionSchema = collectionModel.structuredData['@graph']
    .find(({ '@type': type }) => type === 'CreativeWorkSeries');
  assert.ok(collectionSchema);
  assert.equal(collectionSchema.hasPart.length, content.collections[0].works.length);
  assert.ok(collectionSchema.hasPart.every(({ '@type': type }) => type === 'VisualArtwork'));

  const referencedSongIds = new Set(content.collections[0].works.flatMap((work) => work.songIds || []));
  assert.equal(
    collectionModel.structuredData['@graph'].filter(({ '@type': type }) => type === 'MusicRecording').length,
    referencedSongIds.size,
  );
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(collectionModel.structuredData)));
});

test('spreadsheet text is reduced to plain text for metadata', () => {
  assert.equal(plainText('<strong>Art</strong>\nwithout markup'), 'Art without markup');
});

test('static SEO files expose crawler, social, favicon, and language metadata', async () => {
  const [index, manifest, robots, sitemap] = await Promise.all([
    readFile(new URL('../index.html', import.meta.url), 'utf8'),
    readFile(new URL('../public/site.webmanifest', import.meta.url), 'utf8'),
    readFile(new URL('../public/robots.txt', import.meta.url), 'utf8'),
    readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8'),
  ]);
  assert.match(index, /property="og:title"/);
  assert.match(index, /name="twitter:card"/);
  assert.match(index, /hreflang="x-default"/);
  assert.match(index, /application\/ld\+json/);
  assert.match(manifest, /favicon-256\.png/);
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/ben-oz-art-v8\.netlify\.app\/sitemap\.xml/);
  assert.match(sitemap, /gallery\?collection=pearls-of-truth&amp;lang=he/);
  assert.match(sitemap, /hreflang="he"/);
});
