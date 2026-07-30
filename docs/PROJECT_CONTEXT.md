# Ben Oz Digital Gallery — Project Context

## 1. Project identity

Artist name:

**Ben Oz**

Hebrew:

**בן עוז**

The project is not merely a website. Its long-term identity is:

**Ben Oz Digital Gallery**

It is a digital space where visual art, music, video and text are presented as different expressions of the same underlying idea.

The website should feel closer to a museum or private gallery than to a marketplace.

## 2. Creative principles

The central principles are:

### Artwork first

The artwork must remain the main visual and emotional focus.

Navigation, controls, text and technology should not compete with it.

### Silence is part of the design

Empty space, restrained typography and slow visual rhythm are intentional.

The interface should not feel crowded.

### One Idea. Many Forms.

Visual works, music, video and written text may belong to the same conceptual world.

The site should support relationships between different media without making them feel like separate products.

### Museum, not marketplace

Artworks may include availability and pricing, but commercial information should remain secondary.

The experience must not resemble an online shop.

### Technology disappears

The technical system should feel invisible to the visitor.

The user should experience the work, not the software.

## 3. Visual direction

General style:

- Dark background
- Warm gold accents
- Restrained typography
- Large artwork presentation
- Minimal interface
- Calm transitions
- Limited number of font sizes
- Strong mobile presentation
- No unnecessary visual noise

The design should remain elegant, atmospheric and contemplative.

Avoid:

- bright commercial buttons
- excessive cards
- heavy borders
- dashboard-style layouts
- loud animations
- unnecessary gradients
- visual clutter
- marketplace language

## 4. Languages

The site supports:

- English
- Hebrew

English is the default language.

Hebrew content should use correct right-to-left presentation.

Both language versions should remain aligned in meaning.

Do not automatically rewrite translations.

## 5. Main navigation

The intended main sections include:

- Home
- Gallery
- Artist Note or Artist Story
- Contact

The logo and artist name may act as the Home link.

Contact may include WhatsApp.

Do not display a placeholder `ben-oz.com` address unless a real domain is active.

## 6. Collections

Current collection IDs:

### exhibition

English title:

**Exhibition**

Hebrew subtitle:

**קולות העוטף**

This contains the exhibition works from the broader series.

### pearls-of-truth

English title:

**Pearls of Truth**

Hebrew title:

**פניני אמת**

“Pearls of Truth” is the official English name and should remain consistent across the project.

## 7. Main artwork series

The broader series contains six works.

Four were selected for the physical exhibition.

Current structured artwork IDs and titles:

### human-creator

English:

**The Human Creator**

Hebrew:

**האדם היוצר**

### gaze-of-compassion

English:

**A Gaze of Compassion**

Hebrew:

**מבט של חמלה**

### inner-light

English:

**The Light Within**

Hebrew:

**האור שבפנים**

Related song:

`yofi`

### hidden-harmony

English:

**The Hidden Harmony**

Hebrew:

**ההרמוניה הנסתרת**

Related song:

`lihyot`

### fragility-of-love

English:

**The Fragility of Love**

Hebrew:

**שבריריות האהבה**

This belongs to the complete cycle and was not one of the four exhibition sale works.

### gate-to-infinity

English:

**The Gate to Infinity**

Hebrew:

**השער אל האינסוף**

This belongs to the complete cycle and was not one of the four exhibition sale works.

Do not assume these IDs, titles or relationships should be changed without explicit approval.

## 8. Exhibition details

Four works were physically printed for exhibition.

Print format:

- Fine Art Canvas
- 40 × 60 cm
- Gallery wrap

The physical exhibition price list included individual prices.

A previous exhibition offer also included all four works together for:

**₪12,000**

Treat pricing as editable content, not hard-coded design logic.

## 9. Songs

Current song IDs:

### lihyot

English title:

**Lihyot**

Hebrew title:

**לחיות**

Artist:

**Ben Oz**

Related artwork:

`hidden-harmony`

### yofi

English title:

**Yofi Hu Koach Atzum**

Hebrew title:

**יופי הוא כוח עצום**

Artist:

**Ben Oz**

Related artwork:

`inner-light`

Only one audio track should play at a time.

Song covers may have short hover video animations.

Video should not become a distracting permanent autoplay background.

## 10. Content management

The long-term goal is that artworks and songs can be added without editing React source code.

The content-management structure uses Google Sheets.

Spreadsheet:

**Ben Oz Digital Gallery — Content Manager**

Spreadsheet ID:

`1qS2N_-BPKIP3zXuTYGSFe0zh18u7ECGdZxDspjJG0Ts`

