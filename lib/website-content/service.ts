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
      content,
    },
    update: {
      content,
    },
  })
}

export async function upsertBilingualPageContent(
  slug: WebsitePageSlug,
  contentByLocale: LocalizedPayload
) {
  await db.$transaction(async (tx) => {
    await tx.websitePageContent.upsert({
      where: {
        slug_locale: {
          slug,
          locale: "ar",
        },
      },
      create: {
        slug,
        locale: "ar",
        content: contentByLocale.ar,
      },
      update: {
        content: contentByLocale.ar,
      },
    })

    await tx.websitePageContent.upsert({
      where: {
        slug_locale: {
          slug,
          locale: "en",
        },
      },
      create: {
        slug,
        locale: "en",
        content: contentByLocale.en,
      },
      update: {
        content: contentByLocale.en,
      },
    })
  })
}
