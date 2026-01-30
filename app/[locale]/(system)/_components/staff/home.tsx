"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { WeatherStatus } from "@/components/weather-status"
import { BannersSlider } from "./banners"
import { QuickAccessCards } from "./quick-access-cards"
import { UsefulWebsitesSlider } from "./useful-websites"
import WeeklySchedule from "./weekly-schedule"

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
          <BannersSlider />
          <UsefulWebsitesSlider />
        </div>
      </div>
    </div>
  )
}
