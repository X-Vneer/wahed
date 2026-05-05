import nodemailer, { type Transporter } from "nodemailer"

let cached: Transporter | null = null
let verified = false

export type MailerConfig = {
  host: string
  port: number
  user: string
  password: string
  from: string
}

export function getMailerConfig(): MailerConfig | null {
  const host = process.env.SMTP_HOST
  const portStr = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const password = process.env.SMTP_PASSWORD || process.env.SMTP_APP_PASSWORD
  const from = process.env.SMTP_FROM

  if (!host || !portStr || !user || !password || !from) return null

  const port = Number(portStr)
  if (Number.isNaN(port)) return null

  return { host, port, user, password, from }
}

export function getTransporter(): Transporter | null {
  if (cached) return cached
  const config = getMailerConfig()
  if (!config) return null

  cached = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    requireTLS: config.port === 587,
    auth: { user: config.user, pass: config.password },
    tls: { ciphers: "TLSv1.2", minVersion: "TLSv1.2" },
  })
  return cached
}

export async function ensureVerified(): Promise<boolean> {
  if (verified) return true
  const transporter = getTransporter()
  if (!transporter) return false
  try {
    await transporter.verify()
    verified = true
    return true
  } catch (error) {
    console.error("[mailer] verify failed:", error)
    return false
  }
}
