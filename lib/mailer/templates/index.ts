import { render } from "@react-email/render"
import { createTranslator } from "next-intl"
import * as React from "react"

import { NOTIFICATION_CATEGORY_BY_KEY } from "@/config/notifications"
import db from "@/lib/db"
import { NotificationCategory } from "@/lib/generated/prisma/enums"

import {
  NotificationEmail,
  type EmailLocale,
} from "./react/notification-email"

const messageCache = new Map<EmailLocale, Record<string, unknown>>()

async function loadMessages(
  locale: EmailLocale
): Promise<Record<string, unknown>> {
  const cached = messageCache.get(locale)
  if (cached) return cached
  const mod = await import(`../../../messages/${locale}.json`)
  const messages = (mod.default ?? mod) as Record<string, unknown>
  messageCache.set(locale, messages)
  return messages
}

type Branding = {
  systemName: string
  logoUrl: string | null
  primaryColor: string
  accentColor: string
}

let cachedBranding: { value: Branding; at: number; locale: EmailLocale } | null =
  null
const BRANDING_TTL_MS = 60_000
const DEFAULT_NAME_AR = "وهد"
const DEFAULT_NAME_EN = "Wahd"

function resolveLogoUrl(dbUrl: string | null | undefined): string | null {
  if (dbUrl) return dbUrl
  const base = process.env.APP_URL || process.env.PUBLIC_WEBSITE_URL
  if (!base) return null
  return `${base.replace(/\/$/, "")}/email/wahed-logo.png`
}

async function loadBranding(locale: EmailLocale): Promise<Branding> {
  const now = Date.now()
  if (
    cachedBranding &&
    cachedBranding.locale === locale &&
    now - cachedBranding.at < BRANDING_TTL_MS
  ) {
    return cachedBranding.value
  }
  const fallbackName = locale === "ar" ? DEFAULT_NAME_AR : DEFAULT_NAME_EN
  try {
    const row = await db.systemSiteSettings.findFirst()
    const value: Branding = {
      systemName:
        (locale === "ar" ? row?.systemNameAr : row?.systemNameEn) ||
        fallbackName,
      logoUrl: resolveLogoUrl(row?.logoSquareUrl),
      primaryColor: row?.primaryColor || "#F2581E",
      accentColor: row?.accentColor || "#1A1A1A",
    }
    cachedBranding = { value, at: now, locale }
    return value
  } catch {
    return {
      systemName: fallbackName,
      logoUrl: resolveLogoUrl(null),
      primaryColor: "#F2581E",
      accentColor: "#1A1A1A",
    }
  }
}

export type RenderedEmail = {
  subject: string
  html: string
  text: string
}

export type RenderEmailParams = {
  category: NotificationCategory
  locale: EmailLocale
  recipientName?: string
  params: Record<string, string | number>
  ctaUrl?: string
  /** Override the default `emails.{key}.cta` translation. */
  ctaLabel?: string
}

const HIGHLIGHT_KEY: Partial<
  Record<NotificationCategory, { labelKey: string; valueParam: string }>
> = {
  TASK_CREATED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_UPDATED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_ASSIGNED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_UNASSIGNED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_STATUS_CHANGED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_COMPLETED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_REOPENED: { labelKey: "task", valueParam: "taskTitle" },
  TASK_COMMENTED: { labelKey: "comment", valueParam: "comment" },
  TASK_ATTACHMENTS_UPDATED: { labelKey: "task", valueParam: "taskTitle" },
  TASKS_IMPORTED: { labelKey: "imported", valueParam: "count" },
  SUBTASK_ADDED: { labelKey: "subtask", valueParam: "subtaskTitle" },
  PROJECT_CREATED: { labelKey: "project", valueParam: "projectName" },
  PROJECT_UPDATED: { labelKey: "project", valueParam: "projectName" },
  PROJECT_ATTACHMENTS_UPDATED: {
    labelKey: "project",
    valueParam: "projectName",
  },
  PROJECT_ARCHIVED: { labelKey: "project", valueParam: "projectName" },
  PROJECT_UNARCHIVED: { labelKey: "project", valueParam: "projectName" },
  EVENT_CREATED: { labelKey: "event", valueParam: "eventTitle" },
  EVENT_UPDATED: { labelKey: "event", valueParam: "eventTitle" },
  EVENT_DELETED: { labelKey: "event", valueParam: "eventTitle" },
  EVENT_INVITED: { labelKey: "event", valueParam: "eventTitle" },
  CONTACT_RECEIVED: { labelKey: "from", valueParam: "senderName" },
}

function i18nFooter(locale: EmailLocale) {
  if (locale === "ar") {
    return {
      prefsHint: "للتحكم في إشعارات البريد:",
      prefsLink: "إدارة التفضيلات",
    }
  }
  return {
    prefsHint: "Manage email notification preferences:",
    prefsLink: "notification settings",
  }
}

export async function renderEmail({
  category,
  locale,
  recipientName,
  params,
  ctaUrl,
  ctaLabel,
}: RenderEmailParams): Promise<RenderedEmail> {
  const config = NOTIFICATION_CATEGORY_BY_KEY[category]
  if (!config) throw new Error(`No config for category ${category}`)

  const messages = await loadMessages(locale)
  const t = createTranslator({
    locale,
    messages: messages as Parameters<typeof createTranslator>[0]["messages"],
    namespace: "emails",
  })
  const groupT = createTranslator({
    locale,
    messages: messages as Parameters<typeof createTranslator>[0]["messages"],
    namespace: "settings.notifications.groups",
  })
  const highlightT = createTranslator({
    locale,
    messages: messages as Parameters<typeof createTranslator>[0]["messages"],
    namespace: "emails.highlights",
  })
  const key = config.emailKey

  const subject = safeT(t, `${key}.subject`, params)
  const greeting = recipientName
    ? safeT(t, "greeting", { name: recipientName })
    : ""
  const body = safeT(t, `${key}.body`, params)
  const cta = ctaUrl
    ? (ctaLabel ?? safeT(t, `${key}.cta`, params))
    : undefined
  const preheader = safeT(t, `${key}.preheader`, params)
  const eyebrow = safeT(groupT, config.group, {})

  const highlight = HIGHLIGHT_KEY[category]
  const highlightValue = highlight
    ? String(params[highlight.valueParam] ?? "")
    : ""
  const highlightLabel = highlight
    ? safeT(highlightT, highlight.labelKey, {})
    : ""

  const branding = await loadBranding(locale)
  const appUrl = process.env.APP_URL || ""
  const prefsUrl = `${appUrl}/${locale}/settings#notifications`
  const footer = i18nFooter(locale)

  const element = React.createElement(NotificationEmail, {
    locale,
    preheader,
    eyebrow,
    title: subject,
    greeting,
    body,
    highlightLabel: highlightValue ? highlightLabel : undefined,
    highlightValue: highlightValue || undefined,
    ctaLabel: cta,
    ctaUrl,
    branding,
    prefsUrl,
    prefsHint: footer.prefsHint,
    prefsLink: footer.prefsLink,
  })

  const html = await render(element, { pretty: false })
  const text = await render(element, { plainText: true })

  return { subject, html, text }
}

function safeT(
  t: ReturnType<typeof createTranslator>,
  key: string,
  values: Record<string, string | number>
): string {
  try {
    return t(key, values)
  } catch {
    try {
      return t(key)
    } catch {
      return ""
    }
  }
}
