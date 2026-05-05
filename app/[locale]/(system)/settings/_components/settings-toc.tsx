"use client"

import {
  Bell,
  Globe,
  LogOut,
  UserCircle2,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"

type Section = {
  id: string
  labelKey: string
  icon: LucideIcon
}

const SECTIONS: Section[] = [
  { id: "profile", labelKey: "settings.toc.profile", icon: UserCircle2 },
  { id: "language", labelKey: "settings.toc.language", icon: Globe },
  { id: "notifications", labelKey: "settings.toc.notifications", icon: Bell },
  { id: "account", labelKey: "settings.toc.account", icon: LogOut },
]

export function SettingsToc() {
  const t = useTranslations()
  const [active, setActive] = useState<string>("profile")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <nav className="bg-card sticky top-6 hidden w-56 rounded-2xl border p-2 shadow-xs lg:block">
      <p className="text-muted-foreground px-3 pt-2 pb-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
        {t("settings.toc.heading")}
      </p>
      <ul className="space-y-1">
        {SECTIONS.map((s) => {
          const Icon = s.icon
          const isActive = active === s.id
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="size-4" />
                <span>{t(s.labelKey)}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
