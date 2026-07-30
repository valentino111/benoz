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
    assert.equal(typeof (work.songId || ''), 'string');
    assert.equal('songIds' in work, false);
    assert.equal('media' in work, false);
    assert.equal('textEn' in work, false);
    assert.equal('textHe' in work, false);
  });
});

test('bundled Songs contain media while Works own the relationship', () => {
  songs.forEach((song) => {
    assert.equal(typeof song.order, 'number');
    assert.equal('relatedWorkIds' in song, false);
    assert.equal(typeof song.audio, 'string');
    assert.equal('cover' in song, false);
    assert.equal('video' in song, false);
  });
  assert.equal(exhibitionWorks.find(({ id }) => id === 'inner-light').songId, 'yofi');
  assert.equal(exhibitionWorks.find(({ id }) => id === 'hidden-harmony').songId, 'lihyot');
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
      songId: 'yofi',
      available: 'FALSE',
      price: '',
    }],
    Songs: [{
      enabled: 'TRUE',
      sort: '10',
      id: 'yofi',
      titleEn: 'Remote Yofi',
      titleHe: 'יופי מרוחק',
      audio: 'remote-yofi.mp3',
      artist: 'Ignored artist',
      cover: 'ignored-cover.jpg',
      video: 'ignored-video.mp4',
      relatedWorkIds: 'work-1',
      noteEn: 'Ignored note',
      noteHe: 'הערה שלא בשימוש',
    }],
  });

  assert.deepEqual(Object.keys(fallback.works[0]).sort(), Object.keys(remote.works[0]).sort());
  assert.deepEqual(Object.keys(fallback.songs[0]).sort(), Object.keys(remote.songs[0]).sort());
  assert.deepEqual(Object.keys(fallback.collections[0]).sort(), Object.keys(remote.collections[0]).sort());
  assert.equal(remote.works[0].songId, 'yofi');
  assert.equal(remote.songs[0].audio, '/assets/remote-yofi.mp3');
  assert.equal(remote.songs[0].titleEn, 'Remote Yofi');
  assert.equal('artist' in remote.songs[0], false);
  assert.equal('cover' in remote.songs[0], false);
  assert.equal('video' in remote.songs[0], false);
  assert.equal('relatedWorkIds' in remote.songs[0], false);
  assert.equal('noteEn' in remote.songs[0], false);
});
