# Deployment

## Prerequisites

- A supported Node.js and npm installation.
- Repository access.
- Public read access to the configured Google Sheets content source for remote content.

## Local development

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

To expose the development server on the local network when needed:

```bash
npm run dev -- --host
```

## Production build

Create production output:

```bash
npm run build
```

Vite writes the result to `dist/`. Files under `public/` are copied to the build root. Do not edit generated `dist/` files as source.

Preview the production build locally:

```bash
npm run preview
```

## Netlify

Netlify has been used for previous exhibition versions. The repository does not currently define a checked-in Netlify configuration, so confirm settings in the target Netlify site rather than assuming them.

Typical settings for the current Vite project are:

```text
Build command: npm run build
Publish directory: dist
```

Do not claim or document a production URL until it is confirmed active.

## Production checklist

Before deployment:

- run `npm install` or a clean lockfile-based install in CI;
- run `npm run build` successfully;
- inspect generated paths and asset responses;
- confirm Google Sheets is publicly readable;
- verify fallback behavior with remote access unavailable;
- verify every Collection, Work, Song, ID, and relationship;
- verify artwork, covers, audio, preview video, brand assets, and favicon;
- test English and Hebrew, including RTL layout;
- test desktop and mobile navigation, dialogs, zoom, swipe, and audio exclusivity;
- check keyboard navigation and visible focus;
- review browser console errors and failed network requests;
- verify contact links and current exhibition content;
- review metadata, manifest, caching, and security headers.

After deployment, test the deployed URL rather than relying only on local preview behavior.

See [GOOGLE_SHEETS.md](GOOGLE_SHEETS.md) for content-source requirements and [CONTRIBUTING.md](CONTRIBUTING.md) for change verification.
