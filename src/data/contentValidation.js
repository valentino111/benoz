const ENTITY_RULES = {
  Collections: { assets: ['posterImage', 'posterVideo'], requiredAssets: [] },
  Works: { assets: ['image', 'video', 'thumbnail'], requiredAssets: ['image'] },
  Songs: { assets: ['audio'], requiredAssets: ['audio'] },
};

const sourceRowNumbers = new WeakMap();

function rememberSourceRow(row, rowNumber) {
  sourceRowNumbers.set(row, rowNumber);
  return row;
}

function sourceRowNumber(row, fallback) {
  return sourceRowNumbers.get(row) ?? fallback;
}

export class ContentDataError extends Error {
  constructor(category, message, details = {}) {
    super(message);
    this.name = 'ContentDataError';
    this.category = category;
    this.details = details;
  }
}

export function parseCsv(text, sheetName = 'sheet') {
  if (typeof text !== 'string') {
    throw new ContentDataError('parsing', `${sheetName} did not return text.`);
  }

  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += character;
    }
  }

  if (quoted) {
    throw new ContentDataError('parsing', `${sheetName} contains an unterminated quoted value.`);
  }

  row.push(cell);
  if (row.some((value) => value.trim() !== '')) rows.push(row);
  if (!rows.length) throw new ContentDataError('parsing', `${sheetName} is empty.`);

  const headers = rows[0].map((header) => header.trim());
  if (headers.some((header) => !header)) {
    throw new ContentDataError('parsing', `${sheetName} contains an empty column heading.`);
  }
  if (new Set(headers).size !== headers.length) {
    throw new ContentDataError('parsing', `${sheetName} contains duplicate column headings.`);
  }

  return rows.slice(1).map((values, index) => {
    if (values.length > headers.length && values.slice(headers.length).some((value) => value.trim())) {
      throw new ContentDataError('parsing', `${sheetName} row ${index + 2} contains values without headings.`);
    }
    return rememberSourceRow(
      Object.fromEntries(headers.map((header, column) => [header, values[column]?.trim() ?? ''])),
      index + 2,
    );
  });
}

export function parseBoolean(value) {
  if (typeof value === 'boolean') return { valid: true, value };
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'true') return { valid: true, value: true };
  if (normalized === 'false') return { valid: true, value: false };
  return { valid: false, value: false };
}

