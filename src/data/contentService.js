import { collections as fallbackCollections } from './collections.js';
import { exhibitionWorks as fallbackWorks } from '../collections/exhibition/works.js';
import { songs as fallbackSongs } from './songs.js';

const SHEET_ID = '1qS2N_-BPKIP3zXuTYGSFe0zh18u7ECGdZxDspjJG0Ts';
const SHEET_NAMES = ['Collections', 'Works', 'Songs'];

function csvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value !== '')) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])));
}

function isTrue(value) {
  return String(value).trim().toLowerCase() === 'true';
}

function numberOr(value, fallback = 999) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function assetPath(fileName) {
  const value = String(fileName || '').trim();
  if (!value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) return value;
  return `assets/${value}`;
}

function enabledSorted(rows) {
  return rows.filter((row) => isTrue(row.enabled)).sort((a, b) => numberOr(a.sort) - numberOr(b.sort));
}

function normalizeCollections(rows) {
  return enabledSorted(rows).map((row, index) => ({
    id: row.id,
    number: String(index + 1).padStart(2, '0'),
    title: row.titleEn,
    titleHe: row.titleHe,
    type: row.id === 'pearls-of-truth' ? 'Poetry · Art · Music' : 'Visual Collection',
    description: row.descriptionEn || '',
    descriptionHe: row.descriptionHe || '',
    cover: assetPath(row.posterImage),
    posterVideo: assetPath(row.posterVideo),
    slug: row.slug || row.id,
    target: row.id === 'pearls-of-truth' ? 'music' : 'gallery',
  }));
}

function normalizeSongs(rows) {
  return enabledSorted(rows).map((row) => ({
    id: row.id,
    domId: `track-${row.id}`,
    title: row.titleHe || row.titleEn,
    titleEn: row.titleEn,
    titleHe: row.titleHe,
    artist: row.artist || 'Ben Oz',
    audio: assetPath(row.audio),
    cover: assetPath(row.cover),
    animation: assetPath(row.video),
    noteEn: row.noteEn || '',
    noteHe: row.noteHe || '',
    relatedWorkIds: String(row.relatedWorkIds || '').split(',').map((id) => id.trim()).filter(Boolean),
  }));
}

function normalizeWorks(rows, songs) {
  const songIdsByWork = new Map();
  songs.forEach((song) => {
    song.relatedWorkIds.forEach((workId) => {
      const current = songIdsByWork.get(workId) || [];
      current.push(song.id);
      songIdsByWork.set(workId, current);
    });
  });

  return enabledSorted(rows).map((row) => ({
    id: row.id,
    collectionId: row.collectionId,
    titleEn: row.titleEn,
    titleHe: row.titleHe,
    image: assetPath(row.image),
    video: assetPath(row.video),
    thumbnail: assetPath(row.thumbnail),
    statusEn: row.statusEn,
    statusHe: row.statusHe,
    meta: row.meta,
    descriptionEn: row.descriptionEn,
    descriptionHe: row.descriptionHe,
    collectorLabelEn: row.collectorLabelEn,
    collectorLabelHe: row.collectorLabelHe,
    availabilityEn: row.availabilityEn,
    availabilityHe: row.availabilityHe,
    available: isTrue(row.available),
    price: row.price,
    songIds: songIdsByWork.get(row.id) || [],
  }));
}

function fallbackContent() {
  const songs = fallbackSongs.map((song) => ({ ...song, relatedWorkIds: [] }));
  fallbackWorks.forEach((work) => {
    work.songIds?.forEach((songId) => {
      const song = songs.find((item) => item.id === songId);
      if (song) song.relatedWorkIds.push(work.id);
    });
  });

  return {
    source: 'local-fallback',
    collections: fallbackCollections,
    works: fallbackWorks,
    songs,
  };
}

export async function loadGalleryContent() {
  try {
    const responses = await Promise.all(SHEET_NAMES.map((name) => fetch(csvUrl(name), { cache: 'no-store' })));
    if (responses.some((response) => !response.ok)) throw new Error('Google Sheets content is not publicly readable.');

    const [collectionsCsv, worksCsv, songsCsv] = await Promise.all(responses.map((response) => response.text()));
    const songs = normalizeSongs(parseCsv(songsCsv));
    const works = normalizeWorks(parseCsv(worksCsv), songs);
    const collections = normalizeCollections(parseCsv(collectionsCsv)).map((collection) => ({
      ...collection,
      works: works.filter((work) => work.collectionId === collection.id),
    }));

    if (!collections.length || !works.length) throw new Error('Google Sheets returned no enabled content.');
    return { source: 'google-sheets', collections, works, songs };
  } catch (error) {
    console.warn('[Ben Oz Gallery] Using local content fallback:', error);
    return fallbackContent();
  }
}
