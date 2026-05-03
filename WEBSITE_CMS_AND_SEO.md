# Wahed Internal System — CMS & SEO Integration Guide

This document describes how the public website should consume content, SEO metadata, and site settings from the Wahed internal system (the CMS backend). All data is managed through the internal admin panel and served via public read-only API endpoints.

---

## Architecture Overview

```
Internal System (CMS)                    Public Website
┌──────────────────────┐                ┌──────────────────────┐
│  Admin Panel         │                │  Next.js Frontend    │
│  ├─ Site Settings    │                │                      │
│  ├─ Page Content     │   Public API   │  Fetches:            │
│  ├─ Page SEO         │ ──────────────>│  ├─ Site settings    │
│  └─ Public Projects  │  (read-only)   │  ├─ Page SEO        │
│                      │                │  ├─ Project SEO     │
│  Database (Postgres) │                │  └─ Page content *  │
└──────────────────────┘                └──────────────────────┘

* Page content is fetched via admin API (authenticated) or
  can be exposed publicly if needed.
```

### Key Principles

- **Bilingual**: All content supports Arabic (`ar`) and English (`en`).
- **SEO Fallback**: Page-level SEO inherits from site-wide defaults when fields are empty.
- **Deep Merge**: Page content is deep-merged with hardcoded defaults — only overridden fields are stored.
- **Locale Resolution**: Pass `?locale=ar` or `?locale=en` as a query parameter. Falls back to `Accept-Language` header, then `ar`.

---

## Public API Endpoints (No Authentication Required)

Base URL: `{INTERNAL_SYSTEM_URL}/api/public/website`

### 1. Site Settings

```
GET /api/public/website/settings?locale=ar
```

Returns global theme, fonts, logos, site name, default SEO, contact info, social media links, and analytics config.

**Response:**
```json
{
  "locale": "ar",
  "theme": {
    "primaryColor": "#0f172a",
    "accentColor": "#2563eb",
    "blackColor": "#000000",
    "secondaryTextColor": "#64748b"
  },
  "fonts": {
    "fontAr": "\"Inter\", sans-serif",
    "fontEn": "\"Inter\", sans-serif",
    "family": "\"Inter\", sans-serif",
    "googleFontsCssHref": "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  },
  "logos": {
    "forDarkBackground": "https://...",
    "forLightBackground": "https://..."
  },
  "siteName": "وهد العمرانية",
  "seo": {
    "defaultMetaTitle": "وهد العمرانية",
    "defaultMetaDescription": "...",
    "ogImageUrl": "https://...",
    "siteUrl": "https://wahed.sa",
    "twitterSite": "@wahed",
    "robotsAllowIndex": true,
    "keywords": "عقارات, استثمار, ..."
  },
  "contact": {
    "email": "info@wahdeinvestment.sa",
    "phone": "+96658241563"
  },
  "socialMedia": {
    "facebook": "https://facebook.com/yourpage",
    "instagram": "https://instagram.com/yourpage",
    "youtube": "https://youtube.com/@yourchannel",
    "x": "https://x.com/yourhandle",
    "whatsapp": "https://wa.me/9665XXXXXXXX"
  },
  "faviconUrl": "https://...",
  "googleAnalyticsMeasurementId": "G-XXXXXXXXXX"
}
```

**Caching:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

**How to use:**
- Load on app initialization or in the root layout.
- Apply `theme` colors as CSS variables or Tailwind config.
- Add `<link rel="stylesheet" href={fonts.googleFontsCssHref} />` to `<head>`.
- Set `font-family` using `fonts.family` (locale-resolved) or `fonts.fontAr`/`fonts.fontEn` directly.
- Use `logos.forDarkBackground` on dark sections, `logos.forLightBackground` on light sections.
- Use `siteName` as text next to the logo and as a fallback when the logo is missing (resolves to Arabic or English based on `?locale=`).
- Use `seo` values as fallback metadata when page-specific SEO is not set.
- Render `socialMedia.*` links in the footer; any field may be `null` when not configured.
- Use `faviconUrl` for `<link rel="icon">`.
- Initialize Google Analytics with `googleAnalyticsMeasurementId`.

---

### 2. Page SEO