export function isSafeAssetPath(value) {
  const path = String(value ?? '').trim();
  if (!path) return true;
  if (/javascript:|data:|[<>"'\\]|[\u0000-\u001f]/i.test(path)) return false;
  if (path.split(/[/?#]/).includes('..')) return false;
  return /^(https?:)?\/\//i.test(path) || path.startsWith('/') || /^[\w ()@+.,/-]+$/u.test(path);
}

export function parsePrice(value) {
  const display = String(value ?? '').trim();
  if (!display) return { valid: true, value: null, display: '' };
  if (/[<>\u0000-\u001f]/.test(display)) return { valid: false, value: null, display };
  const numeric = display.replace(/₪|nis|ils|,|\s/gi, '');
  if (!/^\d+(?:\.\d{1,2})?$/.test(numeric)) return { valid: false, value: null, display };
  return { valid: true, value: Number(numeric), display };
}

function normalizedRow(sheet, original, index) {
  const row = {
    ...original,
    id: String(original.id ?? '').trim(),
  };
  if (sheet === 'Works') row.collectionId = String(original.collectionId ?? '').trim();
  return rememberSourceRow(row, sourceRowNumber(original, index + 2));
}

function issue(sheet, row, fallbackRow, field, code, reason, classification = 'invalid') {
  return {
    sheet,
    row: sourceRowNumber(row, fallbackRow),
    id: row.id || null,
    field,
    code,
    classification,
    reason,
    message: reason,
  };
}

function validateEntityRows(sheet, sourceRows, diagnostics, drafts) {
  const seenIds = new Set();
  const { assets, requiredAssets } = ENTITY_RULES[sheet];
  const rows = sourceRows.map((row, index) => normalizedRow(sheet, row, index));

  return rows.filter((row, rowIndex) => {
    const fallbackRow = rowIndex + 2;
    const enabled = parseBoolean(row.enabled);
    if (!enabled.valid) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'enabled', 'invalid-boolean', 'Expected TRUE or FALSE.'));
      return false;
    }
    if (!enabled.value) {
      drafts.push({
        sheet,
        row: sourceRowNumber(row, fallbackRow),
        id: row.id || null,
        classification: 'draft',
        reason: 'enabled is FALSE; row remains unpublished.',
      });
      return false;
    }

    const id = row.id;
    if (!id) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'id', 'missing-id', 'Enabled rows require an id.'));
      return false;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'id', 'invalid-id', 'IDs must use lowercase kebab-case.'));
      return false;
    }
    if (seenIds.has(id)) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'id', 'duplicate-id', `Duplicate id "${id}" was ignored.`));
      return false;
    }

    const sort = Number(row.sort);
    if (!String(row.sort ?? '').trim() || !Number.isFinite(sort)) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'sort', 'invalid-sort', 'Enabled rows require a numeric sort value.'));
      return false;
    }

    if (!String(row.titleEn ?? '').trim() || !String(row.titleHe ?? '').trim()) {
      diagnostics.push(issue(sheet, row, fallbackRow, 'title', 'missing-title', 'Enabled rows require English and Hebrew titles.'));
      return false;
    }

    const unsafeAsset = assets.find((field) => !isSafeAssetPath(row[field]));
    if (unsafeAsset) {
      diagnostics.push(issue(sheet, row, fallbackRow, unsafeAsset, 'invalid-asset', 'Asset path is not safe.'));
      return false;
    }
    const missingAsset = requiredAssets.find((field) => !String(row[field] ?? '').trim());
    if (missingAsset) {
      diagnostics.push(issue(
        sheet,
        row,
        fallbackRow,
        missingAsset,
        'missing-required-media',
        `Enabled public ${sheet.slice(0, -1)} is missing required ${missingAsset} media and was excluded.`,
        'enabled-public-missing-media',
      ));
      return false;
    }

    if (sheet === 'Works') {
      const available = parseBoolean(row.available);
      if (!available.valid) {
        diagnostics.push(issue(sheet, row, fallbackRow, 'available', 'invalid-boolean', 'Expected TRUE or FALSE.'));
        return false;
      }
      const price = parsePrice(row.price);
      if (!price.valid || (available.value && price.value === null)) {
        diagnostics.push(issue(sheet, row, fallbackRow, 'price', 'invalid-price', 'Price is missing or has an unsupported format.'));
        return false;
      }
    }

    seenIds.add(id);
    return true;
  });
}

export function validateSheetRows(sheetRows) {
  const diagnostics = [];
  const drafts = [];
  const collections = validateEntityRows('Collections', sheetRows.Collections ?? [], diagnostics, drafts);
  const worksWithFields = validateEntityRows('Works', sheetRows.Works ?? [], diagnostics, drafts);
  const songs = validateEntityRows('Songs', sheetRows.Songs ?? [], diagnostics, drafts);
  const collectionIds = new Set(collections.map((row) => row.id));
  const validSongIds = new Set(songs.map((row) => row.id));

  const works = worksWithFields
    .filter((row, index) => {
      if (collectionIds.has(row.collectionId)) return true;
      diagnostics.push(issue('Works', row, index + 2, 'collectionId', 'missing-reference', `Unknown collection "${row.collectionId}".`));
      return false;
    })
    .map((row, index) => {
      const songId = String(row.songId ?? '').trim();
      if (!songId || validSongIds.has(songId)) return { ...row, songId };
      diagnostics.push(issue('Works', row, index + 2, 'songId', 'missing-reference', `Unknown song "${songId}" was ignored.`));
      return { ...row, songId: '' };
    });

  return { rows: { Collections: collections, Works: works, Songs: songs }, diagnostics, drafts };
}

export function validateCanonicalContent({ collections = [], works = [], songs = [] }) {
  const diagnostics = [];
  const duplicateIds = (items, entity) => {
    const seen = new Set();
    items.forEach((item, index) => {
      if (!item.id || seen.has(item.id)) diagnostics.push({ entity, index, code: 'invalid-id', id: item.id });
      seen.add(item.id);
    });
  };

  duplicateIds(collections, 'collections');
  duplicateIds(works, 'works');
  duplicateIds(songs, 'songs');
  const collectionIds = new Set(collections.map((item) => item.id));
  const availableSongIds = new Set(songs.map((item) => item.id));

  works.forEach((work) => {
    if (!collectionIds.has(work.collectionId)) diagnostics.push({ entity: 'works', id: work.id, code: 'missing-collection' });
    if (work.songId && !availableSongIds.has(work.songId)) {
      diagnostics.push({ entity: 'works', id: work.id, code: 'missing-song', reference: work.songId });
    }
  });

  return diagnostics;
}
