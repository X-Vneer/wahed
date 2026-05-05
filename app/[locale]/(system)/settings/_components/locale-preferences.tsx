"use client"

import { Languages } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { User } from "@/prisma/users/select"
import apiClient from "@/services"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

const OPTIONS = [
  { value: "ar", labelKey: "settings.sections.locale.options.ar", flag: "ع" },
  { value: "en", labelKey: "settings.sections.locale.options.en", flag: "En" },
] as const

type LocaleValue = (typeof OPTIONS)[number]["value"]

export function LocalePreferencesCard({ user }: { user: User }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const initial = ((user as unknown as { locale?: string }).locale ?? "ar") as
    | LocaleValue
  const [selected, setSelected] = useState<LocaleValue>(initial)
  const [saving, setSaving] = useState(false)

  const dirty = selected !== initial

  const onSave = async () => {
    setSaving(true)
    try {
      await apiClient.put("/api/user/me", {
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        nationality: user.nationality || "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        image: user.image || "",
        locale: selected,
      })
      queryClient.invalidateQueries({ queryKey: ["user", "me"] })
      toast.success(t("settings.sections.locale.saved"))
    } catch (error) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.error
        : (error as Error).message
      toast.error(msg || t("errors.internal_server_error"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
      <header className="border-b px-6 py-5 sm:px-8">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          {t("settings.sections.locale.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {t("settings.sections.locale.title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("settings.sections.locale.description")}
        </p>
      </header>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => {
            const active = selected === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelected(opt.value)}
                aria-pressed={active}
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl border px-4 py-4 text-start transition-all",
                  active
                    ? "border-primary bg-primary/5 ring-primary/20 ring-2"
                    : "hover:border-primary/40 hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-lg font-semibold transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                  style={{ fontFamily: opt.value === "ar" ? "serif" : undefined }}
                >
                  {opt.flag}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{t(opt.labelKey)}</p>
                  <p className="text-muted-foreground text-xs">
                    {t(`settings.sections.locale.hints.${opt.value}`)}
                  </p>
                </div>
                <Languages
                  className={cn(
                    "size-4 transition-opacity",
                    active ? "text-primary opacity-100" : "opacity-0"
                  )}
                />
              </button>
            )
          })}
        </div>
      </div>

      <footer className="bg-muted/30 flex items-center justify-end gap-3 border-t px-6 py-4 sm:px-8">
        <p className="text-muted-foreground me-auto hidden text-xs sm:block">
          {t("settings.sections.locale.footerHint")}
        </p>
        <Button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="min-w-32"
        >
          {saving && <Spinner className="me-2 size-4" />}
          {t("settings.update")}
        </Button>
      </footer>
    </div>
  )
}