```
GET /api/public/website/seo/{slug}?locale=ar
```

Returns SEO metadata for a specific page. Values are already merged with site-wide defaults (page-level values win, empty fields fall back to defaults).

**Valid slugs:** `home`, `about`, `contact`, `projects`

**Response:**
```json
{
  "slug": "home",
  "locale": "ar",
  "seo": {
    "metaTitle": "الرئيسية | وهد العمرانية",
    "metaDescription": "اكتشف مشاريعنا العقارية...",
    "keywords": "عقارات, استثمار",
    "canonicalUrl": "https://wahed.sa",
    "ogImageUrl": "https://...",
    "twitterHandle": "@wahed",
    "robotsAllowIndex": true
  }
}
```

**How to use in Next.js `generateMetadata`:**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const { locale } = await params
  const res = await fetch(`${CMS_URL}/api/public/website/seo/home?locale=${locale}`)
  const { seo } = await res.json()

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    alternates: { canonical: seo.canonicalUrl },
    openGraph: {
      title: seo.metaTitle,
      description: seo.metaDescription,
      images: seo.ogImageUrl ? [seo.ogImageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle,
      title: seo.metaTitle,
      description: seo.metaDescription,
    },
    robots: seo.robotsAllowIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
  }
}
```

---

### 3. Project SEO

```
GET /api/public/website/projects/{projectSlug}/seo?locale=ar
```

Returns SEO metadata for a specific project page. Same fallback behavior as page SEO.

**Response:** Same shape as Page SEO response above.

**Note:** The internal system stores project SEO using the slug pattern `project/{projectSlug}` in the `WebsitePageSeo` table.

**404:** Returns `{ "error": "Not found" }` with status 404 if the project slug doesn't exist.

---

### 4. Page Content

```
GET /api/public/website/content/{slug}?locale=ar
```

Returns the full content for a specific page, deep-merged with defaults. Read-only, no authentication.

**Valid slugs:** `home`, `about`, `contact`, `projects`, `settings`, `theme`

**Response:**
```json
{
  "slug": "home",
  "locale": "ar",
  "content": {
    "heroSection": { "title": "...", "description": "...", ... },
    "briefSection": { "content": "...", "image": "..." },
    ...
  }
}
```

**Caching:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`

---

### 5. Contact Form Submission

```
POST /api/public/contact
```

Submits a contact form message. No authentication required. The endpoint validates input, stores the message, and notifies all admin users.

