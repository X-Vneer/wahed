"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/prisma/users/select"
import { useTranslations } from "next-intl"

export function SettingsHero({ user }: { user: User }) {
  const t = useTranslations()
  const initials = (user.name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("")

  return (
    <header className="bg-card relative overflow-hidden rounded-2xl border shadow-xs">
      <div
        aria-hidden
        className="from-primary/10 via-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent"
      />
      <div
        aria-hidden
        className="bg-primary/10 pointer-events-none absolute -top-24 -right-24 size-72 rounded-full blur-3xl"
      />
      <div className="relative flex flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:gap-7 sm:px-8 sm:py-8">
        <div className="relative">
          <div
            aria-hidden
            className="from-primary/40 via-accent/30 absolute -inset-1.5 rounded-full bg-gradient-to-br to-transparent blur-md"
          />
          <Avatar className="ring-background relative size-20 shadow-lg ring-4 sm:size-24">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="text-xl font-semibold">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            {t("settings.hero.eyebrow")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {user.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-sm">{user.email}</span>
            <Badge variant="secondary" className="rounded-full">
              {user.role === "ADMIN"
                ? t("settings.hero.roleAdmin")
                : t("settings.hero.roleStaff")}
            </Badge>
            {user.roleName && (
              <Badge variant="outline" className="rounded-full">
                {user.roleName}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
