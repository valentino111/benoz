const COLLECTION_QUERY_PARAM = 'collection';

function numericOrder(work) {
  const value = Number(work.order);
  return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY;
}

function numericSourceOrder(work, fallback) {
  const value = Number(work.sourceOrder);
  return Number.isFinite(value) ? value : fallback;
}

export function normalizeCollectionId(value) {
  return String(value || '').trim();
}

export function getCollectionWorks(works, collectionId) {
  const normalizedId = normalizeCollectionId(collectionId);

  return works
    .map((work, index) => ({ work, index }))
    .filter(({ work }) => normalizeCollectionId(work.collectionId) === normalizedId)
    .sort((left, right) => (
      numericOrder(left.work) - numericOrder(right.work)
      || numericSourceOrder(left.work, left.index) - numericSourceOrder(right.work, right.index)
      || String(left.work.id).localeCompare(String(right.work.id))
    ))
    .map(({ work }) => work);
}

export function createCollectionPage(collection, works) {
  return {
    ...collection,
    works: getCollectionWorks(works, collection.id),
  };
}

export function resolveCollectionFromSearch(collections, search = '') {
  const requested = normalizeCollectionId(new URLSearchParams(search).get(COLLECTION_QUERY_PARAM));
  if (!requested) return null;

  return collections.find((collection) => (
    normalizeCollectionId(collection.slug) === requested
    || normalizeCollectionId(collection.id) === requested
  )) || null;
}

function locationUrl(locationLike = {}) {
  const href = locationLike.href
    || `https://benoz.invalid${locationLike.pathname || '/'}${locationLike.search || ''}${locationLike.hash || ''}`;
  return new URL(href, 'https://benoz.invalid');
}

function localUrl(url) {
  return `${url.pathname}${url.search}${url.hash}`;
}

export function collectionSelectionUrl(locationLike, pathname) {
  const url = locationUrl(locationLike);
  if (pathname) url.pathname = pathname;
  url.searchParams.delete(COLLECTION_QUERY_PARAM);
  url.hash = '';
  return localUrl(url);
}

export function collectionPageUrl(collection, locationLike, hash = '', pathname) {
  const url = locationUrl(locationLike);
  if (pathname) url.pathname = pathname;
  url.searchParams.set(COLLECTION_QUERY_PARAM, normalizeCollectionId(collection.slug || collection.id));
  url.hash = hash ? `#${String(hash).replace(/^#/, '')}` : '';
  return localUrl(url);
}
