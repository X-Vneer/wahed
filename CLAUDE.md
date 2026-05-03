# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (workspaces enabled, `onlyBuiltDependencies: ["@prisma/engines", "prisma"]`).

```bash
pnpm dev                 # next dev
pnpm build               # next build (uses output: "standalone")
pnpm lint                # eslint
pnpm format              # prettier --write .

pnpm db:generate         # prisma generate (outputs to lib/generated/prisma — re-run after schema edits)
pnpm db:migrate          # prisma migrate dev
pnpm db:migrate:deploy   # used by Docker entrypoint at container start
pnpm db:push             # prisma db push (no migration file)
pnpm db:studio
pnpm db:seed             # tsx prisma/seed.ts
pnpm db:seed:production  # tsx scripts/production-seed.ts
pnpm db:reset
pnpm db:test             # tsx scripts/test-database.ts (smoke test DB connection)
pnpm email:test          # tsx scripts/test-email.ts
```

Required env (see `.env.example`): `DATABASE_URL`, `JWT_SECRET`, `UPLOADTHING_TOKEN`, `OPEN_WEATHER_API_KEY`, `CRON_SECRET`, `PUBLIC_WEBSITE_URL`. Optional: `SMTP_APP_PASSWORD` (only used by `scripts/test-email.ts` against Office 365 SMTP — no production email path wired up yet).

Prisma is configured via `prisma.config.ts` (loads `DATABASE_URL` from `dotenv`); the `datasource` block in `schema.prisma` intentionally has no `url` field.

## Architecture

Next.js 16 App Router app, single Postgres DB, locale-aware. It is both an internal admin/staff dashboard *and* the CMS + public API for a separate marketing website.

### Routing & layouts

- All UI lives under `app/[locale]/`. Locales = `["ar", "en"]` (`config/index.ts` → `LOCALES`). RTL is wired in `app/[locale]/layout.tsx` based on locale; Arabic uses IBM Plex Sans Arabic, others use Satoshi.
- `app/[locale]/(system)/layout.tsx` renders **two different shells** based on role + a `system_layout` cookie:
  - Staff (or admin viewing as staff): hero section + container, no sidebar.
  - Admin (when cookie === `"admin"`): full `AppSidebar` shell.
  - The `LayoutViewSwitcher` toggles the cookie for admins.
- The Next.js middleware file is named **`proxy.ts`** (Next 16 convention), not `middleware.ts`. It handles JWT verification, redirect-to-login, CORS for `/api/public/*`, and chains into `next-intl` middleware.

### Auth

- JWT (HS256, 7d) stored in HTTP-only cookie `access_token` (`SESSION_COOKIE_NAME`). Sign/verify in `lib/jwt.ts` using `jose`.
- `lib/get-access-token.ts` reads + verifies the cookie server-side. `proxy.ts` enforces auth for everything except `publicPages` (`/auth/login`, `/auth/logout`) and `publicApiRoutes` (`/api/auth/*`, `/api/health`, `/api/uploadthing`, `/api/public/*`).
- Login is a server action: `app/[locale]/auth/login/actions.ts`. bcryptjs for password hashing.

### Permissions

- `PermissionKey` enum in `prisma/schema.prisma` is the source of truth (e.g. `WEBSITE_MANAGEMENT`, `STAFF_MANAGEMENT`, `SYSTEM_SETTINGS_MANAGEMENT`). Mirrored in `config/permissions.ts`.
- `User.role = ADMIN | STAFF`. **ADMIN bypasses all permission checks** (see `utils/has-permission.ts`).
- API routes check via `await requirePermission("PERMISSION_KEY")` from `lib/helpers/api.ts` — returns a 403 `NextResponse` or `null`.
- Client-side: `utils/has-client-permission.ts` + `hooks/use-permission.ts`.

### API helpers (`lib/helpers/api.ts`)

Standard route handler pattern — use these instead of rolling your own:

- `initLocale(request)` → `{ locale, t }` (translator from `next-intl/server`).
- `requireAuth(t)` → `{ payload }` or `{ error: NextResponse }`.
- `requirePermission(key)` → `NextResponse | null`.
- `validateRequest(zodSchema, body, t)` → `{ data }` or `{ error: NextResponse }` (uses `transformZodError`).
- `parsePagination(searchParams)` → `{ page, perPage, skip, take }`.
- `convertToPrismaJsonValue`, `emptyToNull` for JSON-column writes.

### Database

- Prisma 7 with the **PrismaPg adapter** (`@prisma/adapter-pg`). Single client in `lib/db.ts` cached on `globalThis` in dev. Generated client lives at **`lib/generated/prisma`** (imports look like `@/lib/generated/prisma/client` and `@/lib/generated/prisma/enums`).
- Migrations in `prisma/migrations/`. Entity-specific business logic lives in subfolders next to migrations (e.g. `prisma/tasks/`, `prisma/projects/`).

### Singleton settings rows

Three models are singletons (one row, `findFirst`/`upsert` patterns) — do not create lists:

