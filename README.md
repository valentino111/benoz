# Ben Oz Digital Gallery — v0.1 Foundation

Collection-first React + Vite architecture.

## Collections

- Exhibition
- Pearls of Truth / פניני אמת

Animation and music belong to individual works rather than separate site sections. Each Work may reference one locally defined song through its `songId` field.

## Run

```bash
npm install
npm run dev -- --host
```

## Test

```bash
npm test
npx playwright install chromium
npm run test:e2e
```
