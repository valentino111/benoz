import { readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const ignored = new Set(['.git', 'dist', 'node_modules']);
const inspectedExtensions = new Set(['.css', '.html', '.js', '.jsx', '.mjs']);
const syntaxExtensions = new Set(['.js', '.mjs']);
const failures = [];

function visit(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      visit(path);
      continue;
    }
    if (!inspectedExtensions.has(extname(entry.name))) continue;

    const label = relative(root, path);
    const source = readFileSync(path, 'utf8');
    if (/^(<<<<<<<|=======|>>>>>>>)/m.test(source)) failures.push(`${label}: unresolved merge marker`);
    source.split('\n').forEach((line, index) => {
      if (/[ \t]+$/.test(line)) failures.push(`${label}:${index + 1}: trailing whitespace`);
    });

    if (syntaxExtensions.has(extname(entry.name))) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      if (result.status !== 0) failures.push(`${label}: ${result.stderr.trim()}`);
    }
  }
}

visit(root);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Lint checks passed.');
}
