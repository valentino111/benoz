import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  formatEdition,
  getEditionTranslations,
  normalizeEdition,
} from '../src/data/edition.js';
import { buildRemoteContent, fallbackContent } from '../src/data/contentService.js';
import { validateSheetRows } from '../src/data/contentValidation.js';

test('Edition formatter handles unique, numbered, string, and whitespace values', () => {
  assert.equal(formatEdition(1, 1, 'en').value, '1/1 (Unique Gallery Edition)');
  assert.equal(formatEdition('1', '1', 'en').value, '1/1 (Unique Gallery Edition)');
  assert.equal(formatEdition(1, 3, 'en').value, '1/3');
  assert.equal(formatEdition(2, 4, 'en').value, '2/4');
  assert.equal(formatEdition(' 1 ', ' 3 ', 'en').value, '1/3');
});

test('Edition formatter omits missing and invalid values safely', () => {
  [
    [undefined, undefined],
    [1, undefined],
    [undefined, 3],
    [0, 3],
    [-1, 3],
    [4, 3],
    ['not-a-number', 3],
    [1.5, 3],
  ].forEach(([number, total]) => {
    assert.equal(formatEdition(number, total, 'en'), null);
  });
});

test('Edition formatter localizes English and Hebrew from one normalized model', () => {
  const normalized = normalizeEdition(' 1 ', ' 1 ');
  const english = formatEdition(normalized.editionNumber, normalized.editionTotal, 'en');
  const hebrew = formatEdition(normalized.editionNumber, normalized.editionTotal, 'he');

  assert.deepEqual(normalized, { editionNumber: 1, editionTotal: 1 });
  assert.equal(english.text, 'Edition: 1/1 (Unique Gallery Edition)');
  assert.equal(hebrew.text, 'מהדורה: 1/1 (מהדורה יחידה)');
  assert.deepEqual(getEditionTranslations('he'), {
    label: 'מהדורה',
    unique: 'מהדורה יחידה',
  });
});

test('Google Sheets Works normalize valid Edition values and null invalid or absent values', () => {
  const collection = {
    enabled: 'TRUE',
    sort: '10',
    id: 'exhibition',
    titleEn: 'Exhibition',
    titleHe: 'תערוכה',
    posterImage: '',
  };
  const work = (overrides = {}) => ({
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
  });
  const build = (editionFields) => {
    const validated = validateSheetRows({
      Collections: [collection],
      Works: [work(editionFields)],
      Songs: [],
    });
    return buildRemoteContent(validated.rows).works[0];
  };

  assert.deepEqual(
    {
      editionNumber: build({ editionNumber: ' 2 ', editionTotal: ' 4 ' }).editionNumber,
      editionTotal: build({ editionNumber: ' 2 ', editionTotal: ' 4 ' }).editionTotal,
    },
    { editionNumber: 2, editionTotal: 4 },
  );
  assert.deepEqual(
    {
      editionNumber: build({ editionNumber: '4', editionTotal: '3' }).editionNumber,
      editionTotal: build({ editionNumber: '4', editionTotal: '3' }).editionTotal,
    },
    { editionNumber: null, editionTotal: null },
  );
  assert.equal(build({}).editionNumber, null);
  assert.ok(fallbackContent().works.every(({ editionNumber, editionTotal }) => (
    editionNumber === null && editionTotal === null
  )));
});

test('Edition UI renders in cards and details with an LTR fraction in Hebrew', async () => {
  const [gallery, overlays, legacy] = await Promise.all([
    readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Overlays.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/legacy.js', import.meta.url), 'utf8'),
  ]);

  assert.match(gallery, /className="edition-info"/);
  assert.match(gallery, /<bdi dir="ltr">\{editionHe\.fraction\}<\/bdi>/);
  assert.match(gallery, /data-edition-fraction=\{editionEn\?\.fraction \|\| ''\}/);
  assert.match(gallery, /available in two editions/i);
  assert.match(gallery, /data-description-en=\{work\.descriptionEn\}/);
  assert.match(overlays, /<bdi dir="ltr" id="dialogEditionFraction"><\/bdi>/);
  assert.match(overlays, /class="dialog-description" hidden id="dialogDescription"/);
  assert.match(overlays, /\$\{editionHe\.unique\}/);
  assert.match(overlays, /\$\{editionEn\.unique\}/);
  assert.match(legacy, /dialogEdition\.hidden=!editionFraction/);
  assert.match(legacy, /dialogDescriptionEn\.textContent=btn\.dataset\.descriptionEn \|\| ''/);
});
