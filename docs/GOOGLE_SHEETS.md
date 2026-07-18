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
- Referenced filenames exist under `public/assets/`.
- Pricing and availability agree.
- No unapproved remote URL or HTML is inserted.

The current loader does not enforce all these rules automatically; validation is planned in [ROADMAP.md](ROADMAP.md).

## Fallback behavior

If a request fails, a response is not successful, or no enabled Collections/Works are returned, the application logs a warning and uses local structured data from `src/data/` and `src/collections/`.

The fallback preserves basic gallery availability but is not currently identical to the complete remote model. Treat fallback parity as release work, not as finished functionality.

See [CONTENT_MODEL.md](CONTENT_MODEL.md) for entity relationships.
