"use client"

import { PrayerTimer } from "@/components/prayer-timer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import {
  Building,
  Calendar as CalendarIcon,
  ChevronRight,
  FileText,
  Folder,
  MessageSquare,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

export default function StaffPage() {
  const t = useTranslations("welcome.staff.home")

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Mock prayer times (in a real app, these would come from an API)
  const prayerTimes = [
    { name: t("prayerTimes.isha"), time: "07:16" },
    { name: t("prayerTimes.maghrib"), time: "05:54" },
    { name: t("prayerTimes.asr"), time: "03:36" },
    { name: t("prayerTimes.dhuhr"), time: "12:48", isCurrent: true },
    { name: t("prayerTimes.sunrise"), time: "07:40" },
    { name: t("prayerTimes.fajr"), time: "06:15" },
  ]

  // Mock current task data
  const currentTask = {
    title: `${t("task")} 1: ${t("taskContentWriting")}`,
    project: "Project abc ---- First working day May 15 - 2026",
    status: t("current"),
    daysRemaining: 4,
    comments: 4,
    progress: 80,
  }

  // Get current Islamic month (simplified - in real app, use proper conversion)
  const islamicMonths = [
    "محرم",
    "صفر",
    "ربيع الأول",
    "ربيع الثاني",
    "جمادى الأولى",
    "جمادى الثانية",
    "رجب",
    "شعبان",
    "رمضان",
    "شوال",
    "ذو القعدة",
    "ذو الحجة",
  ]

  //   const [timeZone, setTimeZone] = useState<string | undefined>(undefined)

  //   useEffect(() => {
  //     setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  //   }, [])

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
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </CardContent>
          </Card>
          {/* Weekly Schedule Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("weeklySchedule")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Days Header */}
                <div className="mb-2 grid grid-cols-5 gap-1 text-xs font-medium text-gray-600">
                  <div>TUE</div>
                  <div>WED</div>
                  <div className="rounded bg-blue-100 px-1">THU</div>
                  <div>FRI</div>
                  <div>SAT</div>
                </div>
                <div className="mb-4 grid grid-cols-5 gap-1 text-xs text-gray-500">
                  <div>23</div>
                  <div>24</div>
                  <div className="rounded bg-blue-100 px-1">25</div>
                  <div>26</div>
                  <div>27</div>
                </div>

                {/* Time Slots */}
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">7 AM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">8 AM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">9 AM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">10 AM</div>
                    <div className="relative flex-1">
                      <div className="absolute top-0 left-0 w-full rounded bg-blue-500 px-1 py-0.5 text-[10px] text-white">
                        Financial Update
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">11 AM</div>
                    <div className="relative flex-1">
                      <div className="absolute top-0 left-0 w-full rounded bg-purple-500 px-1 py-0.5 text-[10px] text-white">
                        New Employee Welcome Lunch
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">12 PM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">1 PM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 text-[10px] text-gray-500">2 PM</div>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="w-full space-y-4">
          {/* Prayer Times Countdown Card */}
          <PrayerTimer />
          {/* Quick Access Cards and Weekly Schedule */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:col-span-3">
              {/* Projects Card */}
              <Card className="aspect-square cursor-pointer">
                <CardContent className="flex h-full flex-col items-center justify-center space-y-2">
                  <Building className="text-foreground size-8 stroke-1" />
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
                  <CalendarIcon className="text-foreground size-8 stroke-1" />
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
                  <Folder className="text-foreground size-8 stroke-1" />
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
    </div>
  )
}