**Request Body:**
```json
{
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "phone": "+966501234567",
  "message": "أرغب في الاستفسار عن المشروع...",
  "source": "project",
  "projectSlug": "al-nakheel-residences"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | `string` | Yes | Sender's first name |
| `lastName` | `string` | Yes | Sender's last name |
| `email` | `string` | Yes | Valid email address |
| `phone` | `string` | Yes | Phone number |
| `message` | `string` | Yes | Message content |
| `source` | `"general" \| "project"` | No | Where the form was submitted from. Defaults to `"general"` |
| `projectSlug` | `string` | No | The project slug, when `source` is `"project"` |

**Response (201):**
```json
{
  "message": "Your message has been sent successfully"
}
```

**How to use:**
- For the main contact page form, send with `source: "general"` (or omit `source`).
- For the project page contact form, send with `source: "project"` and `projectSlug` set to the current project's slug.
- Admin users can filter contact messages by source in the internal system.

---

## Page Content Structure

Page content is managed in the CMS admin and stored as flexible JSON per page per locale. The content is deep-merged with hardcoded defaults — if a field is not explicitly set by the admin, the default value is used.

### Page Slugs and Their Content Structure

#### `home` — Homepage

```json
{
  "heroSection": {
    "title": "اكتشف مساحتك...",
    "description": "ابدأ رحلتك نحو...",
    "ctaLabel": "تعرف أكثر",
    "backgroundImage": "https://..."
  },
  "briefSection": {
    "content": "تسعى شركة وهد...",
    "image": "https://..."
  },
  "aboutSection": {
    "titlePartOne": "عن",
    "titlePartTwo": "وهد العمرانية",
    "description": "نسخر خبرتنا في...",
    "ctaLabel": "تعرف أكثر",
    "image": "https://..."
  },
  "statsSection": {
    "isActive": false,
    "firstValue": "20+",
    "firstLabel": "إجمالي مساحة المشاريع",
    "secondValue": "119K+",
    "secondLabel": "متر مربع مبني",
    "thirdValue": "10+",
    "thirdLabel": "عام من الخبرة"
  },
  "partnersSection": {
    "isActive": false,
    "eyebrowTitle": "بوابة التواصل",
    "title": "تحالف الريادة",
    "description": "...",
    "logos": ["https://logo1.png", "https://logo2.png"]
  },
  "contactSection": {
    "eyebrowTitle": "بوابة التواصل",
    "title": "بداية الحوار",
    "description": "...",
    "ctaLabel": "اضغط هنا"
  },
  "projectsSection": {
    "isActive": true,
    "eyebrowTitle": "بلورة الإبداع",
    "title": "مشاريعنا",
    "description": "مشاريعنا هي بلورة الإبداع والفخامة..."
  }
}
```

**Important:** Check `isActive` on `statsSection`, `partnersSection`, and `projectsSection` — only render these sections when `isActive` is `true`. The `projectsSection` is the heading + intro shown above the homepage projects carousel; the actual project cards come from `PublicProject` records (see Public Projects below).

#### `about` — About Page

```json
{
  "heroSection": {
    "backgroundImage": "https://...",
    "eyebrowTitle": "قصة ثقة ورؤية",
    "title": "استثمار ناجح يبدأ برؤية واضحة...",
    "description": ""
  },
  "storySection": {
    "eyebrowTitle": "صياغة الأثر",
    "title": "قصتنا",
    "content": "انطلقت شركة وهد..."
  },
  "visionMissionSection": {
    "image": "https://...",
    "visionTitle": "رؤيتنا",
    "visionContent": "أن نكون رواداً...",
    "missionTitle": "رسالتنا",
    "missionContent": "نسعى في شركة وهد..."
  },
  "valuesSection": {
    "eyebrowTitle": "أواصر البقاء",
    "title": "قيمنا",
    "firstTitle": "الجودة",
    "firstContent": "الالتزام بأعلى معايير...",
    "secondTitle": "الابتكار",
    "secondContent": "حلول تصميمية مبتكرة...",
    "thirdTitle": "الإستدامة",
    "thirdContent": "حلول مستدامة متوازنة..."
  },
  "boardSection": {
    "isActive": false,
    "eyebrowTitle": "خلف القصة قيادة",
    "title": "مجلس الإدارة",
    "members": [
      {
        "name": "...",
        "title": "...",
        "image": "https://..."
      }
    ]
  }
}
```

**Important:** Check `boardSection.isActive` before rendering the board members section.

#### `contact` — Contact Page

```json
{
  "heroSection": {
    "eyebrowTitle": "خطوة الأولى",
    "title": "تواصل معنا ودعنا نشكل ملامح مشروعك"
  },
  "infoSection": {
    "title": "لنبداً الحديث",
    "content": "فريقنا جاهز لتقديم الإرشاد...",
    "channelsTitle": "وسائل التواصل",
    "phone": "+96658241563",
    "email": "info@wahdeinvestment.sa"
  },
  "formSection": {
    "sectionTitle": "دائرة التواصل - وهد",
    "sectionSubtitle": "مسؤول دائرة التواصل في وهد",
    "avatarImage": "https://...",
    "submitLabel": "إرسال",
    "orText": "أو تواصل عبر",
    "whatsappLabel": "واتساب",
    "whatsappNumber": "+96658241563"
  }
}
```

#### `projects` — Projects Listing Page

```json
{
  "heroSection": {
    "backgroundImage": "",
    "eyebrowTitle": "رؤية بناء مستدام",
    "title": "نطوّر مشاريع متكاملة برؤية احترافية تنفَّذ بجودة عالية وقيمة مستدامة"
  },
  "introSection": {
    "content": "مشاريع وهد ليست مساحات إنشائية فقط، بل تجارب متكاملة تجمع بين الجودة والاستدامة وأسلوب الحياة العصري."
  },
  "cards": []
}
```

| Field | Type | Description |
|-------|------|-------------|
| `heroSection.backgroundImage` | `string` | URL of the hero banner background image |
| `heroSection.eyebrowTitle` | `string` | Small label above the main title |
| `heroSection.title` | `string` | Main hero heading text |
| `introSection.content` | `string` | Descriptive paragraph shown below the hero |
| `cards` | `array` | Reserved — project cards come from `PublicProject` records (see below) |

This page primarily displays `PublicProject` records (see below). The `heroSection` and `introSection` provide the page-level banner and introductory text above the project cards.

---

## Public Projects

Projects are real estate listings managed in the CMS. Each project has a unique slug used for its URL.

### Data Model

Each public project contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `slug` | string | URL-safe unique identifier (e.g., `al-rawabi-residence`) |
| `title` | string | Locale-resolved title |
| `description` | string \| null | Full description (HTML or plain text) |
| `shortDescription` | string \| null | Card/preview description |
| `images` | string[] | Array of image URLs |
| `isActive` | boolean | Whether visible on the public site |
| `status` | object \| null | `{ id, name, color }` — locale-resolved name and hex color from the configurable `ProjectStatus` table. System rows have stable IDs: `project-status-planning`, `project-status-in-progress`, `project-status-on-hold`, `project-status-completed`, `project-status-cancelled`. Custom statuses use CUIDs. |
| `location` | string \| null | Locale-resolved location text |
| `area` | number \| null | Area in square meters |
| `deedNumber` | string \| null | Property deed number |
| `googleMapsAddress` | string \| null | Google Maps link or address |
| `startingPrice` | number \| null | Starting price |
| `endingPrice` | number \| null | Ending price |
| `cityName` | string | Locale-resolved city name |
| `regionName` | string | Locale-resolved region name |
| `category` | string \| null | Primary category name (locale-resolved) |
| `badges` | array | `[{ id, name, color }]` — colored tags |
| `features` | array | `[{ id, label, value, icon }]` — specs/amenities |
| `createdAt` | datetime | Creation timestamp |

### Project Attachments (available in edit form only)

| Field | Type | Description |
|-------|------|-------------|
| `fileUrl` | string | Download URL |
| `fileName` | string \| null | Display name |
| `fileType` | string \| null | MIME type |
| `fileSize` | number \| null | Size in bytes |
| `additionalInfo` | JSON \| null | Extra metadata |

### Fetching Projects (Public API)

```
GET /api/public/website/projects?locale=ar              → { projects: [...] }
GET /api/public/website/projects/{slug}?locale=ar       → { project: {...} }
```

Both endpoints are read-only, no authentication required. Only projects with `isActive: true` are returned.

The response uses locale-resolved fields (single `title` instead of `titleAr`/`titleEn`).

### Project Visibility

Only projects with `isActive: true` should be displayed on the public website. Filter on the server side.

### Project Status Display

`status` is returned as a locale-resolved object — render `status.name` for the label and `status.color` for the badge. The five system rows ship with these defaults (admins can rename/recolor them and add custom statuses via the internal panel):

| Stable ID | Arabic | English | Default color |
|-----------|--------|---------|---------------|
| `project-status-planning` | التخطيط | Planning | `#F59E0B` |
| `project-status-in-progress` | قيد التنفيذ | In Progress | `#3B82F6` |
| `project-status-on-hold` | متوقف | On Hold | `#F97316` |
| `project-status-completed` | منتهي | Completed | `#8B5CF6` |
| `project-status-cancelled` | ملغي | Cancelled | `#EF4444` |

