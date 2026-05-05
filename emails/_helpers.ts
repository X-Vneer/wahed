import { createTranslator } from "next-intl"

import { NOTIFICATION_CATEGORY_BY_KEY } from "../config/notifications"
import { NotificationCategory } from "../lib/generated/prisma/enums"
import type {
  EmailLocale,
  NotificationEmailProps,
} from "../lib/mailer/templates/react/notification-email"
import enMessages from "../messages/en.json"
import arMessages from "../messages/ar.json"

const MESSAGES: Record<EmailLocale, Record<string, unknown>> = {
  en: enMessages as Record<string, unknown>,
  ar: arMessages as Record<string, unknown>,
}

const PREVIEW_BRANDING = {
  systemName: { ar: "وهد", en: "Wahed" },
  logoUrl: "/static/wahed-logo.png" as string | null,
  primaryColor: "#F2581E",
  accentColor: "#1A1A1A",
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

function footer(locale: EmailLocale) {
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

export function buildPreviewProps(
  category: NotificationCategory,
  locale: EmailLocale,
  params: Record<string, string | number>,
  recipientName = "Test User"
): NotificationEmailProps {
  const config = NOTIFICATION_CATEGORY_BY_KEY[category]
  if (!config) throw new Error(`No config for category ${category}`)

  const messages = MESSAGES[locale]
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
  const greeting = safeT(t, "greeting", { name: recipientName })
  const body = safeT(t, `${key}.body`, params)
  const cta = safeT(t, `${key}.cta`, params)
  const preheader = safeT(t, `${key}.preheader`, params)
  const eyebrow = safeT(groupT, config.group, {})

  const highlight = HIGHLIGHT_KEY[category]
  const highlightValue = highlight
    ? String(params[highlight.valueParam] ?? "")
    : ""
  const highlightLabel = highlight
    ? safeT(highlightT, highlight.labelKey, {})
    : ""

  const f = footer(locale)

  return {
    locale,
    preheader,
    eyebrow,
    title: subject,
    greeting,
    body,
    highlightLabel: highlightValue ? highlightLabel : undefined,
    highlightValue: highlightValue || undefined,
    ctaLabel: cta || undefined,
    ctaUrl: `https://example.com/${locale}`,
    branding: {
      systemName: PREVIEW_BRANDING.systemName[locale],
      logoUrl: PREVIEW_BRANDING.logoUrl,
      primaryColor: PREVIEW_BRANDING.primaryColor,
      accentColor: PREVIEW_BRANDING.accentColor,
    },
    prefsUrl: `https://example.com/${locale}/settings#notifications`,
    prefsHint: f.prefsHint,
    prefsLink: f.prefsLink,
  }
}
