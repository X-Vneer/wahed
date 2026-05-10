import { render } from "@react-email/render"
import { createTranslator } from "next-intl"
import * as React from "react"

import db from "@/lib/db"
import { sendMail } from "@/lib/mailer/send"
import {
  NotificationEmail,
  type EmailLocale,
} from "@/lib/mailer/templates/react/notification-email"

export type ExternalEventEmailKind = "invite" | "update" | "cancel"

type EventLite = {
  title: string
  start?: Date | string | null
  location?: string | null
  meetingUrl?: string | null
}

type SendExternalEventEmailParams = {
  to: string
  kind: ExternalEventEmailKind
  event: EventLite
  /** Locale for the email copy. Defaults to "ar" — external recipients have no preference. */
  locale?: EmailLocale
  relatedId?: string | null
}

const messageCache = new Map<EmailLocale, Record<string, unknown>>()

async function loadMessages(
  locale: EmailLocale
): Promise<Record<string, unknown>> {
  const cached = messageCache.get(locale)
  if (cached) return cached
  const mod = await import(`../../messages/${locale}.json`)
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

const DEFAULT_NAME_AR = "وهد"
const DEFAULT_NAME_EN = "Wahd"

function resolveLogoUrl(dbUrl: string | null | undefined): string | null {
  if (dbUrl) return dbUrl
  const base = process.env.APP_URL || process.env.PUBLIC_WEBSITE_URL
  if (!base) return null
  return `${base.replace(/\/$/, "")}/email/wahed-logo.png`
}

async function loadBranding(locale: EmailLocale): Promise<Branding> {
  const fallbackName = locale === "ar" ? DEFAULT_NAME_AR : DEFAULT_NAME_EN
  try {
    const row = await db.systemSiteSettings.findFirst()
    return {
      systemName:
        (locale === "ar" ? row?.systemNameAr : row?.systemNameEn) ||
        fallbackName,
      logoUrl: resolveLogoUrl(row?.logoSquareUrl),
      primaryColor: row?.primaryColor || "#F2581E",
      accentColor: row?.accentColor || "#1A1A1A",
    }
  } catch {
    return {
      systemName: fallbackName,
      logoUrl: resolveLogoUrl(null),
      primaryColor: "#F2581E",
      accentColor: "#1A1A1A",
    }
  }
}

function formatStart(
  start: Date | string | null | undefined,
  locale: EmailLocale
): string {
  if (!start) return ""
  const date = typeof start === "string" ? new Date(start) : start
  if (Number.isNaN(date.getTime())) return ""
  try {
    return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-GB", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date)
  } catch {
    return date.toISOString()
  }
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

/**
 * Send an event invite/update/cancel email to an external (non-User) recipient.
 * Bypasses NotificationCategory and notification preferences — external addresses
 * have no preference row. SMTP-not-configured is silently skipped by sendMail().
 */
export async function sendExternalEventEmail({
  to,
  kind,
  event,
  locale = "ar",
  relatedId = null,
}: SendExternalEventEmailParams): Promise<boolean> {
  const messages = await loadMessages(locale)
  const t = createTranslator({
    locale,
    messages: messages as Parameters<typeof createTranslator>[0]["messages"],
    namespace: "emails.externalEvent",
  })

  const params = {
    eventTitle: event.title,
    eventStart: formatStart(event.start, locale),
    eventLocation: event.location ?? "",
  }

  const subjectKey =
    kind === "invite"
      ? "subjectInvite"
      : kind === "update"
        ? "subjectUpdate"
        : "subjectCancel"
  const hasLocation = Boolean(params.eventLocation)
  const bodyKey =
    kind === "invite"
      ? hasLocation
        ? "bodyInviteWithLocation"
        : "bodyInvite"
      : kind === "update"
        ? hasLocation
          ? "bodyUpdateWithLocation"
          : "bodyUpdate"
        : "bodyCancel"
  const eyebrowKey =
    kind === "invite"
      ? "eyebrowInvite"
      : kind === "update"
        ? "eyebrowUpdate"
        : "eyebrowCancel"

  const subject = safeT(t, subjectKey, params)
  const body = safeT(t, bodyKey, params)
  const eyebrow = safeT(t, eyebrowKey, {})
  const preheader = safeT(t, "preheader", params) || subject
  const highlightLabel = safeT(t, "highlightLabel", {})
  const highlightValue = params.eventStart || params.eventLocation || ""

  const ctaT = createTranslator({
    locale,
    messages: messages as Parameters<typeof createTranslator>[0]["messages"],
    namespace: "emails.cta",
  })
  const meetingUrl =
    kind === "cancel" ? undefined : event.meetingUrl ?? undefined
  const ctaLabel = meetingUrl ? safeT(ctaT, "joinMeeting", {}) : undefined

  const branding = await loadBranding(locale)

  const element = React.createElement(NotificationEmail, {
    locale,
    preheader,
    eyebrow,
    title: subject,
    body,
    highlightLabel: highlightValue ? highlightLabel : undefined,
    highlightValue: highlightValue || undefined,
    ctaLabel: meetingUrl ? ctaLabel : undefined,
    ctaUrl: meetingUrl,
    branding,
    // External recipients have no settings page; pass empty so the footer link is muted.
    prefsUrl: "",
    prefsHint: "",
    prefsLink: "",
  })

  const html = await render(element, { pretty: false })
  const text = await render(element, { plainText: true })

  return sendMail({
    to,
    subject,
    html,
    text,
    relatedId,
  })
}
