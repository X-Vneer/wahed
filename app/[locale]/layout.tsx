import { ourFileRouter } from "@/app/api/uploadthing/core"
import { ibmPlexSansArabic, satoshi } from "@/assets/font"
import { Toaster } from "@/components/ui/sonner"
import { SystemBrandingProvider } from "@/contexts/system-branding-context"
import { getSystemBrandingSafe } from "@/lib/get-system-branding"
import { routing } from "@/lib/i18n/routing"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { notFound } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { extractRouterConfig } from "uploadthing/server"
import "../globals.css"
import QueryProvider from "@/lib/tanstack-query"
import { DirectionProvider } from "@/components/ui/direction"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const resolvedLocale = locale === "ar" || locale === "en" ? locale : "en"
  const branding = await getSystemBrandingSafe(resolvedLocale)
  const title = branding.systemName || "Wahd"

  return {
    title,
    description: `${title} System`,
    icons: branding.faviconUrl
      ? { icon: branding.faviconUrl }
      : undefined,
  }
}

/** CSS override stylesheet for runtime-configured system theme colors. */
function brandingStyleSheet(primary: string | null, accent: string | null) {
  const lines: string[] = []
  if (primary) {
    lines.push(`--primary: ${primary};`)
    lines.push(`--sidebar-primary: ${primary};`)
    lines.push(`--ring: ${primary};`)
  }
  if (accent) {
    lines.push(`--accent: ${accent};`)
    lines.push(`--sidebar-accent: ${accent};`)
  }
  if (lines.length === 0) return null
  const block = lines.join(" ")
  return `:root, .dark { ${block} }`
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound()
  }

  const resolvedLocale = locale === "ar" ? "ar" : "en"
  const branding = await getSystemBrandingSafe(resolvedLocale)
  const themeCss = brandingStyleSheet(
    branding.primaryColor,
    branding.accentColor
  )

  // Use IBM Plex Sans Arabic for Arabic locale, Satoshi for others
  const fontVariable =
    locale === "ar" ? ibmPlexSansArabic.variable : satoshi.variable

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={fontVariable}
    >
      <head>
        {themeCss ? (
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        ) : null}
      </head>
      <body className={`${fontVariable} antialiased`}>
        <QueryProvider>
          <NextIntlClientProvider locale={locale}>
            <NuqsAdapter>
              <NextSSRPlugin
                /**
                 * The `extractRouterConfig` will extract **only** the route configs
                 * from the router to prevent additional information from being
                 * leaked to the client. The data passed to the client is the same
                 * as if you were to fetch `/api/uploadthing` directly.
                 */
                routerConfig={extractRouterConfig(ourFileRouter)}
              />
              <DirectionProvider direction={locale === "ar" ? "rtl" : "ltr"}>
                <SystemBrandingProvider value={branding}>
                  {children}
                </SystemBrandingProvider>
              </DirectionProvider>
            </NuqsAdapter>
            <Toaster />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
