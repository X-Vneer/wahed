import { ourFileRouter } from "@/app/api/uploadthing/core"
import { ibmPlexSansArabic, satoshi } from "@/assets/font"
import { Toaster } from "@/components/ui/sonner"
import { routing } from "@/lib/i18n/routing"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import type { Metadata } from "next"
import { NextIntlClientProvider } from "next-intl"
import { notFound } from "next/navigation"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { extractRouterConfig } from "uploadthing/server"
import "../globals.css"
import QueryProvider from "@/lib/tanstack-query"

export const metadata: Metadata = {
  title: "Wahd",
  description: "Wahd System",
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

  // Use IBM Plex Sans Arabic for Arabic locale, Satoshi for others
  const fontVariable =
    locale === "ar" ? ibmPlexSansArabic.variable : satoshi.variable

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={fontVariable}
    >
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
              {children}
            </NuqsAdapter>
            <Toaster />
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
