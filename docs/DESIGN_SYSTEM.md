# Design System

## Design intent

The design should be restrained, atmospheric, elegant, and contemplative. It is a museum experience, not a dashboard, shop, or conventional commercial portfolio.

## Color

Current core CSS tokens:

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#070707` | Primary dark background |
| `--panel` | `#11100e` | Quiet elevated surfaces |
| `--gold` | `#e8d6a5` | Primary text and accent |
| `--gold-deep` | `#c89e58` | Secondary accent |
| `--muted` | `#b9ab87` | Supporting text |
| `--line` | translucent gold | Subtle separators and borders |

Use gold sparingly. Commercial actions must not become louder than the artwork. Verify contrast whenever text is small, muted, or placed over imagery.

## Typography

The current interface uses Georgia and serif fallbacks, with Hebrew serif fallbacks where defined. Typography should use a limited scale, calm line spacing, and generous measure.

- Display type is reserved for the gallery identity and major artwork titles.
- Body text should remain readable and secondary to imagery.
- Small uppercase labels should be used sparingly and checked for contrast.
- English and Hebrew must remain equivalent in hierarchy.

## Spacing and layout

- Use generous whitespace as an intentional design element.
- Present artwork at a large, immersive scale.
- Keep primary content within restrained maximum widths.
- Prefer simple one- or two-column layouts over dense card grids.
- Borders, panels, and decorative effects should remain subtle.
- Commercial details belong below or beside the artwork, never above it visually.

## Interaction

- Transitions should be calm and short enough not to obstruct navigation.
- Respect `prefers-reduced-motion`.
- Do not use permanent autoplay video backgrounds.
- Hover video may preview a Song cover, with a usable touch alternative.
- Only one Song may play at a time.
- Zoom percentage must reflect the actual zoom level.
- Logo animation, if present, should be subtle and interaction-triggered.

## Mobile philosophy

Mobile is a primary gallery surface, not a reduced desktop version.

- Keep artwork large while preventing horizontal overflow.
- Preserve safe-area spacing.
- Keep navigation and language controls aligned.
- Use touch targets of approximately 44×44 CSS pixels or larger.
- Preserve readable type and calm spacing on narrow screens.
- Test swipe, pinch zoom, audio, dialogs, and Hebrew direction on real devices.

## Accessibility

- Use semantic landmarks and a logical heading hierarchy.
- Provide meaningful alt text in the active language.
- Ensure all controls have accessible names and visible keyboard focus.
- Dialogs and lightboxes must manage focus and support Escape.
- Do not rely on hover, color, or gesture alone.
- Preserve normal navigation and accessibility when discouraging image saving.
- Use `lang="he"` and `dir="rtl"` where Hebrew context requires it.

See [VISION.md](VISION.md) for philosophy and [CONTRIBUTING.md](CONTRIBUTING.md) for review expectations.
