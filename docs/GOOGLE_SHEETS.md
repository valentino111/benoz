# Google Sheets Content Source

## Overview

The application attempts to load gallery content from **Ben Oz Digital Gallery — Content Manager** before using local fallback data.

Spreadsheet ID:

```text
1qS2N_-BPKIP3zXuTYGSFe0zh18u7ECGdZxDspjJG0Ts
```

Expected sheets:

- `Instructions` — human editing guidance; not loaded by the application.
- `Collections` — collection identity and poster information.
- `Works` — artwork content, availability, collection membership, and an optional Song reference.
- `Songs` — song identity, localized title, and audio path.

The current application reads CSV through the Google Visualization endpoint. The spreadsheet must be publicly readable for anonymous production visitors.

## Collections columns

The inspected production `Collections` sheet currently has these exact headers: `enabled`, `sort`, `id`, `titleEn`, `titleHe`, `posterImage`, `posterVideo`, `descriptionEn`, `descriptionHe`, and `slug`. The loader also accepts optional `subtitleEn` and `subtitleHe` columns when the sheet is extended; they are not present in the current sheet.

| Column | Purpose |
|---|---|
| `enabled` | Display row only when `TRUE` |
| `sort` | Numeric order on the collection-selection screen |
| `id` | Stable lowercase kebab-case identifier |
| `titleEn`, `titleHe` | Localized titles |
| `subtitleEn`, `subtitleHe` | Optional localized collection-page subtitle; local fallback is retained when empty |
| `posterImage` | Collection-selection card image; never the collection-intro logo |
| `posterVideo` | Optional collection poster-video metadata; never the collection-intro logo |
| `descriptionEn`, `descriptionHe` | Exact English and Hebrew collection-introduction text fields |
| `slug` | Optional public-facing slug; defaults to ID |

The normalized local presentation model may additionally provide `noteEn`, `noteHe`, and `pageId` to preserve approved collection-specific presentation. These are not parallel spreadsheet columns and are not editable through the current sheet.

`posterImage` resolves to the `cover` used by the collection-selection card. It is deliberately not reused in the collection introduction. `posterVideo` remains normalized collection poster metadata but also does not replace the intro logo. Every collection introduction uses the same existing brand asset, `/assets/brand/ben-oz-logo-gold-transparent.png`; there is no editable logo column in Sheets.

For localized intro text, a non-empty remote `descriptionEn` or `descriptionHe` value overrides the matching fallback. Empty or whitespace-only remote text preserves a valid fallback in the same language, and English is not copied into Hebrew. At the time of the 2026-07-18 inspection, the Pearls of Truth row had empty `descriptionEn` and `descriptionHe` cells. Its English intro therefore comes from local fallback content; no approved Hebrew fallback exists, so the `descriptionHe` cell in the Pearls row must be filled to publish Hebrew intro text.

## Works columns

| Column | Purpose |
|---|---|
| `enabled`, `sort`, `id` | Visibility, collection-local order, and globally unique identity |
| `collectionId` | Parent Collection ID |
| `titleEn`, `titleHe` | Localized titles |
| `image`, `video`, `thumbnail` | Local media filenames |
| `statusEn`, `statusHe` | Exhibition or series status |
| `meta` | Format or supporting metadata |
| `descriptionEn`, `descriptionHe` | Localized descriptions |
| `collectorLabelEn`, `collectorLabelHe` | Collector-facing label |
| `availabilityEn`, `availabilityHe` | Localized availability text |
| `available` | Boolean sale availability |
| `price` | Editable display price |
| `songId` | Optional single ID from the `Songs` sheet |

The relationship column is singular: use `songId`, not `songIds`. A Work can reference at most one song.

## Songs columns

| Column | Purpose |
|---|---|
| `enabled`, `sort`, `id` | Visibility, order, and stable identity |
| `titleEn`, `titleHe` | Localized song titles shown beside the Work |
| `audio` | Local audio filename or approved path |

The remaining existing Songs columns (`artist`, `cover`, `video`, `relatedWorkIds`, `noteEn`, and `noteHe`) are currently ignored by the application.

## Synchronization flow

1. The browser requests Collections, Works, and Songs concurrently.
2. CSV headers become object keys.
3. Rows with `enabled` other than `TRUE` are excluded.
4. Collections are sorted numerically by their `sort` value.
5. Media filenames resolve under `assets/` unless already absolute.
6. Each optional Work `songId` is checked against enabled rows in the Songs sheet.
7. Work IDs and `collectionId` values are trimmed, and Works are attached to their matching Collections.
8. For each Collection, its Works are filtered first and then sorted numerically by `sort` (normalized as `order`). Equal values retain source-row order, then Work ID.
9. The normalized data is passed to React as independent collection pages.

Changes are read at page load; there is no background synchronization or write-back to Sheets.

## Validation expectations

Before publishing spreadsheet changes:

- IDs are present, unique, stable, and lowercase kebab-case.
- Every `collectionId` matches an enabled Collection.
- Every non-empty `Works.songId` matches an enabled `Songs.id`.
- Required English and Hebrew content is present.
- `enabled` and `available` use explicit `TRUE` or `FALSE`.
- `sort` values are numeric and intentional.
- Work `sort` values need to be unique only within the intended sequence when editors want a strict order; the same values may be reused in different Collections.
- Referenced filenames exist under `public/assets/`. A collection poster that fails to load falls back visually to the matching local collection cover.
- Pricing and availability agree.
- No unapproved remote URL or HTML is inserted.

The loader validates these rules before normalization and reports rejected rows in the development console with the sheet, source row, row ID, field, classification, and exact reason.

## Editorial row states

The content pipeline distinguishes three row states:

- **Published:** `enabled = TRUE` and all required public fields are valid.
- **Draft:** `enabled = FALSE`; the row remains intentionally unpublished and is not treated as a validation error.
- **Rejected public row:** `enabled = TRUE` but a required field is invalid or missing. The row is excluded and receives a development diagnostic.

Artwork images are part of the existing Work presentation, and the gallery has no approved placeholder design. An enabled Work with an empty `image` is therefore excluded as `enabled-public-missing-media` until its real image filename is supplied. Its text is not substituted into another Work and no placeholder is invented.

Remote Collection rows are merged with matching local Collections by `id`. Non-empty remote values override local values; empty or whitespace-only remote visual fields retain the local value. The local cover is also retained as a background fallback when a non-empty remote poster filename cannot be loaded.

Example collection-local ordering:

```text
exhibition:      work-a sort 10, work-b sort 20
pearls-of-truth: work-c sort 10, work-d sort 20
```

`work-c` is first on the Pearls of Truth page. A Work ID is never interpreted as display order.

## Fallback behavior

If a request fails, a response is not successful, or no enabled Collections/Works are usable, the application logs a development warning and uses local structured data from `src/data/` and `src/collections/`.

The fallback uses the same normalized Collection, Work, and minimal Song fields as remote content.

See [CONTENT_MODEL.md](CONTENT_MODEL.md) for entity relationships.
