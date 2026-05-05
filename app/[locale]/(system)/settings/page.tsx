"use client"

import { Spinner } from "@/components/ui/spinner"
import { useUserData } from "@/hooks/use-user-data"
import { useTranslations } from "next-intl"

import { AccountSection } from "./_components/account-section"
import { LocalePreferencesCard } from "./_components/locale-preferences"
import { NotificationsPreferencesCard } from "./_components/notifications-preferences"
import { SettingsForm } from "./_components/settings-form"
import { SettingsHero } from "./_components/settings-hero"
import { SettingsToc } from "./_components/settings-toc"

export default function SettingsPage() {
  const { data: user, isLoading, error } = useUserData()
  const t = useTranslations()

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-destructive text-center">
          <p className="text-lg font-semibold">{t("errors.failed_to_load")}</p>
          <p className="text-sm">
            {error?.message || t("errors.user_not_found")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[224px_1fr] lg:gap-8">
        <aside className="lg:pt-[calc(theme(spacing.6)+0px)]">
          <SettingsToc />
        </aside>
        <div className="min-w-0 space-y-6">
          <SettingsHero user={user} />

          <section id="profile" className="scroll-mt-6">
            <SettingsForm user={user} />
          </section>

          <section id="language" className="scroll-mt-6">
            <LocalePreferencesCard user={user} />
          </section>

          <section id="notifications" className="scroll-mt-6">
            <NotificationsPreferencesCard />
          </section>

          <section id="account" className="scroll-mt-6">
            <AccountSection />
          </section>
        </div>
      </div>
    </div>
  )
}
