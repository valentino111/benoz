# Architecture

## Overview

The current project is a React application built with Vite. React renders the page structure, data-driven gallery sections, and all interaction behavior.

## Project structure

```text
.
├── public/                 Static files copied directly into the build
│   └── assets/             Artwork, audio, video, covers, and brand assets
├── src/
│   ├── collections/        Local structured work data by collection
│   ├── components/         React-rendered page sections and controls
│   ├── data/               Collections, Songs, and content loading
│   ├── hooks/              Shared React interaction lifecycles
│   ├── App.jsx             Application composition and content bootstrap
│   ├── main.jsx            React entry point
│   └── styles.css          Global visual and responsive styles
├── docs/                   Project documentation
├── index.html              Vite HTML entry and metadata
└── package.json            Commands and dependencies
```

`dist/` is generated production output and is excluded from the repository. Treat it as a build artifact; do not edit or commit it.

## React composition

`main.jsx` mounts `App`. `App` loads gallery content and composes:

- `EntryScreen`
- `ProjectHub`
- `SiteHeader`
- one reusable `CollectionPage` per enabled Collection
  - data-driven `HeroSection`
  - collection-filtered `ArtworkGallery`
- `MusicSection`
- `StorySection`
- `ExhibitionsSection`
- `ContactSection`
- `SiteFooter`
- `Overlays`

All page sections render JSX directly. Spreadsheet text is normalized as plain text and is never injected as HTML.

## Data flow

1. `App` calls `loadGalleryContent()` after mounting.
2. `contentService.js` requests the Collections, Works, and Songs sheets as CSV.
3. Rows are parsed, filtered to `enabled = TRUE`, sorted, and normalized.
4. Song-to-work relationships are derived from `relatedWorkIds`.
5. Each Collection receives only matching Works, sorted by numeric collection-local order with deterministic ties.
6. If remote loading fails or produces no enabled collections/works, local fallback data is returned.
7. React renders the entry, selector, selected collection page, and global supporting sections.
8. React components and hooks own language, lightbox, audio, dialog, mobile, loader, reveal, parallax, and navigation behavior with lifecycle cleanup.

## Collection navigation

The application deliberately uses the browser History API instead of a routing dependency. Collection URLs use `?collection=<slug-or-id>` and may retain an artwork hash, for example `/?collection=pearls-of-truth#new-work`.

- Entering a Collection pushes a history entry and renders its dedicated page.
- Browser back and the labeled Home/back control return to the collection selector.
- A direct refresh resolves the selected Collection from the query string.
- Invalid or absent collection parameters do not render a mixed gallery.
- Opening a page moves keyboard focus to its `h1`; returning moves focus to the collection selector.

`src/data/collectionPages.js` owns URL serialization, lookup, ID trimming, and collection-local Work sorting. Keeping these policies outside components makes the behavior testable without adding a router.

See [GOOGLE_SHEETS.md](GOOGLE_SHEETS.md) for remote content details and [CONTENT_MODEL.md](CONTENT_MODEL.md) for entity definitions.

## Assets

Vite copies `public/` into the production root. Runtime paths such as `assets/inner-light.jpg` therefore resolve to `public/assets/inner-light.jpg` in development and `/assets/inner-light.jpg` in production.

Media is local; Google Sheets should normally store filenames rather than full local paths. Search the entire repository before renaming any media file.

## Current constraints

- Global styles are contained in one large stylesheet with historical override sections.
- There is no router, state library, TypeScript configuration, or explicit Vite configuration; focused content and collection-page tests use Node's test runner.
- Pearls of Truth local works use a different shape from normalized remote Works.

These constraints should be addressed incrementally through [ROADMAP.md](ROADMAP.md), without redesigning the gallery.
