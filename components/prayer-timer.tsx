"use client"

import { useEffect, useMemo, useState } from "react"
import Countdown from "react-countdown"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  format,
  addDays,
  isAfter,
  isBefore,
  startOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns"
import { usePrayerTimes } from "@/hooks/use-prayer-times"

export interface PrayerTime {
  name: string
  time: string // Format: "HH:mm"
  nameKey: string // Translation key
}

interface PrayerCountdownProps {
  prayerTimes: PrayerTime[]
  initialPrayer: PrayerTime | null
  onPrayerChange?: (prayer: PrayerTime | null) => void
}

function PrayerCountdown({
  prayerTimes,
  initialPrayer,
  onPrayerChange,
}: PrayerCountdownProps) {
  const findNextPrayer = (
    now: Date,
    times: PrayerTime[]
  ): PrayerTime | null => {
    const today = startOfDay(now)
    let next: PrayerTime | null = null

    for (let i = 0; i < times.length; i++) {
      const prayer = times[i]
      const timeParts = prayer.time.split(":")
      const hours = parseInt(timeParts[0], 10)
      const minutes = parseInt(timeParts[1] || "0", 10)

      const prayerTime = setSeconds(
        setMinutes(setHours(today, hours), minutes),
        0
      )

      if (isAfter(prayerTime, now)) {
        next = prayer
        break
      }
    }

    if (!next && times.length > 0) {
      next = times[0]
    }

    return next
  }

  const getPrayerDate = (now: Date, prayer: PrayerTime) => {
    const timeParts = prayer.time.split(":")
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1] || "0", 10)

    const today = startOfDay(now)
    let nextPrayerTime = setSeconds(
      setMinutes(setHours(today, hours), minutes),
      0
    )

    if (isBefore(nextPrayerTime, now)) {
      nextPrayerTime = addDays(nextPrayerTime, 1)
    }

    return nextPrayerTime
  }

  const [targetDate, setTargetDate] = useState<Date | null>(() => {
    if (!prayerTimes.length) return null

    const now = new Date()

    const basePrayer =
      initialPrayer &&
      prayerTimes.some((p) => p.nameKey === initialPrayer.nameKey)
        ? initialPrayer
        : findNextPrayer(now, prayerTimes)

    if (!basePrayer) return null

    return getPrayerDate(now, basePrayer)
  })

  const formatTime = (hours: number, minutes: number, seconds: number) => {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`
  }

  return (
    <span className="text-primary text-2xl font-medium tabular-nums">
      {targetDate ? (
        <Countdown
          key={targetDate.getTime()}
          date={targetDate}
          onComplete={() => {
            const now = new Date()
            if (!prayerTimes.length) {
              onPrayerChange?.(null)
              setTargetDate(null)
              return
            }

            const nextPrayer = findNextPrayer(now, prayerTimes)

            if (!nextPrayer) {
              onPrayerChange?.(null)
              setTargetDate(null)
              return
            }

            onPrayerChange?.(nextPrayer)
            setTargetDate(getPrayerDate(now, nextPrayer))
          }}
          renderer={({ hours, minutes, seconds }) => (
            <span>{formatTime(hours, minutes, seconds)}</span>
          )}
        />
      ) : (
        <span>{formatTime(0, 0, 0)}</span>
      )}
    </span>
  )
}

export function PrayerTimer() {
  const t = useTranslations("prayer")
  const locale = useLocale()
  const isArabic = locale === "ar"

  const { data: prayerData } = usePrayerTimes()

  // Transform timings to array format
  const prayerTimes = useMemo(() => {
    if (!prayerData?.timings) return []

    return [
      { name: "الفجر", nameKey: "fajr", time: prayerData.timings.Fajr },
      { name: "الشروق", nameKey: "sunrise", time: prayerData.timings.Sunrise },
      { name: "الظهر", nameKey: "dhuhr", time: prayerData.timings.Dhuhr },
      { name: "العصر", nameKey: "asr", time: prayerData.timings.Asr },
      { name: "المغرب", nameKey: "maghrib", time: prayerData.timings.Maghrib },
      { name: "العشاء", nameKey: "isha", time: prayerData.timings.Isha },
    ]
  }, [prayerData])

  // Extract hijri date from API response
  const hijriDate = useMemo(() => {
    if (!prayerData?.date?.hijri) {
      return { day: "", month: "" }
    }

    const hijri = prayerData.date.hijri
    return {
      day: hijri.day,
      month: isArabic ? hijri.month.ar : hijri.month.en,
    }
  }, [prayerData, isArabic])

  const [displayPrayer, setDisplayPrayer] = useState<PrayerTime | null>(null)

  // Compute the initial next prayer only when prayer times change.
  // The live countdown (and future prayer transitions) are handled in the
  // dedicated PrayerCountdown component so the rest of the UI does not
  // re-render every second.
  useEffect(() => {
    const updateDisplayPrayer = () => {
      if (!prayerTimes.length) {
        setDisplayPrayer(null)
        return
      }

      const now = new Date()
      const today = startOfDay(now)
      let next: PrayerTime | null = null

      for (let i = 0; i < prayerTimes.length; i++) {
        const prayer = prayerTimes[i]
        const timeParts = prayer.time.split(":")
        const hours = parseInt(timeParts[0], 10)
        const minutes = parseInt(timeParts[1] || "0", 10)

        const prayerTime = setSeconds(
          setMinutes(setHours(today, hours), minutes),
          0
        )

        if (isAfter(prayerTime, now)) {
          next = prayer
          break
        }
      }

      if (!next && prayerTimes.length > 0) {
        next = prayerTimes[0]
      }

      setDisplayPrayer(next || prayerTimes[0])
    }

    updateDisplayPrayer()
  }, [prayerTimes])

  const formatPrayerTime = (time: string) => {
    // Handle time format that might include seconds (e.g., "15:30:00" or "15:30")
    const timeParts = time.split(":")
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1] || "0", 10)

    const today = startOfDay(new Date())
    const date = setSeconds(setMinutes(setHours(today, hours), minutes), 0)
    const formatted = format(date, "hh:mm a")
    // For Arabic, replace AM/PM with Arabic equivalents
    if (isArabic) {
      return formatted.replace("AM", "ص").replace("PM", "م")
    }
    return formatted
  }

  const formatPrayerTimeShort = (time: string) => {
    // Handle time format that might include seconds (e.g., "15:30:00" or "15:30")
    const timeParts = time.split(":")
    const hours = parseInt(timeParts[0], 10)
    const minutes = parseInt(timeParts[1] || "0", 10)

    const today = startOfDay(new Date())
    const date = setSeconds(setMinutes(setHours(today, hours), minutes), 0)
    return format(date, "hh:mm")
  }

  return (
    <Card className="w-full">
      <CardContent className="px-6">
        <div className="flex flex-col gap-6">
          {/* Top Section: Countdown and Current Prayer */}
          <div className="flex items-start justify-between gap-4">
            {/* Right: Current Prayer and Hijri Date */}
            <div className="flex items-start gap-4">
              {/* Current Prayer */}
              {displayPrayer && (
                <div className="flex flex-col items-end">
                  <span className="text-primary text-4xl font-medium">
                    {isArabic ? displayPrayer.name : t(displayPrayer.nameKey)}
                  </span>
                  <span className="text-muted-foreground text-log">
                    {formatPrayerTime(displayPrayer.time)}
                  </span>
                </div>
              )}

              {/* Separator */}
              <div className="bg-border h-12 w-px" />

              {/* Hijri Date */}
              <div className="flex flex-col items-end">
                <span className="text-primary text-4xl font-medium">
                  {hijriDate.day}
                </span>
                <span className="text-muted-foreground text-log">
                  {hijriDate.month}
                </span>
              </div>
            </div>
            {/* Left: Countdown */}
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-1 text-sm">
                {t("remaining")}
              </span>
              <PrayerCountdown
                key={displayPrayer?.nameKey ?? "none"}
                prayerTimes={prayerTimes}
                initialPrayer={displayPrayer}
                onPrayerChange={setDisplayPrayer}
              />
            </div>
          </div>

          {/* Bottom Section: Prayer Times List */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
            {prayerTimes.map((prayer) => {
              // Highlight the next prayer (the one we're counting down to)
              const isCurrent = prayer.nameKey === displayPrayer?.nameKey
              return (
                <div
                  key={prayer.nameKey}
                  className={cn(
                    "flex min-w-[70px] flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
                    isCurrent ? "bg-primary/10" : "hover:bg-muted/50"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {isArabic ? prayer.name : t(prayer.nameKey)}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isCurrent
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatPrayerTimeShort(prayer.time)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
