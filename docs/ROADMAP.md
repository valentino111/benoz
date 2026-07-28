# Roadmap

This roadmap distinguishes existing functionality from planned engineering work. It is directional and should be updated when scope is approved.

## Current status — v0.1 Foundation

Current functionality includes:

- React and Vite application foundation;
- collection entrance for Exhibition and Pearls of Truth;
- structured local Collection, Work, and Song data;
- Google Sheets CSV loading for Collections, Works, and Songs;
- local fallback content when remote loading fails;
- English and Hebrew presentation;
- artwork gallery, details dialog, lightbox, audio players, and related-song links;
- responsive layouts, mobile navigation, swipe navigation, and pinch zoom;
- local media assets and an existing production build.

The legacy interaction runtime has been removed. React components and hooks own the application behavior, automated lint, unit, build, and browser regression checks are present, and bundled fallback Works share the canonical Google Sheets runtime shape.

## Milestone 1 — Stabilize the content pipeline

Planned engineering work:

- define one canonical schema for Collections, Works, and Songs;
- validate required fields, IDs, references, booleans, sorting, and filenames;
- add request timeout and clear loading/fallback states;
- keep local fallback behavior aligned with remote behavior;
- document content-editing checks and failure recovery.

## Milestone 2 — Stabilize the application architecture

Planned engineering work:

- keep interaction behavior in maintainable React components and hooks;
- preserve explicit lifecycle cleanup for global browser behavior;
- replace static HTML strings with JSX where practical;
- organize styles by responsibility without changing the visual direction;
- add error boundaries and useful diagnostics that remain invisible in the visitor experience.

## Milestone 3 — Release 1.0 readiness

Release work should include:

- automated content validation, linting, build checks, and targeted tests;
- keyboard and screen-reader verification;
- desktop and real-device mobile testing;
- media-size optimization and performance measurement;
- SEO, manifest, favicon, and production metadata review;
- Netlify preview verification, including Sheets access and fallback behavior;
- final review of English/Hebrew alignment and artwork-song relationships.

## Future direction after 1.0

Future work may improve the ease of adding approved collections, artworks, songs, covers, audio, and short videos through the documented content model. Such work must not introduce unapproved sections, marketplace behavior, or content.

See [ARCHITECTURE.md](ARCHITECTURE.md), [CONTENT_MODEL.md](CONTENT_MODEL.md), and [DEPLOYMENT.md](DEPLOYMENT.md) for implementation constraints and release checks.
