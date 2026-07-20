# Contributing

## Before making changes

Read:

1. `AGENTS.md`
2. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)
3. the root `README.md`
4. `package.json`
5. the relevant document in this directory

Confirm the requested scope before changing content, visual design, IDs, media, or architecture.

## Core rules

- Change only what the task requires.
- Preserve the museum-like visual direction.
- Do not rewrite approved English or Hebrew content without approval.
- Do not invent missing Works, Songs, Collections, prices, or relationships.
- Do not rename media without searching every reference.
- Keep content separate from presentation logic.
- Avoid unrelated refactoring and unnecessary dependencies.
- Preserve mobile behavior and accessibility.
- Do not expose internal technical details in the visitor-facing interface.

## Coding conventions

- Prefer small, readable React components.
- Use stable lowercase kebab-case content IDs.
- Use camelCase JavaScript and field names.
- Use `En` and `He` suffixes for localized fields.
- Use semantic HTML and native controls before custom ARIA behavior.
- Clean up effects, listeners, observers, timers, and media resources.
- Keep remote content as data; do not render untrusted HTML.
- Treat `dist/` as generated output.

## Workflow

1. Inspect the relevant implementation and data.
2. State briefly what will change.
3. Make the smallest coherent change.
4. Review the diff for unrelated edits.
5. Run the required checks.
6. Report every modified file, validation result, remaining risk, and manual step.

## Build and testing requirements

Every change must run:

```bash
npm run build
```

The repository does not currently include automated tests or lint scripts. Until those are added, use targeted manual checks appropriate to the change. Content changes should verify IDs, relationships, both languages, and asset filenames. Interaction changes should verify keyboard, mobile, reduced-motion, and media behavior.

Never claim a check passed unless it was actually run.

## Pull requests

A pull request should include:

- a concise description of what changed and why;
- the exact files changed;
- content or design decisions requiring approval;
- commands and manual checks performed;
- screenshots only when visual behavior changed;
- known risks, fallback behavior, and follow-up work.

Keep pull requests focused. Do not combine content changes, redesign, and infrastructure work unless they are inseparable and explicitly approved.

See [DEPLOYMENT.md](DEPLOYMENT.md) for release checks and [CONTENT_MODEL.md](CONTENT_MODEL.md) for data rules.