- `SystemSiteSettings` — branding/theme of the **admin app itself** (logos, primary/accent CSS vars, login page assets). Loaded in `app/[locale]/layout.tsx` via `getSystemBrandingSafe` and applied as inline `<style>` overriding `--primary`/`--accent`/`--ring` etc.
- `WebsiteSiteSettings` — global appearance, SEO defaults, contact, analytics for the **public marketing website**.
- `StaffPageSettings` — staff dashboard hero image + quick-link URLs.

### Website CMS (public marketing site content)

The admin app is the CMS for an external website; that website pulls content via `/api/public/*`.

- Source of truth: `WebsitePageContent` (unique on `[slug, locale]`, JSON `content`). Image URLs live **inside** the JSON (e.g. `heroSection.backgroundImage`) — there is no separate image column.
- Page slugs / defaults: `lib/website-content/default-content.ts`. Stored content is **deep-merged on top of defaults** by `lib/website-content/service.ts` — partial JSON patches are safe.
- Content API: `/api/website/content/[slug]`. Default mode = single-locale `{ locale, content }`. `?scope=bilingual` mode = `{ ar, en }` (used by the `home` and `contact` pages).
- Writes require `WEBSITE_MANAGEMENT` permission.
- `next-intl` (`messages/{ar,en}.json`) is for **dashboard UI labels only** — never put public website content there.
- Per-page SEO overrides live in `WebsitePageSeo` (also `lib/website-page-seo/service.ts`); fall back to `WebsiteSiteSettings` defaults.
- Public projects (cards on the marketing site) are NOT JSON content — they're full Prisma rows: `PublicProject` + `PublicProjectAttachment` + `PublicProjectBadge` + `PublicProjectFeature`.
- See `docs/website-content-cms.md` and the `.cursor/rules/website-content-*.mdc` files for the full contract.

### Public API & CORS

- Anything under `/api/public/*` is unauthenticated and CORS-wrapped by `proxy.ts`. Allowed origins: `PUBLIC_WEBSITE_URL`, `localhost:3000`, `localhost:3001`. Preflight handled in middleware.
- Don't add new public endpoints elsewhere — the prefix is the security boundary.

### Cron endpoints

- `/api/cron/cleanup-uploadthing` — deletes UploadThing files not referenced in `SystemFile`/`ProjectAttachment`/`TaskAttachment`. Auth via `Authorization: Bearer <CRON_SECRET>` or `x-cron-secret` header. See `docs/cron-uploadthing-cleanup.md`.

### Notifications (`lib/notifications/index.ts`)

Notifications are **i18n-deferred**: `title` stores a translation key (e.g. `"TASK_CREATED"`), `message` stores `JSON.stringify(messageParams)`. The frontend translates at display time using the user's current locale. Do not store already-translated strings. `createNotifications` is fire-and-forget (errors are logged, never thrown).

### Task system

Four **system task statuses** (`isSystem: true`) have hard-coded IDs in `config/index.ts`: `TASK_STATUS_ID_PENDING`, `TASK_STATUS_ID_IN_PROGRESS`, `TASK_STATUS_ID_COMPLETED`, `TASK_STATUS_ID_CANCELLED`. Setting a task to `IN_PROGRESS` should set `startedAt`; `COMPLETED` sets `doneAt`. Their labels can be edited but they cannot be deleted. `TaskTemplate` + `TaskTemplateSubItem` define reusable task definitions cloned into projects on demand.

### Client data layer

- TanStack Query throughout (`lib/tanstack-query`, hooks under `hooks/`). Server components prefetch + dehydrate into `HydrationBoundary` (see `(system)/layout.tsx` for the user-data prefetch pattern).
- `nuqs` for URL-state-as-query-params.
- `react-hook-form` + Mantine form (`@mantine/form` + `mantine-form-zod-resolver`) — schemas in `lib/schemas/`.
- Zustand for cross-tree client state.

### UI

- Tailwind v4 (`@tailwindcss/postcss`), shadcn-style components in `components/ui/`. `DirectionProvider` in `app/[locale]/layout.tsx` propagates RTL/LTR.
- Theme colors are runtime-overridable from `SystemSiteSettings` via injected `<style>` — don't hardcode primary/accent.

### Deployment

Built as a Docker image, pushed to `ghcr.io/x-vneer/internal-system:latest` by `.github/workflows/docker-publish.yml` on push to `main`. Container entrypoint runs `prisma migrate deploy` then `node server.js` (Next.js standalone output). `DATABASE_URL` and `JWT_SECRET` are injected at runtime, never baked in. See `README.md` for Hostinger deployment notes.

## Conventions

- Code files use kebab-case names (`use-task-status.ts`, `staff-page-settings-context.tsx`).
- Bilingual fields on Prisma models follow `nameAr`/`nameEn`, `titleAr`/`titleEn`, etc. — when adding new bilingual fields keep this naming.
- After editing `prisma/schema.prisma` always run `pnpm db:generate`. The generated client is checked in at `lib/generated/prisma`, so type errors elsewhere often mean a stale generate.
- Path alias `@/*` maps to repo root.
- No test framework configured — there is no jest/vitest setup. `db:test` and `email:test` are smoke scripts, not unit tests.
