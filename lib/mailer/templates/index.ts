import { getTranslations } from "next-intl/server"

import { NOTIFICATION_CATEGORY_BY_KEY } from "@/config/notifications"
import { NotificationCategory } from "@/lib/generated/prisma/enums"

import { renderBaseEmail, type EmailLocale } from "./base"

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
}

/**
 * Render an email for the given notification category.
 * Pulls subject + body strings from messages/{locale}.json under `emails.{emailKey}`.
 */
export async function renderEmail({
  category,
  locale,
  recipientName,
  params,
  ctaUrl,
}: RenderEmailParams): Promise<RenderedEmail> {
  const config = NOTIFICATION_CATEGORY_BY_KEY[category]
  if (!config) throw new Error(`No config for category ${category}`)

  const t = await getTranslations({ locale, namespace: "emails" })
  const key = config.emailKey

  const subject = safeT(t, `${key}.subject`, params)
  const greeting = recipientName
    ? safeT(t, "greeting", { name: recipientName })
    : ""
  const body = safeT(t, `${key}.body`, params)
  const cta = ctaUrl ? safeT(t, `${key}.cta`, params) : undefined
  const preheader = safeT(t, `${key}.preheader`, params)

  const bodyHtml = `${greeting ? `<p style="margin:0 0 12px 0;">${escape(greeting)}</p>` : ""}<p style="margin:0;">${escape(body)}</p>`
  const bodyText = `${greeting ? `${greeting}\n\n` : ""}${body}`

  const { html, text } = await renderBaseEmail({
    locale,
    title: subject,
    preheader,
    bodyHtml,
    bodyText,
    ctaLabel: cta,
    ctaUrl,
  })

  return { subject, html, text }
}

function safeT(
  t: Awaited<ReturnType<typeof getTranslations>>,
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

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}
