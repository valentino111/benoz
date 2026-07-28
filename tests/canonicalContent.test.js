import test from 'node:test';
import assert from 'node:assert/strict';
import { exhibitionWorks } from '../src/collections/exhibition/works.js';
import { pearlsOfTruthWorks } from '../src/collections/pearls-of-truth/works.js';
import { buildRemoteContent, fallbackContent } from '../src/data/contentService.js';

test('all bundled Works use the canonical source shape', () => {
  const works = [...exhibitionWorks, ...pearlsOfTruthWorks];

  works.forEach((work) => {
    assert.equal(typeof work.order, 'number');
    assert.equal(typeof work.descriptionEn, 'string');
    assert.equal(typeof work.descriptionHe, 'string');
    assert.ok(Array.isArray(work.songIds));
    assert.equal('media' in work, false);
    assert.equal('textEn' in work, false);
    assert.equal('textHe' in work, false);
  });
});

test('Google Sheets and fallback Works normalize to the same runtime fields', () => {
  const fallbackWork = fallbackContent().works[0];
  const remoteWork = buildRemoteContent({
    Collections: [{
      id: 'exhibition',
      sort: '10',
      titleEn: 'Exhibition',
      titleHe: 'תערוכה',
      posterImage: '',
    }],
    Works: [{
      id: 'remote-work',
      collectionId: 'exhibition',
      sort: '10',
      titleEn: 'Remote Work',
      titleHe: 'יצירה מרוחקת',
      image: 'human-creator.jpg',
      available: 'FALSE',
      price: '',
    }],
    Songs: [],
  }).works[0];

  assert.deepEqual(Object.keys(fallbackWork).sort(), Object.keys(remoteWork).sort());
});
