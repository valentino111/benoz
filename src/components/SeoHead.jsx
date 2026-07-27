import { useEffect } from 'react';
import { buildSeoModel } from '../seo/seo.js';

const META_ATTRIBUTES = [
  ['name', 'description'],
  ['name', 'robots'],
  ['property', 'og:type'],
  ['property', 'og:title'],
  ['property', 'og:description'],
  ['property', 'og:url'],
  ['property', 'og:image'],
  ['property', 'og:site_name'],
  ['name', 'twitter:card'],
  ['name', 'twitter:title'],
  ['name', 'twitter:description'],
  ['name', 'twitter:image'],
];

function upsertMeta(documentLike, attribute, key, content) {
  let element = documentLike.head.querySelector(`meta[${attribute}="${key}"][data-ben-oz-seo]`);
  if (!element) {
    element = documentLike.createElement('meta');
    element.setAttribute(attribute, key);
    element.dataset.benOzSeo = 'true';
    documentLike.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function upsertLink(documentLike, rel, href, hreflang = '') {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"][data-ben-oz-seo]`
    : `link[rel="${rel}"][data-ben-oz-seo]`;
  let element = documentLike.head.querySelector(selector);
  if (!element) {
    element = documentLike.createElement('link');
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    element.dataset.benOzSeo = 'true';
    documentLike.head.appendChild(element);
  }
  element.href = href;
}

export function applySeoModel(model, documentLike = document) {
  documentLike.title = model.title;
  documentLike.documentElement.lang = model.language;
  documentLike.documentElement.dir = model.direction;

  const values = [
    model.description,
    model.robots,
    model.openGraph.type,
    model.openGraph.title,
    model.openGraph.description,
    model.openGraph.url,
    model.openGraph.image,
    model.openGraph.siteName,
    model.twitter.card,
    model.twitter.title,
    model.twitter.description,
    model.twitter.image,
  ];
  META_ATTRIBUTES.forEach(([attribute, key], index) => {
    upsertMeta(documentLike, attribute, key, values[index]);
  });

  upsertLink(documentLike, 'canonical', model.canonical);
  Object.entries(model.alternates).forEach(([language, href]) => {
    upsertLink(documentLike, 'alternate', href, language);
  });

  let structuredData = documentLike.head.querySelector('script[type="application/ld+json"][data-ben-oz-seo]');
  if (!structuredData) {
    structuredData = documentLike.createElement('script');
    structuredData.type = 'application/ld+json';
    structuredData.dataset.benOzSeo = 'true';
    documentLike.head.appendChild(structuredData);
  }
  structuredData.textContent = JSON.stringify(model.structuredData).replace(/</g, '\\u003c');
}

export default function SeoHead({ content, language, route }) {
  useEffect(() => {
    const model = buildSeoModel({
      content,
      language,
      route,
      siteUrl: import.meta.env.VITE_SITE_URL,
    });
    applySeoModel(model);
  }, [content, language, route.collectionId, route.page, route.view]);

  return null;
}
