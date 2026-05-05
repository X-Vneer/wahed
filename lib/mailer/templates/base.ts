import db from "@/lib/db"

export type EmailLocale = "ar" | "en"

export type BaseEmailParams = {
  locale: EmailLocale
  preheader: string
  title: string
  bodyHtml: string
  bodyText: string
  ctaLabel?: string
  ctaUrl?: string
  footerNote?: string
}

type Branding = {
  systemName: string
  logoUrl: string | null
  primaryColor: string
  accentColor: string
}

let cachedBranding: { value: Branding; at: number } | null = null
const BRANDING_TTL_MS = 60_000

async function loadBranding(locale: EmailLocale): Promise<Branding> {
  const now = Date.now()
  if (cachedBranding && now - cachedBranding.at < BRANDING_TTL_MS) {
    return cachedBranding.value
  }
  try {
    const row = await db.systemSiteSettings.findFirst()
    const value: Branding = {
      systemName:
        (locale === "ar" ? row?.systemNameAr : row?.systemNameEn) ||
        row?.systemNameEn ||
        row?.systemNameAr ||
        "Wahd Omrania",
      logoUrl: row?.logoSquareUrl ?? null,
      primaryColor: row?.primaryColor || "#0F172A",
      accentColor: row?.accentColor || "#2563EB",
    }
    cachedBranding = { value, at: now }
    return value
  } catch {
    return {
      systemName: "Wahd Omrania",
      logoUrl: null,
      primaryColor: "#0F172A",
      accentColor: "#2563EB",
    }
  }
}

export async function renderBaseEmail(
  params: BaseEmailParams
): Promise<{ html: string; text: string }> {
  const branding = await loadBranding(params.locale)
  const dir = params.locale === "ar" ? "rtl" : "ltr"
  const align = params.locale === "ar" ? "right" : "left"
  const appUrl = process.env.APP_URL || ""
  const prefsUrl = `${appUrl}/${params.locale}/settings#notifications`

  const cta =
    params.ctaLabel && params.ctaUrl
      ? `<tr><td align="${align}" style="padding: 24px 0;">
          <a href="${escapeAttr(params.ctaUrl)}" style="display:inline-block;background-color:${branding.primaryColor};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 24px;border-radius:8px;font-family:Arial,sans-serif;font-size:14px;">${escapeHtml(params.ctaLabel)}</a>
        </td></tr>`
      : ""

  const logo = branding.logoUrl
    ? `<img src="${escapeAttr(branding.logoUrl)}" alt="${escapeAttr(branding.systemName)}" width="44" height="44" style="display:block;border-radius:8px;object-fit:contain;" />`
    : ""

  const footerNote = params.footerNote
    ? `<p style="margin:0 0 8px 0;color:#64748b;font-size:12px;line-height:1.5;font-family:Arial,sans-serif;">${escapeHtml(params.footerNote)}</p>`
    : ""

  const t = i18nFooter(params.locale)

  const html = `<!doctype html>
<html lang="${params.locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:Arial,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f1f5f9;">${escapeHtml(params.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:24px 0;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.08);" dir="${dir}">
      <tr><td style="padding:24px 28px;background-color:${branding.primaryColor};">
        <table role="presentation" width="100%"><tr>
          <td align="${align}" style="vertical-align:middle;">${logo}</td>
          <td align="${align === "left" ? "right" : "left"}" style="color:#ffffff;font-weight:600;font-size:16px;font-family:Arial,sans-serif;vertical-align:middle;">${escapeHtml(branding.systemName)}</td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:32px 28px;" align="${align}">
        <h1 style="margin:0 0 16px 0;color:#0f172a;font-size:20px;line-height:1.4;font-family:Arial,sans-serif;">${escapeHtml(params.title)}</h1>
        <div style="color:#334155;font-size:14px;line-height:1.6;font-family:Arial,sans-serif;">${params.bodyHtml}</div>
        <table role="presentation" width="100%">${cta}</table>
      </td></tr>
      <tr><td style="padding:20px 28px;background-color:#f8fafc;border-top:1px solid #e2e8f0;" align="${align}">
        ${footerNote}
        <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;font-family:Arial,sans-serif;">
          ${escapeHtml(t.prefsHint)}
          <a href="${escapeAttr(prefsUrl)}" style="color:${branding.accentColor};text-decoration:underline;">${escapeHtml(t.prefsLink)}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  const ctaText =
    params.ctaLabel && params.ctaUrl
      ? `\n\n${params.ctaLabel}: ${params.ctaUrl}`
      : ""

  const text = `${params.title}\n\n${params.bodyText}${ctaText}\n\n— ${branding.systemName}\n${t.prefsHint} ${prefsUrl}`

  return { html, text }
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function escapeAttr(str: string): string {
  return escapeHtml(str)
}

export { escapeHtml, escapeAttr }
