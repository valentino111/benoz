import { collections as localCollections } from './collections.js';
import { songs as localSongs } from './songs.js';
import { getCollectionWorks, normalizeCollectionId } from './collectionPages.js';
import { normalizeEdition } from './edition.js';
import { optimizedImage } from './imageAssets.js';
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
  return `/assets/${value}`;
}

function sorted(rows) {
  return [...rows].sort((a, b) => Number(a.sort ?? a.order) - Number(b.sort ?? b.order));
}

function nonEmpty(remoteValue, fallbackValue = '') {
  if (remoteValue === null || remoteValue === undefined) return fallbackValue;
  const value = String(remoteValue).trim();
  return value || fallbackValue;
}

export function normalizeCollection(row, fallback = {}, index = 0) {
  const remoteCover = optimizedImage(row.posterImage, 'thumbnail').src;
  const fallbackCover = optimizedImage(fallback.posterImage || row.posterImage, 'thumbnail').src;
  return {
    id: row.id,
    enabled: true,
    order: Number(row.sort ?? row.order ?? fallback.sort ?? fallback.order),
    number: String(index + 1).padStart(2, '0'),
    title: nonEmpty(row.titleEn, fallback.titleEn || ''),
    titleHe: nonEmpty(row.titleHe, fallback.titleHe || ''),
    subtitleEn: nonEmpty(row.subtitleEn, fallback.subtitleEn || ''),
    subtitleHe: nonEmpty(row.subtitleHe, fallback.subtitleHe || ''),
    type: nonEmpty(row.type, fallback.type || 'Visual Collection'),
    description: nonEmpty(row.descriptionEn, fallback.descriptionEn || ''),
    descriptionHe: nonEmpty(row.descriptionHe, fallback.descriptionHe || ''),
    noteEn: nonEmpty(row.noteEn, fallback.noteEn || ''),
    noteHe: nonEmpty(row.noteHe, fallback.noteHe || ''),
    cover: remoteCover || fallbackCover,
    fallbackCover,
    posterVideo: assetPath(row.posterVideo) || assetPath(fallback.posterVideo),
    slug: nonEmpty(row.slug, fallback.slug || row.id),
    pageId: row.pageId || fallback.pageId || `collection-${nonEmpty(row.slug, row.id)}`,
    works: [],
  };
}

export function normalizeCollections(rows) {
  return sorted(rows).map((row, index) => (
    normalizeCollection(row, localCollectionsById.get(row.id) ?? {}, index)
  ));
}

function normalizeSong(song) {
  return {
    id: song.id,
    title: song.titleHe || song.titleEn,
    titleEn: song.titleEn,
    titleHe: song.titleHe,
    audio: assetPath(song.audio),
  };
}

function normalizeSongs(rows) {
  return sorted(rows).map(normalizeSong);
}

function normalizeWork(work, {
  available = false,
  order,
  songId = '',
  sourceOrder = 0,
} = {}) {
  const image = optimizedImage(work.image);
  const thumbnail = optimizedImage(work.thumbnail || work.image, 'thumbnail');
  const edition = normalizeEdition(work.editionNumber, work.editionTotal);
  return {
    id: work.id,
    collectionId: normalizeCollectionId(work.collectionId),
    order,
    sourceOrder,
    titleEn: work.titleEn,
    titleHe: work.titleHe,
    image: image.src,
    imageWidth: image.width,
    imageHeight: image.height,
    video: work.video || '',
    thumbnail: thumbnail.src,
    thumbnailWidth: thumbnail.width,
    thumbnailHeight: thumbnail.height,
    statusEn: work.statusEn || '',
    statusHe: work.statusHe || '',
    meta: work.meta || '',
    descriptionEn: work.descriptionEn || '',
    descriptionHe: work.descriptionHe || '',
    collectorLabelEn: work.collectorLabelEn || '',
    collectorLabelHe: work.collectorLabelHe || '',
    availabilityEn: work.availabilityEn || '',
    availabilityHe: work.availabilityHe || '',
    available,
    price: String(work.price || '').trim(),
    editionNumber: edition?.editionNumber ?? null,
    editionTotal: edition?.editionTotal ?? null,
    songId: String(songId || '').trim(),
  };
}

function normalizeWorks(rows) {
  return rows.map((row, sourceOrder) => (
    normalizeWork(
      { ...row, video: assetPath(row.video) },
      {
        available: parseBoolean(row.available).value,
        order: Number(row.sort),
        songId: row.songId,
        sourceOrder,
      },
    )
  ));
}

function normalizeLocalWork(work, sourceOrder) {
  return normalizeWork(
    work,
    {
      available: Boolean(work.available),
      order: Number.isFinite(Number(work.order)) ? Number(work.order) : (sourceOrder + 1) * 10,
      sourceOrder,
      songId: work.songId,
    },
  );
}

export function fallbackContent() {
  const songs = normalizeSongs(localSongs);
  const works = localCollections.flatMap((collection) => (
    collection.works.map((work, sourceOrder) => normalizeLocalWork(work, sourceOrder))
  ));
  const collections = sorted(localCollections).map((collection, index) => ({
    ...normalizeCollection(collection, {}, index),
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
  const works = normalizeWorks(rows.Works);
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
