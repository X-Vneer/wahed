# Website Content CMS (JSON-first)

For **next-intl usage**, dashboard vs content boundaries, and how to add new CMS pages, see the developer README at `app/[locale]/(system)/website/README.md`.

## Scope

This project stores editable website page content in DB JSON by `slug` and `locale`.

- DB source of truth: `WebsitePageContent` model
- UI translation source: `messages/*.json` (`next-intl`) for labels/messages only
- Content API: `/api/website/content/:slug`

## JSON Contract

Each row stores:

- `slug`: `home | about | contact | settings | theme | projects`
- `locale`: `ar | en`
- `content`: JSON object for page sections and image URLs

Examples:

- `home`: `heroSection.title`, `heroSection.description`, `heroSection.ctaLabel`, `heroSection.backgroundImage`
- `about`: `heading`, `summary`
- `contact`: `email`, `phone`, `linkedin`, `instagram`
- `settings`: `siteName`, `tagline`, `metaTitle`
- `theme`: `primaryColor`, `accentColor`, `fontStyle`
- `projects`: `cards[]`

## Locale Behavior

- Default API mode reads/saves one locale with payload `{ locale, content }`.
- Home page supports bilingual mode with `scope=bilingual` payload `{ ar, en }`.
- If no DB row exists, defaults are served from `lib/website-content/default-content.ts`.

## Editor Workflow

When editing website pages:

1. Keep content data in DB JSON; avoid hardcoded page content.
2. Keep `next-intl` usage for UI labels, not editable content defaults.
3. Persist image URLs inside content JSON.
4. Use existing `/api/website/content/:slug` route contract; avoid custom one-off payload shapes.
