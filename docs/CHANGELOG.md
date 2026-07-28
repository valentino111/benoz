# Changelog

All notable project changes should be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) conventions and is intended to support future semantic version entries. Dates use `YYYY-MM-DD`.

## [Unreleased]

### Added

- Dedicated, directly addressable pages for each enabled Collection.
- Reusable bilingual collection introductions backed by normalized Collection data.
- History API navigation between the collection selector and Collection pages.
- Regression coverage for collection isolation, local ordering, intro fallback, bilingual content, and URL state.
- React hooks for fade reveal, collection hero parallax, and ambient sound.

### Changed

- Work `sort` values now control order only within each Work's Collection.
- React now owns all runtime interaction behavior, including navigation, overlays, media controls, header controls, loader, reveal, and parallax.
- Removed the legacy imperative browser runtime.
- Replaced the remaining static HTML injection wrapper with direct JSX components.

### Planned

- Architecture, accessibility, performance, and production-readiness work described in [ROADMAP.md](ROADMAP.md).

## [0.1.0] - 2026-07-18

### Added

- React and Vite application foundation.
- Collection entrance for Exhibition and Pearls of Truth.
- Structured local Collection, Work, and Song data.
- Google Sheets CSV content loading with local fallback.
- English and Hebrew presentation.
- Artwork gallery, details dialog, lightbox, related-song links, and audio playback.
- Responsive gallery layouts, mobile navigation, swipe navigation, and pinch zoom.
- Local artwork, music, video, and branding assets.
- Initial project and engineering documentation.

### Notes

- This release is a foundation version, not Release 1.0.
- See [ROADMAP.md](ROADMAP.md) for planned stabilization work.

[Unreleased]: https://github.com/valentino111/benoz/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/valentino111/benoz/releases/tag/v0.1.0
