import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRemoteContent,
  fallbackContent,
  normalizeCollections,
} from '../src/data/contentService.js';
import { validateSheetRows } from '../src/data/contentValidation.js';

function collection(overrides = {}) {
  return {
    enabled: 'TRUE',
    sort: '10',
    id: 'exhibition',
    titleEn: 'Exhibition',
    titleHe: 'תערוכה',
    posterImage: '',
    ...overrides,
  };
}

function work(overrides = {}) {
  return {
    enabled: 'TRUE',
    sort: '10',
    id: 'work-1',
    collectionId: 'exhibition',
    titleEn: 'Work',
    titleHe: 'יצירה',
    image: 'work.jpg',
    available: 'FALSE',
    price: '',
    ...overrides,
  };
}

function validatedContent(Collections, Works) {
  const validated = validateSheetRows({ Collections, Works });
  return { validated, content: buildRemoteContent(validated.rows) };
}

test('an empty remote collection cover preserves the matching local cover', () => {
  const [normalized] = normalizeCollections([collection({ posterImage: '   ' })]);
  assert.equal(normalized.cover, '/images/web/hidden-harmony-thumb.webp');
  assert.equal(normalized.fallbackCover, '/images/web/hidden-harmony-thumb.webp');
});

test('a non-empty remote collection cover overrides while retaining the local fallback layer', () => {
  const [normalized] = normalizeCollections([collection({ posterImage: 'approved-poster.jpg' })]);
  assert.equal(normalized.cover, '/assets/approved-poster.jpg');
  assert.equal(normalized.fallbackCover, '/images/web/hidden-harmony-thumb.webp');
});

test('an enabled Work assigned to the second collection is attached to its collection page', () => {
  const { validated, content } = validatedContent(
    [collection({ id: 'pearls-of-truth', titleEn: 'Pearls of Truth', titleHe: 'פניני אמת' })],
    [work({ id: 'pearl-work', collectionId: 'pearls-of-truth' })],
  );
  const pearls = content.collections.find(({ id }) => id === 'pearls-of-truth');

  assert.equal(validated.diagnostics.length, 0);
  assert.deepEqual(pearls.works.map(({ id }) => id), ['pearl-work']);
  assert.equal(pearls.pageId, 'collection-pearls-of-truth');
});

test('collection IDs and Work references are trimmed before deterministic matching', () => {
  const { validated, content } = validatedContent(
    [collection({ id: '  pearls-of-truth  ', titleEn: 'Pearls of Truth', titleHe: 'פניני אמת' })],
    [work({ id: '  pearl-work  ', collectionId: '  pearls-of-truth  ' })],
  );

  assert.equal(validated.diagnostics.length, 0);
  assert.equal(validated.rows.Collections[0].id, 'pearls-of-truth');
  assert.equal(validated.rows.Works[0].collectionId, 'pearls-of-truth');
  assert.deepEqual(content.collections[0].works.map(({ id }) => id), ['pearl-work']);
});

test('an enabled public Work without an image is excluded with an exact media diagnostic', () => {
  const { rows, diagnostics, drafts } = validateSheetRows({
    Collections: [collection()],
    Works: [work({ id: 'missing-image', image: '' })],
  });
  const diagnostic = diagnostics.find(({ id }) => id === 'missing-image');

  assert.equal(rows.Works.length, 0);
  assert.equal(drafts.length, 0);
  assert.deepEqual(
    {
      sheet: diagnostic.sheet,
      row: diagnostic.row,
      id: diagnostic.id,
      field: diagnostic.field,
      code: diagnostic.code,
      classification: diagnostic.classification,
    },
    {
      sheet: 'Works',
      row: 2,
      id: 'missing-image',
      field: 'image',
      code: 'missing-required-media',
      classification: 'enabled-public-missing-media',
    },
  );
  assert.match(diagnostic.reason, /missing required image media/);
});

test('a disabled Work remains an unpublished draft and is removed without a rejection', () => {
  const { rows, diagnostics, drafts } = validateSheetRows({
    Collections: [collection()],
    Works: [work({ id: 'draft-work', enabled: 'FALSE', image: '' })],
  });

  assert.equal(rows.Works.length, 0);
  assert.equal(diagnostics.length, 0);
  assert.deepEqual(drafts.map(({ id, classification }) => ({ id, classification })), [
    { id: 'draft-work', classification: 'draft' },
  ]);
});

test('fallback keeps Exhibition and Pearls of Truth works and covers intact', () => {
  const content = fallbackContent();
  const exhibition = content.collections.find(({ id }) => id === 'exhibition');
  const pearls = content.collections.find(({ id }) => id === 'pearls-of-truth');

  assert.equal(exhibition.cover, '/images/web/hidden-harmony-thumb.webp');
  assert.equal(exhibition.works.length, 6);
  assert.equal(exhibition.pageId, 'gallery');
  assert.equal(pearls.cover, '/images/web/cover-lachayot-thumb.webp');
  assert.equal(pearls.works.length, 3);
  assert.equal(pearls.pageId, 'collection-pearls-of-truth');
});
