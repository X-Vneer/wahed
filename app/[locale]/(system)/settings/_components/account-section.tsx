"use client"

import { LogOut } from "lucide-react"
import { useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { useRouter } from "@/lib/i18n/navigation"
import apiClient from "@/services"

export function AccountSection() {
  const t = useTranslations()
  const router = useRouter()

  const onLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout")
      router.refresh()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
      <header className="border-b px-6 py-5 sm:px-8">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          {t("settings.sections.account.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {t("settings.sections.account.title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("settings.sections.account.description")}
        </p>
      </header>
      <div className="flex flex-col gap-3 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-8">
        <div>
          <p className="text-sm font-medium">
            {t("settings.sections.account.signOut.title")}
          </p>
          <p className="text-muted-foreground text-xs">
            {t("settings.sections.account.signOut.description")}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onLogout}
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="me-2 size-4" />
          {t("settings.sections.account.signOut.button")}
        </Button>
      </div>
    </div>
  )
}
