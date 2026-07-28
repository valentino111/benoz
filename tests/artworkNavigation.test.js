import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('React owns artwork buttons, swipes, and shareable hash navigation', async () => {
  const gallery = await readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8');

  assert.match(gallery, /disabled=\{index === 0\}/);
  assert.match(gallery, /disabled=\{index === total - 1\}/);
  assert.match(gallery, /onNavigate\(index \+ \(dx < 0 \? 1 : -1\)/);
  assert.match(gallery, /window\.addEventListener\('hashchange', scrollToHash\)/);
  assert.match(gallery, /new IntersectionObserver/);
  assert.match(gallery, /window\.history\.replaceState/);

});
