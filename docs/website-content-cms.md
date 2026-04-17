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
- `contact`: `heroSection`, `infoSection` (phone/email shared), `formSection` (communication department form block)
- `settings`: `siteName`, `tagline`, `metaTitle`
- `theme`: `primaryColor`, `accentColor`, `fontStyle`
- `projects`: `cards[]`

### Contact page — `formSection`

The `formSection` key inside the `contact` content stores the communication department form block. Both locales are saved (`scope=bilingual`). Fields:

| Field | Localized | Description |
|-------|-----------|-------------|
| `sectionTitle` | yes | Heading shown above the form (e.g. "دائرة التواصل - وهد") |
| `sectionSubtitle` | yes | Sub-heading / representative role text |
| `avatarImage` | no (shared) | URL of the circular representative photo |
| `submitLabel` | yes | Submit button text |
| `orText` | yes | Divider text between submit and WhatsApp button |
| `whatsappLabel` | yes | WhatsApp button label |
| `whatsappNumber` | no (shared) | WhatsApp phone number used for the button link |

## Public Projects

Public projects are managed through the `PublicProject` model (not JSON content).

### Featured Projects (Homepage)

- Each `PublicProject` has an `isFeatured` boolean flag (default `false`).
- A maximum of **2** projects can be featured at any time. The API enforces this limit.
- Featured projects are displayed on the homepage.
- Toggle via `PATCH /api/website/public-projects/:id/featured` with `{ isFeatured: boolean }`.
- Public read endpoint supports filtering: `GET /api/public/projects?featured=true`.

### Deleting a Project

- Projects can be permanently deleted from the project card in the CMS using the delete button.
- A confirmation dialog is shown before deletion to prevent accidental removal.
- Route: `DELETE /api/website/public-projects/:id` — requires `WEBSITE_MANAGEMENT` permission.
- After deletion the project list is automatically refreshed.

### Project Guide (PDF)

- Each `PublicProject` has an optional `projectGuide` field (URL string).
- Stores a single uploaded PDF file URL acting as the project guide.
- Uploaded through the `projectAttachmentsUploader` endpoint in the media step of the form.
- Returned in both the public and edit transforms.

## Locale Behavior

- Default API mode reads/saves one locale with payload `{ locale, content }`.
- The `home` and `contact` pages use bilingual mode with `scope=bilingual` payload `{ ar, en }`.
- If no DB row exists, defaults are served from `lib/website-content/default-content.ts`.

## Editor Workflow

When editing website pages:

1. Keep content data in DB JSON; avoid hardcoded page content.
2. Keep `next-intl` usage for UI labels, not editable content defaults.
3. Persist image URLs inside content JSON.
4. Use existing `/api/website/content/:slug` route contract; avoid custom one-off payload shapes.
