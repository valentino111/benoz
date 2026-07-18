import { collections as localCollections } from './collections.js';
import { songs as localSongs } from './songs.js';
import { getCollectionWorks, normalizeCollectionId } from './collectionPages.js';
import {
  ContentDataError,
  parseBoolean,
  parseCsv,
  validateCanonicalContent,
  validateSheetRows,
} from './contentValidation.js';

const SHEET_ID = '1qS2N_-BPKIP3zXuTYGSFe0zh18u7ECGdZxDspjJG0Ts';
const SHEET_NAMES = ['Collections', 'Works', 'Songs'];
const DEFAULT_TIMEOUT_MS = 8000;
const localCollectionsById = new Map(localCollections.map((collection) => [collection.id, collection]));

function csvUrl(sheetName) {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

function assetPath(fileName) {
  const value = String(fileName || '').trim();
  if (!value) return '';
  if (/^(https?:)?\/\//.test(value) || value.startsWith('/')) return value;
  return `assets/${value}`;
}

function sorted(rows) {
  return [...rows].sort((a, b) => Number(a.sort) - Number(b.sort));
}

function nonEmpty(remoteValue, fallbackValue = '') {
  if (remoteValue === null || remoteValue === undefined) return fallbackValue;
  const value = String(remoteValue).trim();
  return value || fallbackValue;
}

export function normalizeCollection(row, fallback = {}, index = 0) {
  const remoteCover = assetPath(row.posterImage);
  return {
    ...fallback,
    id: row.id,
    enabled: true,
    order: Number(row.sort),
    number: String(index + 1).padStart(2, '0'),
    title: nonEmpty(row.titleEn, fallback.title),
    titleHe: nonEmpty(row.titleHe, fallback.titleHe),
    subtitleEn: nonEmpty(row.subtitleEn, fallback.subtitleEn),
    subtitleHe: nonEmpty(row.subtitleHe, fallback.subtitleHe),
    type: fallback.type || 'Visual Collection',
    description: nonEmpty(row.descriptionEn, fallback.description),
    descriptionHe: nonEmpty(row.descriptionHe, fallback.descriptionHe),
    noteEn: fallback.noteEn || '',
    noteHe: fallback.noteHe || '',
    cover: remoteCover || fallback.cover || '',
    fallbackCover: fallback.cover || '',
    posterVideo: assetPath(row.posterVideo) || fallback.posterVideo || '',
    slug: nonEmpty(row.slug, fallback.slug || row.id),
    pageId: fallback.pageId || `collection-${nonEmpty(row.slug, row.id)}`,
    works: [],
  };
}

export function normalizeCollections(rows) {
  return sorted(rows).map((row, index) => (
    normalizeCollection(row, localCollectionsById.get(row.id) ?? {}, index)
  ));
}

function normalizeSongs(rows) {
  return sorted(rows).map((row) => ({
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

  return rows.map((row, sourceOrder) => ({
    id: row.id,
    collectionId: normalizeCollectionId(row.collectionId),
    order: Number(row.sort),
    sourceOrder,
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
    available: parseBoolean(row.available).value,
    price: String(row.price || '').trim(),
    songIds: songIdsByWork.get(row.id) || [],
  }));
}

function normalizeLocalWork(work, sourceOrder) {
  const media = work.media ?? {};
  return {
    id: work.id,
    collectionId: normalizeCollectionId(work.collectionId),
    order: Number.isFinite(Number(work.order)) ? Number(work.order) : (sourceOrder + 1) * 10,
    sourceOrder,
    titleEn: work.titleEn,
    titleHe: work.titleHe,
    image: work.image || media.image || '',
    video: work.video || media.animation || '',
    thumbnail: work.thumbnail || '',
    statusEn: work.statusEn || '',
    statusHe: work.statusHe || '',
    meta: work.meta || '',
    descriptionEn: work.descriptionEn || work.textEn || '',
    descriptionHe: work.descriptionHe || work.textHe || '',
    collectorLabelEn: work.collectorLabelEn || '',
    collectorLabelHe: work.collectorLabelHe || '',
    availabilityEn: work.availabilityEn || '',
    availabilityHe: work.availabilityHe || '',
    available: Boolean(work.available),
    price: work.price || '',
    songIds: [...(work.songIds || media.songIds || [])],
  };
}

export function fallbackContent() {
  const works = localCollections.flatMap((collection) => (
    collection.works.map((work, sourceOrder) => normalizeLocalWork(work, sourceOrder))
  ));
  const songs = localSongs.map((song) => ({
    ...song,
    titleEn: song.titleEn || song.title,
    titleHe: song.titleHe || song.title,
    artist: song.artist || 'Ben Oz',
    relatedWorkIds: works.filter((work) => work.songIds.includes(song.id)).map((work) => work.id),
  }));
  const collections = localCollections.map((collection) => ({
    ...collection,
    descriptionHe: collection.descriptionHe || '',
    posterVideo: collection.posterVideo || '',
    fallbackCover: collection.cover || '',
    slug: collection.slug || collection.id,
    works: getCollectionWorks(works, collection.id),
  }));
  const content = { source: 'local-fallback', collections, works, songs };
  const diagnostics = validateCanonicalContent(content);
  if (diagnostics.length) {
    throw new ContentDataError('validation', 'Bundled fallback content is inconsistent.', { diagnostics });
  }
  return content;
}

export function buildRemoteContent(rows) {
  const songs = normalizeSongs(rows.Songs);
  const works = normalizeWorks(rows.Works, songs);
  const collections = normalizeCollections(rows.Collections).map((collection) => ({
    ...collection,
    works: getCollectionWorks(works, collection.id),
  }));
  return { source: 'google-sheets', collections, works, songs };
}

function reportDiagnostic(error, onDiagnostic) {
  onDiagnostic?.({ category: error.category || 'unknown', message: error.message, ...error.details });
  if (!import.meta.env?.DEV) return;
  console.warn(`[Ben Oz Gallery] Content ${error.category || 'unknown'} failure; using local fallback.`, {
    message: error.message,
    ...error.details,
  });
}

async function fetchSheet(name, fetchImpl, signal) {
  const response = await fetchImpl(csvUrl(name), { cache: 'default', signal });
  if (!response.ok) {
    throw new ContentDataError('network', `${name} returned HTTP ${response.status}.`, { sheet: name, status: response.status });
  }
  return response.text();
}

export async function loadGalleryContent({ timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch, onDiagnostic } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const results = await Promise.allSettled(
      SHEET_NAMES.map((name) => fetchSheet(name, fetchImpl, controller.signal)),
    );
    const rejected = results.find((result) => result.status === 'rejected');
    if (rejected) {
      if (controller.signal.aborted || rejected.reason?.name === 'AbortError') {
        throw new ContentDataError('timeout', `Google Sheets did not respond within ${timeoutMs}ms.`);
      }
      if (rejected.reason instanceof ContentDataError) throw rejected.reason;
      throw new ContentDataError('network', 'Google Sheets could not be reached.', { cause: rejected.reason?.message });
    }

    const parsed = Object.fromEntries(
      SHEET_NAMES.map((name, index) => [name, parseCsv(results[index].value, name)]),
    );
    const { rows, diagnostics, drafts } = validateSheetRows(parsed);
    if (diagnostics.length && import.meta.env?.DEV) {
      console.warn('[Ben Oz Gallery] Spreadsheet validation diagnostics:', diagnostics);
    }
    if (drafts.length && import.meta.env?.DEV) {
      console.info('[Ben Oz Gallery] Disabled spreadsheet draft rows remain unpublished:', drafts);
    }
    if (!rows.Collections.length || !rows.Works.length) {
      throw new ContentDataError('validation', 'Google Sheets returned no usable enabled collections or works.', { diagnostics });
    }

    const content = buildRemoteContent(rows);
    const canonicalDiagnostics = validateCanonicalContent(content);
    if (canonicalDiagnostics.length) {
      throw new ContentDataError('validation', 'Normalized Google Sheets content is inconsistent.', {
        diagnostics: canonicalDiagnostics,
      });
    }
    return content;
  } catch (caught) {
    const error = caught instanceof ContentDataError
      ? caught
      : new ContentDataError('parsing', 'Google Sheets content could not be processed.', { cause: caught?.message });
    reportDiagnostic(error, onDiagnostic);
    return fallbackContent();
  } finally {
    clearTimeout(timeout);
  }
}
