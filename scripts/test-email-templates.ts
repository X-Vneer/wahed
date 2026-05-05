import "dotenv/config"

import { NotificationCategory } from "../lib/generated/prisma/enums"
import { sendMail } from "../lib/mailer/send"
import { renderEmail } from "../lib/mailer/templates"
import type { EmailLocale } from "../lib/mailer/templates/react/notification-email"

const RECIPIENT = "xv.neer@gmail.com"
const RECIPIENT_NAME = "Test User"
const APP_URL = process.env.APP_URL || "http://localhost:3000"
const LOCALES: EmailLocale[] = ["en", "ar"]
const DELAY_MS = 1200

/**
 * One representative category per group + 1 extra w/ rich params
 * (TASK_COMMENTED — multi-field highlight). Trims 42 → 10 emails.
 */
type Sample = {
  category: NotificationCategory
  params: Record<string, string | number>
  ctaPath: string
}

const SAMPLES: Sample[] = [
  {
    category: NotificationCategory.TASK_ASSIGNED,
    params: { taskTitle: "Design landing hero section" },
    ctaPath: "/tasks",
  },
  {
    category: NotificationCategory.TASK_COMMENTED,
    params: {
      taskTitle: "Design landing hero section",
      userName: "Sarah Ahmed",
      comment: "Looks great — ready for review.",
    },
    ctaPath: "/tasks",
  },
  {
    category: NotificationCategory.PROJECT_CREATED,
    params: { projectName: "Wahd Tower — Phase 2" },
    ctaPath: "/projects",
  },
  {
    category: NotificationCategory.EVENT_INVITED,
    params: { eventTitle: "Quarterly review" },
    ctaPath: "/calendar",
  },
  {
    category: NotificationCategory.CONTACT_RECEIVED,
    params: {
      senderName: "Mona Ali",
      messagePreview: "Hi, I'm interested in your services...",
    },
    ctaPath: "/contacts",
  },
]

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log(`📧 Sending ${SAMPLES.length * LOCALES.length} sample templates to ${RECIPIENT}\n`)

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.error(
      "❌ SMTP_HOST / SMTP_USER not set. Configure SMTP env vars in .env first."
    )
    process.exit(1)
  }

  let sent = 0
  let failed = 0
  const total = SAMPLES.length * LOCALES.length

  for (const locale of LOCALES) {
    for (const sample of SAMPLES) {
      const ctaUrl = `${APP_URL}/${locale}${sample.ctaPath}`
      try {
        const { subject, html, text } = await renderEmail({
          category: sample.category,
          locale,
          recipientName: RECIPIENT_NAME,
          params: sample.params,
          ctaUrl,
        })
        const taggedSubject = `[TEST ${locale.toUpperCase()}] ${subject}`
        const ok = await sendMail({
          to: RECIPIENT,
          subject: taggedSubject,
          html,
          text,
          category: sample.category,
        })
        if (ok) {
          sent += 1
          console.log(
            `  ✅ [${locale}] ${sample.category.padEnd(20)}  ${taggedSubject}`
          )
        } else {
          failed += 1
          console.log(
            `  ❌ [${locale}] ${sample.category} — send returned false`
          )
        }
      } catch (err) {
        failed += 1
        const msg = err instanceof Error ? err.message : String(err)
        console.log(`  ❌ [${locale}] ${sample.category} — ${msg}`)
      }
      await sleep(DELAY_MS)
    }
  }

  console.log(`\n🎉 Done. ${sent}/${total} sent, ${failed} failed.\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error("Fatal:", err)
  process.exit(1)
})
