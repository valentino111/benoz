import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { collections } from '../src/data/collections.js';
import { DEFAULT_SITE_URL } from '../src/seo/seo.js';

const siteUrl = String(process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');
const staticPaths = ['/', '/gallery', '/music', '/story', '/exhibitions', '/contact'];
const collectionPaths = collections
  .filter((collection) => collection.enabled !== false)
  .map((collection) => `/gallery?collection=${encodeURIComponent(collection.slug || collection.id)}`);
const paths = [...staticPaths, ...collectionPaths];

function localizedUrl(path, language) {
  const url = new URL(path, `${siteUrl}/`);
  if (language === 'he') url.searchParams.set('lang', 'he');
  return url.href.replace(/&/g, '&amp;');
}

const entries = paths.flatMap((path) => ['en', 'he'].map((language) => {
  const location = localizedUrl(path, language);
  const english = localizedUrl(path, 'en');
  const hebrew = localizedUrl(path, 'he');
  return `  <url>
    <loc>${location}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${english}" />
    <xhtml:link rel="alternate" hreflang="he" href="${hebrew}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${english}" />
  </url>`;
}));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

await Promise.all([
  writeFile(resolve('public/sitemap.xml'), sitemap, 'utf8'),
  writeFile(resolve('public/robots.txt'), robots, 'utf8'),
]);

console.log(`Generated SEO files for ${paths.length} routes and 2 languages.`);
