import db from "@/lib/db"
import { Prisma } from "@/lib/generated/prisma/client"
import {
  WEBSITE_CONTENT_DEFAULTS,
  WEBSITE_PAGE_SLUGS,
  type WebsiteLocale,
  type WebsitePageSlug,
} from "@/lib/website-content/default-content"

type ContentRecord = Prisma.InputJsonObject
type LocalizedPayload = Record<WebsiteLocale, ContentRecord>
export type BilingualContentPatch = Partial<LocalizedPayload>

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base }

  for (const key of Object.keys(override)) {
    const overrideValue = override[key]
    const baseValue = result[key]

    if (isObject(baseValue) && isObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue)
      continue
    }

    result[key] = overrideValue
  }

  return result
}

/** Merges a partial JSON patch into existing row content (deep). Omitted keys stay; nested objects merge. */
function mergeStoredContent(
  existingContent: unknown,
  patch: Record<string, unknown>
): ContentRecord {
  const stored = isObject(existingContent)
    ? (existingContent as Record<string, unknown>)
    : {}
  return deepMerge(stored, patch) as ContentRecord
}

export function isWebsitePageSlug(slug: string): slug is WebsitePageSlug {
  return WEBSITE_PAGE_SLUGS.includes(slug as WebsitePageSlug)
}

export function getDefaultPageContent(
  slug: WebsitePageSlug,
  locale: WebsiteLocale
): ContentRecord {
  return WEBSITE_CONTENT_DEFAULTS[slug][locale] as ContentRecord
}

export async function getPageContent(
  slug: WebsitePageSlug,
  locale: WebsiteLocale
): Promise<ContentRecord> {
  const existing = await db.websitePageContent.findUnique({
    where: {
      slug_locale: {
        slug,
        locale,
      },
    },
  })

  const defaults = getDefaultPageContent(slug, locale)
  const stored = isObject(existing?.content)
    ? (existing.content as Record<string, unknown>)
    : {}

  return deepMerge(defaults, stored) as ContentRecord
}

export async function getBilingualPageContent(
  slug: WebsitePageSlug
): Promise<LocalizedPayload> {
  const [ar, en] = await Promise.all([
    getPageContent(slug, "ar"),
    getPageContent(slug, "en"),
  ])

  return { ar, en }
}

export async function upsertPageContent(
  slug: WebsitePageSlug,
  locale: WebsiteLocale,
  content: ContentRecord
) {
  const existing = await db.websitePageContent.findUnique({
    where: {
      slug_locale: {
        slug,
        locale,
      },
    },
  })
  const merged = mergeStoredContent(existing?.content, content as Record<string, unknown>)

  return db.websitePageContent.upsert({
    where: {
      slug_locale: {
        slug,
        locale,
      },
    },
    create: {
      slug,
      locale,
      content: merged,
    },
    update: {
      content: merged,
    },
  })
}

export async function upsertBilingualPageContent(
  slug: WebsitePageSlug,
  contentByLocale: BilingualContentPatch
) {
  await db.$transaction(async (tx) => {
    for (const locale of ["ar", "en"] as const) {
      const patch = contentByLocale[locale]
      if (patch === undefined) continue

      const existing = await tx.websitePageContent.findUnique({
        where: {
          slug_locale: {
            slug,
            locale,
          },
        },
      })
      const merged = mergeStoredContent(
        existing?.content,
        patch as Record<string, unknown>
      )

      await tx.websitePageContent.upsert({
        where: {
          slug_locale: {
            slug,
            locale,
          },
        },
        create: {
          slug,
          locale,
          content: merged,
        },
        update: {
          content: merged,
        },
      })
    }
  })
}
