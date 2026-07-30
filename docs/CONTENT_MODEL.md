# Content Model

The gallery is organized around three primary content types: Collections, Works, and Songs. IDs create relationships; display text and filenames must not be used as relational keys.

## Collections

A Collection groups related Works and defines how a visitor enters that body of content.

Current collection IDs:

- `exhibition` — Exhibition / קולות העוטף
- `pearls-of-truth` — Pearls of Truth / פניני אמת

Core fields include `id`, English and Hebrew titles, optional English and Hebrew subtitles, introductory descriptions, poster media, slug, enabled state, and sort order. Published rows normalize `enabled` to `true` and Sheets `sort` to numeric `order`. The normalized model also carries presentation fields such as number, type, card cover, page anchor, and nested works.

Bundled fallback Collections use these same source field names (`titleEn`, `descriptionEn`, `posterImage`, and `sort`) and pass through the same runtime normalizer as Google Sheets Collections.

Every enabled Collection opens as an independent page: a reusable collection introduction is followed by only the Works whose trimmed `collectionId` matches that Collection. Collection cards use each Collection's `cover`; all collection introductions use the shared Ben Oz brand logo at `/assets/brand/ben-oz-logo-gold-transparent.png`. The Exhibition fallback retains its established “The Hidden Geometry of the Soul” subtitle, bilingual manifesto, and series note.

Sheets `descriptionEn` and `descriptionHe` are the exact collection-introduction fields. Remote non-empty text overrides local fallback text; empty remote text preserves a valid localized fallback. English is never substituted into the Hebrew presentation. Pearls of Truth currently has an English fallback description but no approved Hebrew fallback, so its live `descriptionHe` cell must be filled before Hebrew introductory text can appear.

## Works

A Work belongs to one Collection through `collectionId`.

Common fields include:

- stable `id` and `collectionId`;
- `titleEn` and `titleHe`;
- image, optional video, and optional thumbnail filenames;
- English and Hebrew status and description;
- format or metadata text;
- availability labels, boolean availability, and optional price;
- an optional single `songId`.

Bundled fallback Works use this same source shape directly. Both fallback and Google Sheets Works pass through the same runtime normalizer; compatibility-only `textEn`, `textHe`, nested `media`, and plural `songIds` fields are not supported.

`id` identifies a Work and must remain globally unique. The Sheets `sort` value becomes normalized `order` and controls presentation only within the Work's own Collection. The runtime filters by `collectionId` before sorting numerically by `order`; equal values retain source-row order, with Work ID as the final deterministic tie-breaker. Reusing values such as `10`, `20`, and `30` in separate Collections is expected.

The Exhibition series currently contains six Works. Four are exhibition sale works; `fragility-of-love` and `gate-to-infinity` belong to the complete cycle but were not among the four physical exhibition sale works.

## Songs

A Song represents audio and its optional cover and short preview video.

Common fields include:

- stable `id`;
- English and Hebrew titles;
- audio filename or approved path.

Bundled fallback Song IDs are `lihyot` and `yofi`; the published Songs sheet may define additional IDs. Only one audio track should play at a time.

The Songs sheet supplies `id`, `titleEn`, `titleHe`, and `audio`. Its other columns are currently ignored. Bundled Songs provide the same minimal fields as fallback content. Google Sheets controls placement through each Work's optional `songId`.

## Relationships

- Collection → Works: `Work.collectionId` equals `Collection.id`.
- Work → Song: optional `Work.songId` equals an enabled `Songs.id`.

Approved relationships include:

- `inner-light` ↔ `yofi`
- `hidden-harmony` ↔ `lihyot`

Do not change IDs or relationships without explicit approval.

## ID and naming conventions

- Use lowercase kebab-case IDs: `pearls-of-truth`.
- IDs must be unique within each entity type and stable after publication.
- Use camelCase field names: `titleEn`, `songId`.
- Use `En` and `He` suffixes for localized fields.
- Collection `sort` controls collection-selection order; Work `sort` controls order only within its parent Collection.
- Sort values should be numeric. Duplicate Work sort values are allowed and remain stable by source row, then Work ID.
- `enabled` and `available` should use explicit boolean values in Sheets.

## Media conventions

- Store media under `public/assets/` or an approved subdirectory.
- Store filenames in Google Sheets, for example `inner-light.jpg`.
- Do not fabricate, rename, or replace media without verifying every reference.
- Keep artwork images, collection-card covers, audio, video, and brand assets distinct in meaning even when they share a directory.
- Preview video should remain short and non-distracting.

See [GOOGLE_SHEETS.md](GOOGLE_SHEETS.md) for columns and validation rules.