Expected sheets:

- Instructions
- Collections
- Works
- Songs

The React application should load:

- Collections
- Works
- Songs

The Songs sheet currently supplies only `id`, `titleEn`, `titleHe`, and `audio`. Google Sheets assigns one optional song to a Work through `Works.songId`.

Only rows with:

`enabled = TRUE`

should be displayed.

Rows should be ordered using the `sort` field.

Local structured data may remain as a fallback if the remote content cannot be loaded.

## 11. Google Sheets data model

### Collections

Typical fields:

- enabled
- sort
- id
- titleEn
- titleHe
- posterImage
- posterVideo
- descriptionEn
- descriptionHe
- slug

### Works

Typical fields:

- enabled
- sort
- id
- collectionId
- titleEn
- titleHe
- image
- video
- thumbnail
- statusEn
- statusHe
- meta
- descriptionEn
- descriptionHe
- collectorLabelEn
- collectorLabelHe
- availabilityEn
- availabilityHe
- available
- price
- songId

`songId` is singular and optional. It must match an enabled ID in the Songs sheet.

### Songs

Currently used fields:

- enabled
- sort
- id
- titleEn
- titleHe
- audio

Other Songs columns remain available in the sheet but are not currently read by the application.

## 12. Media handling

Media files are stored locally in the project.

Preferred directories may include:

- artwork images
- music covers
- audio
- videos
- branding assets

The spreadsheet should preferably contain only filenames, for example:

`inner-light.jpg`

rather than a complete local path.

The application should resolve the correct asset location.

Before changing a filename, search the entire project for all references.

Do not fabricate filenames.

## 13. Existing technical direction

The exhibition prototype began as a static site.

The long-term technical direction is:

- React
- Vite
- structured content
- data-driven rendering
- Google Sheets content source
- local fallback data
- Netlify deployment

The project should remain easy to maintain.

Avoid embedding large HTML strings inside data objects.

Prefer structured JavaScript objects and reusable React components.

## 14. Mobile behavior

Mobile presentation is important.

Artwork images should remain large enough to feel immersive.

Navigation and language controls must stay aligned.

Image viewing may support pinch-to-zoom where practical.

If explicit zoom controls exist, the displayed zoom percentage must reflect the real zoom level.

Do not break mobile layout while making desktop changes.

## 15. Artwork details

Artwork detail views should remain consistent.

All works should use the same detail architecture unless content availability requires otherwise.

Possible detail content:

- title
- artwork image
- description
- format
- exhibition status
- availability
- price
- related music
- WhatsApp contact

Commercial details should remain visually secondary.

## 16. Image protection

The site previously attempted to discourage direct image saving by disabling right-click.

This is only a deterrent, not true protection.

Do not describe it as secure copyright protection.

Avoid implementing aggressive behavior that harms normal navigation or accessibility.

## 17. Audio behavior

Important rule:

Only one song should play at a time.

Starting a second song should pause the currently playing song.

Preserve this behavior during player changes.

## 18. Logo and branding

The logo is part of the Ben Oz identity.

Existing brand assets may include:

- SVG logo
- light PNG
- dark PNG
- gold PNG
- transparent PNG
- favicon
- Apple Touch icon
- square avatar
- horizontal logo
- vertical logo
- monochrome variations

Do not replace or redraw the logo without explicit approval.

Logo animation, when used, should be subtle and normally triggered by hover rather than constant animation.

## 19. Favicon

There were previous favicon-display issues.

Possible causes included asset paths and browser caching.

When working on favicon behavior:

- inspect `index.html`
- inspect public/root asset locations
- verify production build paths
- avoid duplicating conflicting favicon declarations

## 20. Deployment

Netlify has been used for exhibition versions.

A previous public prototype used a Netlify URL.

Do not assume the current production URL or deployment state without checking.

Before deployment:

- run the production build
- inspect generated paths
- confirm remote Google Sheets access
- verify desktop and mobile
- verify audio playback
- verify Hebrew direction
- verify artwork-song links

## 21. Working method

Creative and strategic decisions are made outside Codex.

Codex is primarily used as a technical implementation tool.

For every task:

1. Understand the requested change.
2. Inspect existing implementation.
3. Change only the relevant files.
4. Preserve content and visual direction.
5. Run the build.
6. Report modified files.
7. State clearly what was and was not tested.

## 22. Current priority

The current architecture is being prepared so that future works, collections, songs and artwork-to-song placement can be managed through Google Sheets without manually editing React components.

The next technical work should focus on making this system reliable, clear and maintainable without changing the existing gallery design.