When you need to act on a specific system bucket (e.g. show only "In Progress" projects), compare `status.id === "project-status-in-progress"`. Custom statuses created in the admin will appear with CUID ids and a name/color the admin chose.

---

## SEO Implementation Checklist

### Root Layout

1. Fetch `/api/public/website/settings` on app init (cache aggressively).
2. Set `<html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>`.
3. Add Google Fonts `<link>` from `fonts.googleFontsCssHref`.
4. Set favicon from `faviconUrl`.
5. Initialize Google Analytics with `googleAnalyticsMeasurementId`.
6. Apply theme colors as CSS variables.

### Per-Page Metadata

For each page (`home`, `about`, `contact`, `projects`):

1. Fetch `/api/public/website/seo/{slug}?locale={locale}`.
2. Use the response to populate Next.js `generateMetadata` (see example above).
3. The API already handles fallback merging — no client-side fallback logic needed.

### Per-Project Metadata

For each project detail page (`/projects/{slug}`):

1. Fetch `/api/public/website/projects/{slug}/seo?locale={locale}`.
2. Apply the same metadata pattern as page SEO.
3. Handle 404 (project not found).

### Robots & Indexing

- Respect `robotsAllowIndex` from both site settings and page/project SEO.
- When `false`, set `<meta name="robots" content="noindex, nofollow">`.
- Generate `robots.txt` dynamically based on `seo.robotsAllowIndex` from site settings.

