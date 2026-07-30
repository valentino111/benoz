import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ContentDataError,
  isSafeAssetPath,
  parseBoolean,
  parseCsv,
  parsePrice,
  validateCanonicalContent,
  validateSheetRows,
} from '../src/data/contentValidation.js';
import { fallbackContent, loadGalleryContent } from '../src/data/contentService.js';

test('CSV parsing preserves quoted commas and rejects malformed quoted data', () => {
  const rows = parseCsv('id,titleEn\nwork-1,"Light, Within"\n', 'Works');
  assert.equal(rows[0].titleEn, 'Light, Within');
  assert.throws(
    () => parseCsv('id,titleEn\nwork-1,"unfinished', 'Works'),
    (error) => error instanceof ContentDataError && error.category === 'parsing',
  );
});

test('boolean and asset validation is strict and safe', () => {
  assert.deepEqual(parseBoolean(' TRUE '), { valid: true, value: true });
  assert.equal(parseBoolean('yes').valid, false);
  assert.equal(isSafeAssetPath('assets/inner-light.jpg'), true);
  assert.equal(isSafeAssetPath('https://example.com/image.jpg'), true);
  assert.equal(isSafeAssetPath('‎⁨חיים-הם-תערובת-(remastered)⁩.mp3'), true);
  assert.equal(isSafeAssetPath('javascript:alert(1)'), false);
  assert.equal(isSafeAssetPath('../private/file.jpg'), false);
  assert.equal(isSafeAssetPath('safe-\u202eevil.mp3'), false);
  assert.deepEqual(parsePrice('₪3,400'), { valid: true, value: 3400, display: '₪3,400' });
  assert.equal(parsePrice('ask <script>').valid, false);
});

test('sheet validation ignores duplicates and invalid relationships deterministically', () => {
  const result = validateSheetRows({
    Collections: [
      { id: 'exhibition', enabled: 'TRUE', sort: '1', titleEn: 'Exhibition', titleHe: 'תערוכה', posterImage: 'cover.jpg' },
      { id: 'exhibition', enabled: 'TRUE', sort: '2', titleEn: 'Duplicate', titleHe: 'כפול' },
    ],
    Works: [
      { id: 'work-1', collectionId: 'exhibition', enabled: 'TRUE', available: 'FALSE', sort: '1', titleEn: 'Work', titleHe: 'יצירה', image: 'work.jpg', songId: 'yofi' },
      { id: 'orphan', collectionId: 'missing', enabled: 'TRUE', available: 'FALSE', sort: '2', titleEn: 'Orphan', titleHe: 'יתום', image: 'orphan.jpg' },
      { id: 'unknown-song', collectionId: 'exhibition', enabled: 'TRUE', available: 'FALSE', sort: '3', titleEn: 'Unknown Song', titleHe: 'שיר לא ידוע', image: 'work.jpg', songId: 'missing' },
    ],
    Songs: [
      { id: 'lihyot', enabled: 'TRUE', sort: '1', titleEn: 'Lihyot', titleHe: 'לחיות', audio: 'lihyot.mp3' },
      { id: 'yofi', enabled: 'TRUE', sort: '2', titleEn: 'Yofi', titleHe: 'יופי', audio: 'yofi.mp3' },
    ],
  });

  assert.deepEqual(result.rows.Collections.map(({ id }) => id), ['exhibition']);
  assert.deepEqual(result.rows.Works.map(({ id }) => id), ['work-1', 'unknown-song']);
  assert.equal(result.rows.Works[0].songId, 'yofi');
  assert.equal(result.rows.Works[1].songId, '');
  assert.deepEqual(result.rows.Songs.map(({ id }) => id), ['lihyot', 'yofi']);
  assert.ok(result.diagnostics.some(({ code }) => code === 'duplicate-id'));
  assert.ok(result.diagnostics.some(({ code }) => code === 'missing-reference'));
});

test('bundled fallback is canonical and contains both collections and all relationships', () => {
  const content = fallbackContent();
  assert.deepEqual(content.collections.map(({ id }) => id), ['exhibition', 'pearls-of-truth']);
  assert.equal(content.works.length, 9);
  assert.equal(validateCanonicalContent(content).length, 0);
  assert.equal(content.works.find(({ id }) => id === 'inner-light').songId, 'yofi');
  assert.equal(content.works.find(({ id }) => id === 'hidden-harmony').songId, 'lihyot');
  assert.equal('relatedWorkIds' in content.songs.find(({ id }) => id === 'yofi'), false);
  assert.equal('cover' in content.songs.find(({ id }) => id === 'yofi'), false);
});

test('remote loading fetches Collections, Works, and minimal Song metadata', async () => {
  const requestedSheets = [];
  const csvBySheet = {
    Collections: 'enabled,sort,id,titleEn,titleHe,posterImage\nTRUE,10,exhibition,Exhibition,תערוכה,cover.jpg\n',
    Works: 'enabled,sort,id,collectionId,titleEn,titleHe,image,available,price,songId\nTRUE,10,work-1,exhibition,Work,יצירה,work.jpg,FALSE,,yofi\n',
    Songs: 'enabled,sort,id,titleEn,titleHe,audio\nTRUE,10,yofi,Yofi,יופי,yofi.mp3\n',
  };
  const content = await loadGalleryContent({
    fetchImpl: async (url) => {
      const sheet = new URL(url).searchParams.get('sheet');
      requestedSheets.push(sheet);
      return { ok: true, text: async () => csvBySheet[sheet] };
    },
  });

  assert.deepEqual(requestedSheets, ['Collections', 'Works', 'Songs']);
  assert.equal(content.source, 'google-sheets');
  assert.equal(content.works[0].songId, 'yofi');
  assert.deepEqual(content.songs.map(({ id }) => id), ['yofi']);
  assert.equal(content.songs[0].audio, '/assets/yofi.mp3');
});

test('a failed sheet request falls back without leaving the loader pending', async () => {
  const diagnostics = [];
  const fetchImpl = async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  const content = await loadGalleryContent({ fetchImpl, timeoutMs: 5, onDiagnostic: (value) => diagnostics.push(value) });
  assert.equal(content.source, 'local-fallback');
  assert.equal(diagnostics[0].category, 'timeout');
});

test('network and parsing failures retain distinct diagnostic categories', async () => {
  const networkDiagnostics = [];
  await loadGalleryContent({
    fetchImpl: async () => { throw new TypeError('offline'); },
    onDiagnostic: (value) => networkDiagnostics.push(value),
  });
  assert.equal(networkDiagnostics[0].category, 'network');

  const parsingDiagnostics = [];
  await loadGalleryContent({
    fetchImpl: async () => ({ ok: true, text: async () => 'id,titleEn\nwork-1,"unfinished' }),
    onDiagnostic: (value) => parsingDiagnostics.push(value),
  });
  assert.equal(parsingDiagnostics[0].category, 'parsing');
});
