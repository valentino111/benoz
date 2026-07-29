import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { collectionPageUrl } from '../src/data/collectionPages.js';
import {
  PAGE_CONTACT,
  PAGE_EXHIBITIONS,
  PAGE_STORY,
  resolveSiteRoute,
  sitePageUrl,
  VIEW_COLLECTION,
  VIEW_COLLECTIONS,
  VIEW_ENTRY,
  VIEW_PAGE,
} from '../src/data/siteRoutes.js';

const collections = [
  { id: 'exhibition', slug: 'exhibition' },
  { id: 'pearls-of-truth', slug: 'pearls-of-truth' },
];

function route(url) {
  return resolveSiteRoute(collections, new URL(url, 'https://gallery.example'));
}

test('direct site routes resolve to complete page views', () => {
  assert.deepEqual(route('/'), { view: VIEW_ENTRY, collectionId: '', page: '' });
  assert.deepEqual(route('/gallery'), { view: VIEW_COLLECTIONS, collectionId: '', page: '' });
  assert.deepEqual(route('/music'), { view: VIEW_COLLECTIONS, collectionId: '', page: '' });
  assert.deepEqual(route('/exhibitions'), { view: VIEW_PAGE, collectionId: '', page: PAGE_EXHIBITIONS });
  assert.deepEqual(route('/contact'), { view: VIEW_PAGE, collectionId: '', page: PAGE_CONTACT });
});

test('About Ben Oz and Story are aliases for the same shared page', () => {
  const storyRoute = { view: VIEW_PAGE, collectionId: '', page: PAGE_STORY };
  assert.deepEqual(route('/about'), storyRoute);
  assert.deepEqual(route('/about-ben-oz'), storyRoute);
  assert.deepEqual(route('/story'), storyRoute);
  assert.deepEqual(route('/story/'), storyRoute);
});

test('direct collection URLs resolve every enabled collection independently', () => {
  assert.deepEqual(route('/gallery?collection=exhibition'), {
    view: VIEW_COLLECTION,
    collectionId: 'exhibition',
    page: '',
  });
  assert.deepEqual(route('/gallery?collection=pearls-of-truth'), {
    view: VIEW_COLLECTION,
    collectionId: 'pearls-of-truth',
    page: '',
  });
  assert.equal(
    collectionPageUrl(collections[1], { href: 'https://gallery.example/?preview=true' }, '', '/gallery'),
    '/gallery?preview=true&collection=pearls-of-truth',
  );
});

test('legacy root collection links remain valid while page navigation removes collection state', () => {
  assert.equal(route('/?collection=exhibition').view, VIEW_COLLECTION);
  assert.equal(
    sitePageUrl('/contact', { href: 'https://gallery.example/gallery?preview=true&collection=exhibition#work' }),
    '/contact?preview=true',
  );
});

test('standalone pages reveal declaratively without route-level DOM mutation', async () => {
  const [app, routes, ...sections] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/data/siteRoutes.js', import.meta.url), 'utf8'),
    ...[
      'StorySection.jsx',
      'ExhibitionsSection.jsx',
      'ContactSection.jsx',
    ].map((file) => readFile(new URL(`../src/components/${file}`, import.meta.url), 'utf8')),
  ]);

  sections.forEach((section) => {
    assert.match(section, /standalone \? ' show' : ''/);
  });
  assert.match(app, /data-react-migration="ready"/);
  assert.doesNotMatch(app, /revealRoutePage|data-react-migration', 'ready'/);
  assert.doesNotMatch(routes, /documentLike|classList/);
});

