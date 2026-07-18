# Content Model

The gallery is organized around three primary content types: Collections, Works, and Songs. IDs create relationships; display text and filenames must not be used as relational keys.

## Collections

A Collection groups related Works and defines how a visitor enters that body of content.

Current collection IDs:

- `exhibition` — Exhibition / קולות העוטף
- `pearls-of-truth` — Pearls of Truth / פניני אמת

Core fields include `id`, English and Hebrew titles, description, poster media, slug, enabled state, and sort order. The current local model also includes presentation fields such as number, type, cover, target, and nested works.

## Works

A Work belongs to one Collection through `collectionId`.

Common fields include:

- stable `id` and `collectionId`;
- `titleEn` and `titleHe`;
- image, optional video, and optional thumbnail filenames;
- English and Hebrew status and description;
- format or metadata text;
- availability labels, boolean availability, and optional price;
- related Song IDs derived from Song relationships.

The Exhibition series currently contains six Works. Four are exhibition sale works; `fragility-of-love` and `gate-to-infinity` belong to the complete cycle but were not among the four physical exhibition sale works.

## Songs

A Song represents audio and its optional cover and short preview video.

Common fields include:

- stable `id`;
- English and Hebrew titles;
- artist;
- audio, cover, and optional video filenames;
- English and Hebrew notes;
- comma-separated `relatedWorkIds` in Google Sheets.

Current Song IDs are `lihyot` and `yofi`. Only one audio track should play at a time.

## Relationships

- Collection → Works: `Work.collectionId` equals `Collection.id`.
- Song → Works: each value in `Song.relatedWorkIds` equals a Work ID.
- Runtime Work → Songs: the loader derives `songIds` for each Work.

Approved relationships include:

- `inner-light` ↔ `yofi`
- `hidden-harmony` ↔ `lihyot`

Do not change IDs or relationships without explicit approval.

## ID and naming conventions

- Use lowercase kebab-case IDs: `pearls-of-truth`.
- IDs must be unique within each entity type and stable after publication.
- Use camelCase field names: `titleEn`, `relatedWorkIds`.
- Use `En` and `He` suffixes for localized fields.
- Sort values should be numeric and deterministic.
- `enabled` and `available` should use explicit boolean values in Sheets.

## Media conventions

- Store media under `public/assets/` or an approved subdirectory.
- Store filenames in Google Sheets, for example `inner-light.jpg`.
- Do not fabricate, rename, or replace media without verifying every reference.
- Keep artwork images, covers, audio, video, and brand assets distinct in meaning even when they share a directory.
- Preview video should remain short and non-distracting.

See [GOOGLE_SHEETS.md](GOOGLE_SHEETS.md) for columns and validation rules.
