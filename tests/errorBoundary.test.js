import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('the React root has a recoverable production error boundary', async () => {
  const [main, boundary] = await Promise.all([
    readFile(new URL('../src/main.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ErrorBoundary.jsx', import.meta.url), 'utf8'),
  ]);

  assert.match(main, /<ErrorBoundary>\s*<App \/>\s*<\/ErrorBoundary>/);
  assert.match(boundary, /static getDerivedStateFromError/);
  assert.match(boundary, /componentDidCatch/);
  assert.match(boundary, /className="app-error" role="alert"/);
  assert.match(boundary, /window\.location\.reload\(\)/);
  assert.match(boundary, /if \(import\.meta\.env\.DEV\) console\.error/);
});
