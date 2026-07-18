# Ben Oz Digital Gallery — Agent Instructions

This repository contains the official Ben Oz Digital Gallery.

Before making any changes, always read:

- `docs/PROJECT_CONTEXT.md`
- `README.md`
- `package.json`

## Core principles

The project must follow these principles:

- Artwork first.
- Silence is part of the design.
- One Idea. Many Forms.
- Museum, not marketplace.
- Technology disappears.

The gallery should feel restrained, atmospheric, elegant and contemplative.

Do not turn it into a conventional commercial portfolio, online shop or visually noisy website.

## General rules

- Do not redesign pages unless explicitly requested.
- Do not rewrite titles, descriptions or artist statements without approval.
- Preserve both English and Hebrew content.
- English is the default site language.
- Do not remove existing content unless explicitly instructed.
- Do not rename media files without checking all references.
- Do not invent missing artwork, song or collection data.
- Preserve existing artwork-to-song relationships.
- Keep the interface visually quiet.
- Avoid unnecessary animations, UI elements, borders and decorative effects.
- Avoid adding dependencies unless they are clearly necessary.
- Prefer simple, maintainable React code.
- Keep content separate from presentation logic.
- Preserve mobile behavior unless the task explicitly changes it.
- Preserve accessibility where possible.
- Do not expose internal implementation details in the visible website.

## Content architecture

The site is intended to be data-driven.

Primary content types:

- Collections
- Works
- Songs

Content may be loaded from Google Sheets, with local data used as a fallback.

Media files are stored locally in the project assets.

Google Sheets should normally contain filenames rather than complete local asset paths.

## Technical workflow

Before editing:

1. Inspect the relevant files.
2. Explain briefly what will be changed.
3. Avoid unrelated refactoring.

After editing:

1. Run `npm run build`.
2. Fix any errors caused by the changes.
3. Report every modified file.
4. Summarize the implementation.
5. Mention any remaining risks or manual steps.

Never claim that a build succeeded unless it was actually run successfully.

## Scope discipline

When given a specific task:

- Change only what is required.
- Do not improve unrelated parts of the project.
- Do not replace working architecture without a clear reason.
- Do not change visual design while performing a data or infrastructure task.
- Do not change content while performing a technical task.

If the request is ambiguous, ask before making broad changes.
