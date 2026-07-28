import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('React owns loader, fade reveal, and collection hero parallax without a legacy runtime', async () => {
  const [app, entry, reveal, parallax] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/EntryScreen.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/hooks/useFadeReveal.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/hooks/useHeroParallax.js', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /useFadeReveal\(Boolean\(content\)\)/);
  assert.match(app, /data-react-migration', 'ready'/);
  assert.doesNotMatch(app, /legacy\.js|BenOzLegacyRuntime|createElement\('script'\)/);
  assert.match(entry, /loaderHidden \? ' is-hidden' : ''/);
  assert.match(reveal, /new IntersectionObserver/);
  assert.match(reveal, /observer\.unobserve\(entry\.target\)/);
  assert.match(parallax, /requestAnimationFrame/);
  assert.match(parallax, /prefers-reduced-motion: reduce/);

  await assert.rejects(access(new URL('../public/legacy.js', import.meta.url)));
});
