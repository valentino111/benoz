import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('React owns artwork buttons, swipes, and shareable hash navigation', async () => {
  const [gallery, legacy] = await Promise.all([
    readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/legacy.js', import.meta.url), 'utf8'),
  ]);

  assert.match(gallery, /disabled=\{index === 0\}/);
  assert.match(gallery, /disabled=\{index === total - 1\}/);
  assert.match(gallery, /onNavigate\(index \+ \(dx < 0 \? 1 : -1\)/);
  assert.match(gallery, /window\.addEventListener\('hashchange', scrollToHash\)/);
  assert.match(gallery, /new IntersectionObserver/);
  assert.match(gallery, /window\.history\.replaceState/);

  assert.doesNotMatch(legacy, /const artworkSections=/);
  assert.doesNotMatch(legacy, /handleArtworkHash/);
  assert.doesNotMatch(legacy, /querySelector\('\.art-prev'\)/);
  assert.doesNotMatch(legacy, /querySelector\('\.art-next'\)/);
});