### Open Graph & Twitter Cards

- Set `og:title`, `og:description`, `og:image` from SEO data.
- Set `twitter:card` to `summary_large_image`.
- Set `twitter:site` from `twitterHandle`.
- Use page/project `ogImageUrl`, falling back to site default.

---

## RTL & Bilingual Support

- Arabic (`ar`): Right-to-left layout, `dir="rtl"`.
- English (`en`): Left-to-right layout, `dir="ltr"`.
- All API responses are locale-aware — pass the correct `?locale=` parameter.
- Font families differ per locale — use `fonts.fontAr` for Arabic pages and `fonts.fontEn` for English.
- For locale-resolved values, the API returns a single `title` field (not `titleAr`/`titleEn`). The CMS handles the resolution.

---

## Caching Strategy

| Endpoint | Recommended Cache |
|----------|-------------------|
| Site Settings | `s-maxage=60, stale-while-revalidate=300` (built-in) |
| Page SEO | Cache for 60s, revalidate on demand |
| Project SEO | Cache for 60s, revalidate on demand |
| Page Content | Cache for 60s, revalidate on demand |
| Project List | Cache for 30s (content changes more frequently) |

Use Next.js `fetch` with `next: { revalidate: 60 }` or ISR for static generation with on-demand revalidation.

---

## Summary of All API Endpoints

### Public (No Auth)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/public/website/settings?locale={locale}` | Site settings, theme, fonts, logos, SEO defaults, contact |
| GET | `/api/public/website/content/{slug}?locale={locale}` | Page content (slugs: home, about, contact, projects, settings, theme) |
| GET | `/api/public/website/seo/{slug}?locale={locale}` | Page SEO with fallback (slugs: home, about, contact, projects) |
| GET | `/api/public/website/projects?locale={locale}` | List active public projects |
| GET | `/api/public/website/projects/{slug}?locale={locale}` | Get single project by slug |
| GET | `/api/public/website/projects/{slug}/seo?locale={locale}` | Project SEO with fallback |
| POST | `/api/public/contact` | Submit contact form (supports `source` and `projectSlug`) |

### Admin (Requires `WEBSITE_MANAGEMENT` Permission)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/website/content/{slug}?locale={locale}` | Get page content (single locale) |
| GET | `/api/website/content/{slug}?scope=bilingual` | Get page content (both locales) — used by `home` and `contact` |
| PUT | `/api/website/content/{slug}` | Update page content |
| GET | `/api/website/seo/{slug}` | Get page SEO for editor (with fallback preview) |
| PUT | `/api/website/seo/{slug}` | Update page SEO |
| GET | `/api/website/site-settings` | Get all site settings |
| PATCH | `/api/website/site-settings` | Update site settings |
| GET | `/api/website/public-projects` | List all public projects |
| POST | `/api/website/public-projects` | Create a public project |
| GET | `/api/website/public-projects/{id}` | Get project for editing |
| PUT | `/api/website/public-projects/{id}` | Update project |
| GET | `/api/website/public-projects/{id}/seo` | Get project SEO for editor |
| PUT | `/api/website/public-projects/{id}/seo` | Update project SEO |
| PATCH | `/api/website/public-projects/{id}/visibility` | Toggle project visibility |
| DELETE | `/api/website/public-projects/{id}` | Permanently delete a public project |
| GET | `/api/website/public-projects/badges` | List all badges |
| GET | `/api/website/public-projects/features` | List all features |
| GET | `/api/website/public-projects/prefill/{projectId}` | Prefill from internal project |
