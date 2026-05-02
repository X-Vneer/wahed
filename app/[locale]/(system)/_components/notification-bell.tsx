"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  useInfiniteNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  type Notification,
} from "@/hooks/use-notifications"
import { Bell, CheckCheck, Loader2, Mail, MailOpen } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/i18n/navigation"
import { formatDistanceToNow } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

const typeIconColors: Record<string, string> = {
  TASK_CREATED: "text-blue-500",
  TASK_UPDATED: "text-amber-500",
  TASK_ASSIGNED: "text-violet-500",
  TASK_COMMENTED: "text-emerald-500",
  PROJECT_CREATED: "text-sky-500",
  PROJECT_UPDATED: "text-orange-500",
  CONTACT_RECEIVED: "text-rose-500",
}

/**
 * Translate a notification's title and message.
 * New notifications store a contentKey in `title` and JSON params in `message`.
 * Old notifications store plain-text strings — we fall back to those.
 */
function useTranslatedNotification(notification: Notification) {
  const t = useTranslations()
  const contentKey = notification.title

  // Try to translate using the content key
  const titleKey = `notifications.content.${contentKey}.title`
  const messageKey = `notifications.content.${contentKey}.message`

  try {
    const translatedTitle = t.has(titleKey) ? t(titleKey) : notification.title

    let params: Record<string, string | number> = {}
    try {
      params = JSON.parse(notification.message)
    } catch {
      // Old notification with plain-text message
      return { title: translatedTitle, message: notification.message }
    }

    const translatedMessage = t.has(messageKey)
      ? t(messageKey, params)
      : notification.message

    return { title: translatedTitle, message: translatedMessage }
  } catch {
    // Fallback for any translation error
    return { title: notification.title, message: notification.message }
  }
}

function NotificationItem({
  notification,
  onRead,
  onClick,
}: {
  notification: Notification
  onRead: (id: string) => void
  onClick: (notification: Notification) => void
}) {
  const locale = useLocale()
  const dateLocale = locale === "ar" ? ar : enUS
  const { title, message } = useTranslatedNotification(notification)

  return (
    <div
      className={cn(
        "hover:bg-accent/50 flex cursor-pointer items-start gap-3 border-b px-4 py-3 transition-colors",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => onClick(notification)}
    >
      <div className="mt-0.5">
        {notification.isRead ? (
          <MailOpen className="text-muted-foreground size-4" />
        ) : (
          <Mail className={cn("size-4", typeIconColors[notification.type])} />
        )}
      </div>
      <div className="flex-1 space-y-1">
        <p
          className={cn(
            "text-sm leading-tight",
            !notification.isRead && "font-semibold"
          )}
        >
          {title}
        </p>
        <p className="text-muted-foreground line-clamp-2 text-xs">{message}</p>
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: dateLocale,
          })}
        </p>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-1 shrink-0"
          onClick={(e) => {
            e.stopPropagation()
            onRead(notification.id)
          }}
        >
          <CheckCheck className="size-3.5" />
        </Button>
      )}
    </div>
  )
}

export function NotificationBell() {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null)

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNotifications()
  const markRead = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  const unreadCount = data?.pages[0]?.unreadCount ?? 0
  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  )

  // Pull next page when user scrolls near the bottom.
  useEffect(() => {
    if (!viewportEl) return
    const onScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return
      const { scrollTop, clientHeight, scrollHeight } = viewportEl
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        fetchNextPage()
      }
    }
    viewportEl.addEventListener("scroll", onScroll, { passive: true })
    return () => viewportEl.removeEventListener("scroll", onScroll)
  }, [viewportEl, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Auto-fill: when the loaded content does not yet overflow the viewport,
  // keep pulling pages until it does (or no more pages remain).
  useEffect(() => {
    if (!viewportEl || !hasNextPage || isFetchingNextPage) return
    if (viewportEl.scrollHeight <= viewportEl.clientHeight + 1) {
      fetchNextPage()
    }
  }, [
    viewportEl,
    notifications.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markRead.mutate(notification.id)
    }

    // Navigate to the related entity
    if (notification.relatedId && notification.relatedType) {
      const routes: Record<string, string> = {
        task: `/task/${notification.relatedId}`,
        project: `/projects/${notification.relatedId}`,
        contact: `/contacts`,
        event: `/calendar`,
      }
      const route = routes[notification.relatedType]
      if (route) {
        setOpen(false)
        router.push(route)
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="hover:bg-accent relative inline-flex size-9 cursor-pointer items-center justify-center rounded-md">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align={locale === "ar" ? "start" : "end"}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">{t("notifications.title")}</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              {t("notifications.markAllRead")}
            </Button>
          )}
        </div>

        <ScrollArea viewportRef={setViewportEl} className="h-100">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-12 text-sm">
              <Bell className="text-muted-foreground/50 mb-2 size-8" />
              {t("notifications.empty")}
            </div>
          ) : (
            <>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={(id) => markRead.mutate(id)}
                  onClick={handleNotificationClick}
                />
              ))}
              {isFetchingNextPage && (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-3 text-xs">
                  <Loader2 className="size-3.5 animate-spin" />
                  {t("notifications.loadingMore")}
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
