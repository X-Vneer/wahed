"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

import apiClient from "@/services"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"

export default function LogoutPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations("auth.logout")

  useEffect(() => {
    const performLogout = async () => {
      try {
        await apiClient.post("/api/auth/logout")
      } catch {
        // Ignore errors and continue redirecting
      } finally {
        router.replace(`/${locale}/auth/login`)
        router.refresh()
      }
    }

    void performLogout()
  }, [locale, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-center text-lg font-semibold">{t("title")}</h1>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <Spinner />
          <span>{t("subtitle")}</span>
        </CardContent>
      </Card>
    </div>
  )
}