test('navigation exposes every restored route and Netlify serves them through the SPA entry', async () => {
  const [header, hub, redirects] = await Promise.all([
    readFile(new URL('../src/components/SiteHeader.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ProjectHub.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/_redirects', import.meta.url), 'utf8'),
  ]);
  ['/gallery', '/story', '/exhibitions', '/contact'].forEach((href) => {
    assert.match(header, new RegExp(`href="${href}"`));
  });
  assert.doesNotMatch(header, /href="\/music"/);
  assert.match(hub, /href="\/about"/);
  assert.match(hub, /aria-label="Return to Ben Oz hero"/);
  assert.match(hub, /href="\/"/);
  assert.match(hub, /onClick=\{\(event\) => onNavigate\?\.\('\/', event\)\}/);
  assert.match(hub, /const animationSrc = collection\.posterVideo/);
  assert.doesNotMatch(hub, /COLLECTION_COVER_ANIMATIONS/);
  assert.match(hub, /has-cover-animation/);
  assert.match(hub, /className=\{`museum-poster-video/);
  assert.doesNotMatch(hub, /\smuted\s/);
  assert.match(hub, /window\.setTimeout\(\(\) => \{/);
  assert.match(hub, /\}, 150\)/);
  assert.match(hub, /suppressNextClick/);
  assert.equal(redirects.trim(), '/* /index.html 200');
});

test('the mobile Collections logo is not blocked by the loader and has a stable tap target', async () => {
  const [entry, styles] = await Promise.all([
    readFile(new URL('../src/components/EntryScreen.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ]);

  assert.match(entry, /function handleEnter\(event\) \{\s*setLoaderHidden\(true\);\s*onEnter\?\.\(event\)/);
  assert.match(entry, /className=\{`museum-loader\$\{loaderHidden \? ' is-hidden' : ''\}`\}/);
  assert.match(styles, /\.museum-hub-home\{\s*position:relative;\s*z-index:3;\s*padding:6px;/);
  assert.match(styles, /touch-action:manipulation/);
});

test('restored Story, Exhibitions, and Contact retain English and Hebrew content', async () => {
  const files = await Promise.all([
    'StorySection.jsx',
    'ExhibitionsSection.jsx',
    'ContactSection.jsx',
  ].map((file) => readFile(new URL(`../src/components/${file}`, import.meta.url), 'utf8')));

  files.forEach((source) => {
    assert.match(source, /data-lang=\\?"he\\?"/);
    assert.match(source, /data-lang=\\?"en\\?"/);
  });
  assert.match(files[0], /The Story Behind the Series/);
  assert.match(files[1], /Artists of the South/);
  assert.match(files[2], /https:\/\/wa\.me\/972544520987/);
});

test('portrait mobile hero uses the dedicated mobile crop while desktop keeps the original video', async () => {
  const [entry, styles] = await Promise.all([
    readFile(new URL('../src/components/EntryScreen.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ]);

  assert.match(entry, /media="\(max-width: 700px\) and \(orientation: portrait\)"/);
  assert.match(entry, /src="\/assets\/BenOzHero-mobile\.mp4\?v=2"/);
  assert.match(entry, /src="\/assets\/BenOzHero\.MP4"/);
  assert.match(styles, /@media\(max-width:700px\) and \(orientation:portrait\)/);
  assert.match(styles, /object-position:center top/);
});

test('hero controls use a blurred static backdrop and recede while video is playing', async () => {
  const [entry, styles] = await Promise.all([
    readFile(new URL('../src/components/EntryScreen.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ]);

  assert.match(entry, /className=\{`entry\$\{heroPlaying \? ' is-hero-playing' : ''\}`\}/);
  assert.match(entry, /onPause=\{\(\) => setHeroPlaying\(false\)\}/);
  assert.match(entry, /className="entry-callout"/);
  assert.match(styles, /\.entry-callout:before\{[\s\S]*?backdrop-filter:blur\(9px\) saturate\(.9\)/);
  assert.doesNotMatch(styles, /\.entry-inner:before/);
  assert.match(styles, /\.entry\.is-hero-playing \.entry-inner\{[\s\S]*?opacity:0/);
  assert.match(styles, /transition:opacity \.65s ease,filter \.65s ease,transform \.65s ease/);
  assert.match(styles, /pointer-events:none/);
});

test('animated mobile collection covers suppress browser copy and callout behavior', async () => {
  const [hub, styles] = await Promise.all([
    readFile(new URL('../src/components/ProjectHub.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ]);

  assert.match(hub, /onContextMenu=/);
  assert.match(hub, /draggable=\{false\}/);
  assert.match(styles, /-webkit-touch-callout:none/);
  assert.match(styles, /-webkit-user-select:none/);
  assert.match(styles, /touch-action:pan-y/);
});

test('mobile video previews use custom controls and start during a 150ms hold', async () => {
  const [gallery, hub, button, styles, asset] = await Promise.all([
    readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ProjectHub.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/VideoPreviewButton.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
    readFile(new URL('../public/assets/AJugOfWineAnimate.MP4', import.meta.url)),
  ]);

  assert.match(gallery, /Boolean\(work\.video\)/);
  assert.match(gallery, /<source src=\{work\.video\} type="video\/mp4" \/>/);
  assert.match(gallery, /className=\{`artwork-preview-video/);
  assert.match(gallery, /muted=\{musicPlaying\}/);
  assert.match(gallery, /musicPlaying=\{Boolean\(playingSongId\)\}/);
  assert.match(gallery, /startPreview\(\);\s*longPressTimer\.current = null;/);
  assert.match(gallery, /\}, 150\)/);
  assert.doesNotMatch(gallery, /longPressReady/);
  assert.match(gallery, /onPointerUp=\{clearLongPress\}/);
  assert.match(gallery, /data-full-src=\{work\.image\}/);
  assert.match(gallery, /<VideoPreviewButton/);
  assert.match(hub, /<VideoPreviewButton/);
  assert.match(button, /className=\{`video-preview-trigger/);
  assert.match(button, /aria-pressed=\{playing\}/);
  assert.match(styles, /\.artwork-preview-video\.is-playing\{opacity:1\}/);
  assert.match(styles, /\.video-preview-trigger\{[\s\S]*?display:none/);
  assert.match(styles, /@media \(max-width:720px\)\{[\s\S]*?\.video-preview-trigger\{display:grid\}/);
  assert.match(styles, /border:1px solid rgba\(225,195,116,.82\)/);
  assert.match(styles, /::-webkit-media-controls-start-playback-button/);
  assert.ok(asset.byteLength > 0);
});

test('artwork soundtrack controls play directly with the custom gold icon', async () => {
  const [app, gallery, header, styles] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/SiteHeader.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles.css', import.meta.url), 'utf8'),
  ]);

  assert.doesNotMatch(app, /MusicSection/);
  assert.doesNotMatch(header, /href="\/music"/);
  assert.match(gallery, /<audio/);
  assert.match(gallery, /onClick=\{\(\) => onToggle\(song\)\}/);
  assert.match(gallery, /aria-pressed=\{playing\}/);
  assert.match(gallery, /className="soundtrack-icon">\s*<span className="gold-play-glyph" \/>/);
  assert.doesNotMatch(gallery, /href=\{`#\$\{song\.domId\}`\}/);
  assert.match(styles, /\.gold-play-glyph\{/);
  assert.match(styles, /\.artwork-soundtrack button\.is-playing \.gold-play-glyph/);
});
