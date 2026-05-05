"use client"

import { useMemo, useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import {
  Bell,
  BellOff,
  ClipboardList,
  FolderKanban,
  CalendarDays,
  Mailbox,
  Mail,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_CHANNELS,
  type NotificationGroup,
} from "@/config/notifications"
import {
  NotificationCategory,
  NotificationChannel,
} from "@/lib/generated/prisma/enums"
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/hooks/use-notification-preferences"
import { cn } from "@/lib/utils"

const GROUP_ORDER: NotificationGroup[] = [
  "TASKS",
  "PROJECTS",
  "EVENTS",
  "CONTACTS",
]

const GROUP_ICON: Record<NotificationGroup, LucideIcon> = {
  TASKS: ClipboardList,
  PROJECTS: FolderKanban,
  EVENTS: CalendarDays,
  CONTACTS: Mailbox,
}

const CHANNEL_ICON: Record<NotificationChannel, LucideIcon> = {
  NONE: BellOff,
  IN_APP: Smartphone,
  EMAIL: Mail,
  BOTH: Bell,
}

export function NotificationsPreferencesCard() {
  const t = useTranslations()
  const { data, isLoading } = useNotificationPreferences()
  const update = useUpdateNotificationPreferences()

  const [overrides, setOverrides] = useState<
    Partial<Record<NotificationCategory, NotificationChannel>>
  >({})

  const draft = useMemo(() => {
    const next = {} as Record<NotificationCategory, NotificationChannel>
    if (data) for (const item of data) next[item.category] = item.channel
    return { ...next, ...overrides } as Record<
      NotificationCategory,
      NotificationChannel
    >
  }, [data, overrides])

  const grouped = useMemo(() => {
    const map = new Map<
      NotificationGroup,
      typeof NOTIFICATION_CATEGORIES
    >()
    for (const g of GROUP_ORDER) map.set(g, [])
    for (const c of NOTIFICATION_CATEGORIES) {
      const arr = map.get(c.group)
      if (arr) arr.push(c)
    }
    return map
  }, [])

  const dirty = useMemo(() => {
    if (!data) return false
    for (const item of data) {
      if (draft[item.category] !== item.channel) return true
    }
    return false
  }, [data, draft])

  const setOne = (cat: NotificationCategory, ch: NotificationChannel) =>
    setOverrides((prev) => ({ ...prev, [cat]: ch }))

  const setGroup = (group: NotificationGroup, ch: NotificationChannel) => {
    setOverrides((prev) => {
      const next = { ...prev }
      for (const c of NOTIFICATION_CATEGORIES) {
        if (c.group === group) next[c.key] = ch
      }
      return next
    })
  }

  const onSave = async () => {
    try {
      const preferences = Object.entries(draft).map(([category, channel]) => ({
        category: category as NotificationCategory,
        channel,
      }))
      await update.mutateAsync(preferences)
      setOverrides({})
      toast.success(t("settings.notifications.saved"))
    } catch {
      toast.error(t("errors.internal_server_error"))
    }
  }

  return (
    <div className="bg-card overflow-hidden rounded-2xl border shadow-xs">
      <header className="border-b px-6 py-5 sm:px-8">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
          {t("settings.sections.notifications.eyebrow")}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {t("settings.notifications.title")}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("settings.sections.notifications.description")}
        </p>
      </header>

      <div className="px-6 py-6 sm:px-8 sm:py-8">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-8">
            {GROUP_ORDER.map((group) => {
              const items = grouped.get(group) ?? []
              if (items.length === 0) return null
              const GroupIcon = GROUP_ICON[group]
              return (
                <section key={group} className="space-y-4">
                  <header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
                        <GroupIcon className="size-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold">
                          {t(`settings.notifications.groups.${group}`)}
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          {t("settings.notifications.groupCount", {
                            count: items.length,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <ChannelSegmented
                        value={null}
                        onChange={(ch) => setGroup(group, ch)}
                        ariaLabel={t("settings.notifications.bulkLabel")}
                        labels={CHANNEL_LABELS(t)}
                        compact
                      />
                    </div>
                    <div className="w-full sm:hidden">
                      <ChannelSelect
                        value={undefined}
                        onChange={(ch) => setGroup(group, ch)}
                        labels={CHANNEL_LABELS(t)}
                        placeholder={t("settings.notifications.bulkPlaceholder")}
                        ariaLabel={t("settings.notifications.bulkLabel")}
                      />
                    </div>
                  </header>
                  <ul className="divide-y rounded-xl border">
                    {items.map((item) => {
                      const value = draft[item.key] ?? item.defaultChannel
                      const label = t(`notifications.categories.${item.key}`)
                      return (
                        <li
                          key={item.key}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <p className="flex-1 text-sm font-medium">{label}</p>
                          <div className="hidden sm:block">
                            <ChannelSegmented
                              value={value}
                              onChange={(ch) => setOne(item.key, ch)}
                              ariaLabel={label}
                              labels={CHANNEL_LABELS(t)}
                            />
                          </div>
                          <div className="w-44 sm:hidden">
                            <ChannelSelect
                              value={value}
                              onChange={(ch) => setOne(item.key, ch)}
                              labels={CHANNEL_LABELS(t)}
                              ariaLabel={label}
                            />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              )
            })}
          </div>
        )}
      </div>

      <footer className="bg-muted/30 flex items-center justify-end gap-3 border-t px-6 py-4 sm:px-8">
        <p className="text-muted-foreground me-auto hidden text-xs sm:block">
          {t("settings.sections.notifications.footerHint")}
        </p>
        <Button
          type="button"
          onClick={onSave}
          disabled={!dirty || update.isPending}
          className="min-w-32"
        >
          {update.isPending && <Spinner className="me-2 size-4" />}
          {t("settings.notifications.save")}
        </Button>
      </footer>
    </div>
  )
}

function CHANNEL_LABELS(
  t: ReturnType<typeof useTranslations>
): Record<NotificationChannel, string> {
  return {
    NONE: t("settings.notifications.channels.NONE"),
    IN_APP: t("settings.notifications.channels.IN_APP"),
    EMAIL: t("settings.notifications.channels.EMAIL"),
    BOTH: t("settings.notifications.channels.BOTH"),
  }
}

type ChannelSegmentedProps = {
  value: NotificationChannel | null
  onChange: (ch: NotificationChannel) => void
  labels: Record<NotificationChannel, string>
  ariaLabel: string
  compact?: boolean
}

function ChannelSegmented({
  value,
  onChange,
  labels,
  ariaLabel,
  compact,
}: ChannelSegmentedProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "bg-muted/60 inline-flex items-center rounded-full border p-0.5",
        compact ? "text-xs" : "text-sm"
      )}
    >
      {NOTIFICATION_CHANNELS.map((ch) => {
        const Icon = CHANNEL_ICON[ch]
        const active = value === ch
        return (
          <button
            key={ch}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(ch)}
            title={labels[ch]}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full font-medium transition-all",
              compact ? "px-2.5 py-1" : "px-3 py-1.5",
              active
                ? "bg-card text-foreground shadow-xs ring-border ring-1"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={compact ? "size-3" : "size-3.5"} />
            <span className={compact ? "hidden sm:inline" : ""}>
              {labels[ch]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

type ChannelSelectProps = {
  value: NotificationChannel | undefined
  onChange: (ch: NotificationChannel) => void
  labels: Record<NotificationChannel, string>
  ariaLabel: string
  placeholder?: string
}

function ChannelSelect({
  value,
  onChange,
  labels,
  ariaLabel,
  placeholder,
}: ChannelSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(v as NotificationChannel)}
    >
      <SelectTrigger className="h-9 w-full" aria-label={ariaLabel}>
        <SelectValue placeholder={placeholder}>
          {value
            ? (() => {
                const Icon = CHANNEL_ICON[value]
                return (
                  <span className="flex items-center gap-2">
                    <Icon className="size-3.5" />
                    {labels[value]}
                  </span>
                )
              })()
            : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {NOTIFICATION_CHANNELS.map((ch) => {
          const Icon = CHANNEL_ICON[ch]
          return (
            <SelectItem key={ch} value={ch}>
              <span className="flex items-center gap-2">
                <Icon className="size-3.5" />
                {labels[ch]}
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
