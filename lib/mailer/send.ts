import db from "@/lib/db"
import { NotificationCategory } from "@/lib/generated/prisma/enums"
import {
  ensureVerified,
  getMailerConfig,
  getTransporter,
} from "./transporter"

export type SendMailParams = {
  to: string
  subject: string
  html: string
  text: string
  category?: NotificationCategory
  relatedId?: string | null
}

/**
 * Send a single email. Non-blocking semantics: never throws.
 * Logs every attempt to EmailLog for audit.
 */
export async function sendMail(params: SendMailParams): Promise<boolean> {
  const config = getMailerConfig()
  const transporter = getTransporter()

  if (!config || !transporter) {
    await logAttempt(params, "failed", "smtp_not_configured")
    return false
  }

  const ok = await ensureVerified()
  if (!ok) {
    await logAttempt(params, "failed", "smtp_verify_failed")
    return false
  }

  try {
    await transporter.sendMail({
      from: config.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    })
    await logAttempt(params, "sent")
    return true
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[mailer] send failed:", msg)
    await logAttempt(params, "failed", msg)
    return false
  }
}

async function logAttempt(
  params: SendMailParams,
  status: "sent" | "failed",
  error?: string
) {
  try {
    await db.emailLog.create({
      data: {
        to: params.to,
        category: params.category ?? null,
        relatedId: params.relatedId ?? null,
        subject: params.subject,
        status,
        error: error ?? null,
      },
    })
  } catch (logError) {
    console.error("[mailer] EmailLog write failed:", logError)
  }
}

/**
 * Fan out same email to many recipients without blocking.
 * Each send is independent (Promise.allSettled).
 */
export async function sendBulkMail(
  recipients: { to: string; subject: string; html: string; text: string }[],
  meta: { category?: NotificationCategory; relatedId?: string | null } = {}
): Promise<void> {
  await Promise.allSettled(
    recipients.map((r) =>
      sendMail({
        ...r,
        category: meta.category,
        relatedId: meta.relatedId,
      })
    )
  )
}
