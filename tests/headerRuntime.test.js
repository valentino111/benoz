import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('React owns language, mobile menu, and ambient sound controls', async () => {
  const [app, header, ambient, legacy] = await Promise.all([
    readFile(new URL('../src/App.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/SiteHeader.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/hooks/useAmbientSound.js', import.meta.url), 'utf8'),
    readFile(new URL('../public/legacy.js', import.meta.url), 'utf8'),
  ]);

  assert.match(app, /document\.body\.classList\.toggle\('en', english\)/);
  assert.match(app, /url\.searchParams\.set\('lang', 'he'\)/);
  assert.match(app, /<SiteHeader/);
  assert.match(header, /menuOpen \? ' menu-open' : ''/);
  assert.match(header, /aria-expanded=\{menuOpen\}/);
  assert.match(header, /onClick=\{onToggleLanguage\}/);
  assert.match(header, /aria-pressed=\{ambientOn\}/);
  assert.match(ambient, /new AudioContextClass\(\)/);
  assert.match(ambient, /linearRampToValueAtTime/);
  assert.match(ambient, /scheduleAmbient/);

  assert.doesNotMatch(legacy, /langBtn/);
  assert.doesNotMatch(legacy, /soundBtn/);
  assert.doesNotMatch(legacy, /mobileMenuBtn/);
  assert.doesNotMatch(legacy, /AudioContext/);
  assert.doesNotMatch(legacy, /benoz:languagechange/);
});
