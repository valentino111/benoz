import { resolveCollectionFromSearch } from './collectionPages.js';

export const VIEW_ENTRY = 'entry';
export const VIEW_COLLECTIONS = 'collections';
export const VIEW_COLLECTION = 'collection';
export const VIEW_PAGE = 'page';

export const PAGE_MUSIC = 'music';
export const PAGE_STORY = 'story';
export const PAGE_EXHIBITIONS = 'exhibitions';
export const PAGE_CONTACT = 'contact';

export const SITE_PATHS = {
  home: '/',
  gallery: '/gallery',
  music: '/music',
  about: '/about',
  story: '/story',
  exhibitions: '/exhibitions',
  contact: '/contact',
};

function normalizedPath(pathname = '/') {
  const path = `/${String(pathname).replace(/^\/+|\/+$/g, '')}`;
  return path === '/' ? path : path.toLowerCase();
}

export function resolveSiteRoute(collections, locationLike = {}) {
  const collection = resolveCollectionFromSearch(collections, locationLike.search || '');
  if (collection) return { view: VIEW_COLLECTION, collectionId: collection.id, page: '' };

  switch (normalizedPath(locationLike.pathname)) {
    case SITE_PATHS.gallery:
      return { view: VIEW_COLLECTIONS, collectionId: '', page: '' };
    case SITE_PATHS.music:
      return { view: VIEW_PAGE, collectionId: '', page: PAGE_MUSIC };
    case SITE_PATHS.about:
    case '/about-ben-oz':
    case SITE_PATHS.story:
      return { view: VIEW_PAGE, collectionId: '', page: PAGE_STORY };
    case SITE_PATHS.exhibitions:
      return { view: VIEW_PAGE, collectionId: '', page: PAGE_EXHIBITIONS };
    case SITE_PATHS.contact:
      return { view: VIEW_PAGE, collectionId: '', page: PAGE_CONTACT };
    default:
      return { view: VIEW_ENTRY, collectionId: '', page: '' };
  }
}

export function sitePageUrl(path, locationLike = {}) {
  const href = locationLike.href
    || `https://benoz.invalid${locationLike.pathname || '/'}${locationLike.search || ''}${locationLike.hash || ''}`;
  const url = new URL(href, 'https://benoz.invalid');
  url.pathname = path;
  url.searchParams.delete('collection');
  url.hash = '';
  return `${url.pathname}${url.search}${url.hash}`;
}

export function revealRoutePage(documentLike, page) {
  const element = page ? documentLike?.getElementById?.(page) : null;
  element?.classList?.add('show');
  return Boolean(element);
}
