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
- `Works` — artwork content, availability, and collection membership.
- `Songs` — audio content and artwork relationships.

The current application reads CSV through the Google Visualization endpoint. The spreadsheet must be publicly readable for anonymous production visitors.

## Collections columns

| Column | Purpose |
|---|---|
| `enabled` | Display row only when `TRUE` |
| `sort` | Numeric display order |
| `id` | Stable lowercase kebab-case identifier |
| `titleEn`, `titleHe` | Localized titles |
| `posterImage`, `posterVideo` | Local media filenames |
| `descriptionEn`, `descriptionHe` | Localized descriptions |
| `slug` | Optional public-facing slug; defaults to ID |

## Works columns

| Column | Purpose |
|---|---|
| `enabled`, `sort`, `id` | Visibility, order, and identity |
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

## Songs columns

| Column | Purpose |
|---|---|
| `enabled`, `sort`, `id` | Visibility, order, and identity |
| `titleEn`, `titleHe` | Localized titles |
| `artist` | Display artist; defaults to Ben Oz in current normalization |
| `audio`, `cover`, `video` | Local media filenames |
| `relatedWorkIds` | Comma-separated Work IDs |
| `noteEn`, `noteHe` | Localized artist notes |

## Synchronization flow

1. The browser requests Collections, Works, and Songs concurrently.
2. CSV headers become object keys.
3. Rows with `enabled` other than `TRUE` are excluded.
4. Rows are sorted numerically by `sort`.
5. Media filenames resolve under `assets/` unless already absolute.
6. Song `relatedWorkIds` are converted into Work `songIds`.
7. Works are attached to their matching Collections.
8. The normalized data is passed to React.

Changes are read at page load; there is no background synchronization or write-back to Sheets.

## Validation expectations

Before publishing spreadsheet changes:

- IDs are present, unique, stable, and lowercase kebab-case.
- Every `collectionId` matches an enabled Collection.
- Every `relatedWorkIds` entry matches an enabled Work.
- Required English and Hebrew content is present.
- `enabled` and `available` use explicit `TRUE` or `FALSE`.
- `sort` values are numeric and intentional.
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

## Fallback behavior

If a request fails, a response is not successful, or no enabled Collections/Works are usable, the application logs a development warning and uses local structured data from `src/data/` and `src/collections/`.

The fallback uses the same normalized Collection, Work, and Song relationships as remote content and includes both Exhibition and Pearls of Truth.

See [CONTENT_MODEL.md](CONTENT_MODEL.md) for entity relationships.
