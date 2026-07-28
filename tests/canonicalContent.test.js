import test from 'node:test';
import assert from 'node:assert/strict';
import { exhibitionWorks } from '../src/collections/exhibition/works.js';
import { pearlsOfTruthWorks } from '../src/collections/pearls-of-truth/works.js';
import { buildRemoteContent, fallbackContent } from '../src/data/contentService.js';
import { collections } from '../src/data/collections.js';
import { songs } from '../src/data/songs.js';

test('all bundled Collections use the canonical source shape', () => {
  collections.forEach((collection) => {
    assert.equal(typeof collection.sort, 'number');
    assert.equal(typeof collection.titleEn, 'string');
    assert.equal(typeof collection.descriptionEn, 'string');
    assert.equal(typeof collection.posterImage, 'string');
    assert.equal('order' in collection, false);
    assert.equal('title' in collection, false);
    assert.equal('description' in collection, false);
    assert.equal('cover' in collection, false);
  });
});

test('all bundled Works use the canonical source shape', () => {
  const works = [...exhibitionWorks, ...pearlsOfTruthWorks];

  works.forEach((work) => {
    assert.equal(typeof work.order, 'number');
    assert.equal(typeof work.descriptionEn, 'string');
    assert.equal(typeof work.descriptionHe, 'string');
    assert.equal('songIds' in work, false);
    assert.equal('media' in work, false);
    assert.equal('textEn' in work, false);
    assert.equal('textHe' in work, false);
  });
});

test('bundled Songs are the canonical source for Work relationships', () => {
  songs.forEach((song) => {
    assert.equal(typeof song.order, 'number');
    assert.ok(Array.isArray(song.relatedWorkIds));
    assert.equal(typeof song.video, 'string');
    assert.equal('animation' in song, false);
  });
});

test('Google Sheets and fallback content normalize to the same runtime fields', () => {
  const fallback = fallbackContent();
  const remote = buildRemoteContent({
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
    Songs: [{
      id: 'remote-song',
      sort: '10',
      titleEn: 'Remote Song',
      titleHe: 'שיר מרוחק',
      audio: 'song.mp3',
      cover: 'cover.jpg',
      video: 'song.mp4',
      relatedWorkIds: 'remote-work',
    }],
  });

  assert.deepEqual(Object.keys(fallback.works[0]).sort(), Object.keys(remote.works[0]).sort());
  assert.deepEqual(Object.keys(fallback.songs[0]).sort(), Object.keys(remote.songs[0]).sort());
  assert.deepEqual(Object.keys(fallback.collections[0]).sort(), Object.keys(remote.collections[0]).sort());
  assert.deepEqual(remote.works[0].songIds, ['remote-song']);
});
