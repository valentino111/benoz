import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

test('shared sections render direct JSX without HTML-string injection', async () => {
  const files = [
    'StorySection.jsx',
    'ExhibitionsSection.jsx',
    'ContactSection.jsx',
    'SiteFooter.jsx',
  ];
  const sections = await Promise.all(files.map((file) => (
    readFile(new URL(`../src/components/${file}`, import.meta.url), 'utf8')
  )));

  sections.forEach((section) => {
    assert.doesNotMatch(section, /dangerouslySetInnerHTML|RawMarkup|\.replace\('<h2>'/);
  });
  assert.match(sections[0], /const Heading = standalone \? 'h1' : 'h2'/);
  assert.match(sections[1], /<Heading>Artists of the South<\/Heading>/);
  assert.match(sections[2], /href="https:\/\/wa\.me\/972544520987"/);
  assert.match(sections[3], /<footer>/);
  await assert.rejects(access(new URL('../src/components/RawMarkup.jsx', import.meta.url)));
});
