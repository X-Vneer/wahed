"use client"

import { PrayerTimer } from "@/components/prayer-timer"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import {
  Building,
  Calendar as CalendarIcon,
  ChevronRight,
  Folder,
} from "lucide-react"
import { useTranslations } from "next-intl"
import WeeklySchedule from "./weekly-schedule"

export default function StaffPage() {
  const t = useTranslations("welcome.staff.home")

  return (
    <div className="space-y-6 p-6">
      {/* Top Row: Prayer Times, Current Time, Calendar */}

      <div className="flex gap-4">
        <div className="w-full max-w-xs space-y-4">
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
        <div className="w-full space-y-4">
          {/* Prayer Times Countdown Card */}
          <PrayerTimer />
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Projects Card */}
              <Card className="aspect-square cursor-pointer">
                <CardContent className="flex h-full flex-col items-center justify-center space-y-2">
                  <Building className="text-foreground size-8 xl:size-10 stroke-1" />
                  <div className="text-center">
                    <CardTitle className="text-base font-medium">
                      {t("quickAccess.projects")}
                    </CardTitle>
                  </div>
                </CardContent>
                <CardFooter className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between py-2 text-xs font-normal text-[#949495]"
                    nativeButton={false}
                    render={
                      <Link href="/projects" className="flex items-center">
                        {t("quickAccess.viewProjects")}
                        <ChevronRight className="ms-1 size-3 rtl:rotate-180" />
                      </Link>
                    }
                  />
                </CardFooter>
              </Card>

              {/* Calendar Card */}
              <Card className="aspect-square cursor-pointer">
                <CardContent className="flex h-full flex-col items-center justify-center space-y-2">
                  <CalendarIcon className="text-foreground size-8 xl:size-10 stroke-1" />
                  <div className="text-center">
                    <CardTitle className="text-base font-medium">
                      {t("quickAccess.calendar")}
                    </CardTitle>
                  </div>
                </CardContent>
                <CardFooter className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between py-2 text-xs font-normal text-[#949495]"
                    nativeButton={false}
                    render={
                      <Link href="/calendar" className="flex items-center">
                        {t("quickAccess.goToCalendar")}
                        <ChevronRight className="ms-1 size-3 rtl:rotate-180" />
                      </Link>
                    }
                  />
                </CardFooter>
              </Card>

              {/* File Manager Card */}
              <Card className="aspect-square cursor-pointer">
                <CardContent className="flex h-full flex-col items-center justify-center space-y-2">
                  <Folder className="text-foreground size-8 xl:size-10 stroke-1" />
                  <div className="text-center">
                    <CardTitle className="text-base font-medium">
                      {t("quickAccess.fileManager")}
                    </CardTitle>
                  </div>
                </CardContent>
                <CardFooter className="p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between py-2 text-xs font-normal text-[#949495]"
                    nativeButton={false}
                    render={
                      <Link href="/files" className="flex items-center">
                        {t("quickAccess.goToFiles")}
                        <ChevronRight className="ms-1 size-3 rtl:rotate-180" />
                      </Link>
                    }
                  />
                </CardFooter>
              </Card>
            </div>
        </div>
      </div>
    </div>
  )
}
