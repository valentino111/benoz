import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('React owns the complete artwork lightbox interaction', async () => {
  const [gallery, lightbox, overlays, legacy] = await Promise.all([
    readFile(new URL('../src/components/ArtworkGallery.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ArtworkLightbox.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/Overlays.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../public/legacy.js', import.meta.url), 'utf8'),
  ]);

  assert.match(gallery, /className="image-shield"/);
  assert.match(gallery, /onOpenArtwork\?\.\(collectionWorks, targetIndex, opener\)/);
  assert.match(lightbox, /detailImage\.decode\(\)/);
  assert.match(lightbox, /document\.body\.classList\.add\('locked', 'lightbox-open'\)/);
  assert.match(lightbox, /event\.key === 'ArrowLeft'/);
  assert.match(lightbox, /event\.key === 'ArrowRight'/);
  assert.match(lightbox, /pinchStartDistance/);
  assert.match(lightbox, /Math\.round\(zoom \* 100\)/);
  assert.match(overlays, /<ArtworkLightbox/);

  assert.doesNotMatch(legacy, /const lightbox=/);
  assert.doesNotMatch(legacy, /openArtworkImage/);
  assert.doesNotMatch(legacy, /closeLightbox/);
  assert.doesNotMatch(legacy, /querySelector\('\.lb-stage'\)/);
  assert.doesNotMatch(legacy, /createElement\('span'\)/);
});
