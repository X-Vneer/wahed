"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { ClipboardList } from "lucide-react"
import { useTranslations } from "next-intl"

export function GeneralTasksCard() {
  const t = useTranslations("tasks")
  return (
    <Card className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-none ring-0">
      <CardContent className="flex flex-1 flex-col gap-3 px-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground text-lg font-bold">
            {t("generalCard.title")}
          </h3>
          <ClipboardList className="text-muted-foreground size-5 shrink-0" />
        </div>
        <p className="text-foreground line-clamp-3 text-sm">
          {t("generalCard.description")}
        </p>
        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 hover:text-primary w-full"
            nativeButton={false}
            render={
              <Link
                href="/tasks/general"
                className="flex items-center justify-center gap-2"
              >
                {t("generalCard.viewTasks")}
              </Link>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
