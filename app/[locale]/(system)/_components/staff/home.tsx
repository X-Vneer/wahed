"use client"

import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import apiClient from "@/services"
import type { Task } from "@/prisma/tasks"
import { TaskCard } from "@/app/[locale]/(system)/tasks/_components/task-card"
import { BannersSlider } from "./banners"
import { QuickAccessCards } from "./quick-access-cards"
import { UsefulWebsitesSlider } from "./useful-websites"
import WeeklySchedule from "./weekly-schedule"

function useCurrentTask() {
  return useQuery<Task | null, Error>({
    queryKey: ["current-task"],
    queryFn: async () => {
      const { data } = await apiClient.get<Task | null>("/api/tasks/me/current")

      return data
    },
    staleTime: 1000 * 30,
  })
}

function CurrentTaskSection() {
  const t = useTranslations("welcome.staff.home.currentTaskSection")
  const { data: task, isLoading, isError, error } = useCurrentTask()

  return (
    <>
      {isLoading && (
        <p className="text-muted-foreground text-sm">{t("loading")}</p>
      )}

      {!isLoading && isError && (
        <p className="text-destructive text-sm">
          {error?.message ?? t("loadError")}
        </p>
      )}

      {!isLoading && !isError && !task && (
        <p className="text-muted-foreground text-sm">{t("none")}</p>
      )}

      {!isLoading && !isError && task && (
        <TaskCard task={task} className="border-border border" />
      )}
    </>
  )
}

export default function StaffPage() {
  return (
    <div className="space-y-6 md:p-6">
      {/* Top Row: Prayer Times, Current Time, Calendar */}

      <div className="flex flex-col-reverse gap-6 lg:flex-row">
        <div className="w-full items-start gap-4 space-y-4 sm:flex lg:block lg:max-w-xs">
          <Card>
            <CardContent>
              <Calendar
                classNames={{
                  root: " border-none p-2 bg-white",
                }}
                // timeZone={timeZone}
                mode="single"
                selected={new Date()}
              />
            </CardContent>
          </Card>
          {/* Weekly Schedule Card */}
          <WeeklySchedule />
        </div>
        <div className="space-y-4 lg:max-w-[calc(100%-340px)]">
          <QuickAccessCards />
          {/* Current task */}
          <CurrentTaskSection />
          <BannersSlider />
          <UsefulWebsitesSlider />
        </div>
      </div>
    </div>
  )
}
