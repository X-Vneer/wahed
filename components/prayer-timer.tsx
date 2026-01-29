"use client"

import { useEffect, useMemo, useState } from "react"
import Countdown from "react-countdown"
import { useTranslations, useLocale } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  addDays,
  isAfter,
  isBefore,
  startOfDay,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns"
import { usePrayerTimes } from "@/hooks/use-prayer-times"

// ============================================================================
// Types
// ============================================================================

export interface PrayerTime {
  name: string
  time: string // Format: "HH:mm" or "HH:mm:ss"
  nameKey: string // Translation key
}

interface PrayerCountdownProps {
  prayerTimes: PrayerTime[]
  initialPrayer: PrayerTime | null
  onPrayerChange?: (prayer: PrayerTime | null) => void
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parses a time string (HH:mm or HH:mm:ss) and returns hours and minutes
 */
function parseTimeString(time: string): { hours: number; minutes: number } {
  const timeParts = time.split(":")
  return {
    hours: parseInt(timeParts[0], 10),
    minutes: parseInt(timeParts[1] || "0", 10),
  }
}

/**
 * Converts a prayer time string to a Date object for today
 */
function timeStringToDate(
  time: string,
  referenceDate: Date = new Date()
): Date {
  const { hours, minutes } = parseTimeString(time)
  const today = startOfDay(referenceDate)
  return setSeconds(setMinutes(setHours(today, hours), minutes), 0)
}

/**
 * Finds the next prayer time from the current time
 */
function findNextPrayer(
  now: Date,
  prayerTimes: PrayerTime[]
): PrayerTime | null {
  if (!prayerTimes.length) return null

  const today = startOfDay(now)

  for (const prayer of prayerTimes) {
    const prayerTime = timeStringToDate(prayer.time, today)
    if (isAfter(prayerTime, now)) {
      return prayer
    }
  }

  // If no prayer found for today, return the first prayer of tomorrow
  return prayerTimes[0] || null
}

/**
 * Gets the Date object for a prayer time, handling next day if needed
 */
function getPrayerDate(now: Date, prayer: PrayerTime): Date {
  const prayerTime = timeStringToDate(prayer.time, now)

  // If the prayer time has passed, it's for tomorrow
  if (isBefore(prayerTime, now)) {
    return addDays(prayerTime, 1)
  }

  return prayerTime
}

/**
 * Formats countdown time as HH:mm:ss
 */
function formatCountdownTime(
  hours: number,
  minutes: number,
  seconds: number
): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`
}

/**
 * Displays time as-is from API (strips seconds if present to show HH:mm format)
 */
function displayTime(time: string): string {
  // API returns time in "HH:mm" or "HH:mm:ss" format, show as HH:mm
  return time.split(":").slice(0, 2).join(":")
}

/**
 * Transforms API prayer timings to PrayerTime array
 */
function transformPrayerTimes(timings: {
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}): PrayerTime[] {
  return [
    { name: "الفجر", nameKey: "fajr", time: timings.Fajr },
    { name: "الشروق", nameKey: "sunrise", time: timings.Sunrise },
    { name: "الظهر", nameKey: "dhuhr", time: timings.Dhuhr },
    { name: "العصر", nameKey: "asr", time: timings.Asr },
    { name: "المغرب", nameKey: "maghrib", time: timings.Maghrib },
    { name: "العشاء", nameKey: "isha", time: timings.Isha },
  ]
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get the initial display prayer based on current time
 */
function useDisplayPrayer(prayerTimes: PrayerTime[]) {
  // Create a stable key from prayer times for dependency tracking
  const prayerTimesKey = useMemo(
    () => prayerTimes.map((p) => `${p.nameKey}:${p.time}`).join("|"),
    [prayerTimes]
  )

  const [displayPrayer, setDisplayPrayer] = useState<PrayerTime | null>(() => {
    if (!prayerTimes.length) return null
    const now = new Date()
    const next = findNextPrayer(now, prayerTimes)
    return next || prayerTimes[0] || null
  })

  useEffect(() => {
    if (!prayerTimes.length) {
      setDisplayPrayer(null)
      return
    }

    const now = new Date()
    const next = findNextPrayer(now, prayerTimes)
    setDisplayPrayer(next || prayerTimes[0] || null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimesKey])

  return [displayPrayer, setDisplayPrayer] as const
}

// ============================================================================
// Components
// ============================================================================

function PrayerCountdown({
  prayerTimes,
  initialPrayer,
  onPrayerChange,
}: PrayerCountdownProps) {
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

  const handleCountdownComplete = () => {
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
  }

  return (
    <span className="text-primary text-lg font-semibold tabular-nums md:text-2xl md:font-medium">
      {targetDate ? (
        <Countdown
          key={targetDate.getTime()}
          date={targetDate}
          onComplete={handleCountdownComplete}
          renderer={({ hours, minutes, seconds }) => (
            <span>{formatCountdownTime(hours, minutes, seconds)}</span>
          )}
        />
      ) : (
        <span>{formatCountdownTime(0, 0, 0)}</span>
      )}
    </span>
  )
}

export function PrayerTimer({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("prayer")
  const locale = useLocale()
  const isArabic = locale === "ar"
  const { data: prayerData } = usePrayerTimes()

  const prayerTimes = useMemo(() => {
    if (!prayerData?.timings) return []
    return transformPrayerTimes(prayerData.timings)
  }, [prayerData])

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

  const [displayPrayer, setDisplayPrayer] = useDisplayPrayer(prayerTimes)

  return (
    <Card
      className={cn("w-full", compact ? "z-10 w-fit bg-transparent py-0" : "")}
    >
      <CardContent className="px-3 py-3 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 md:gap-6">
          {/* Top Section: Countdown and Current Prayer */}
          <div
            className={cn(
              "flex items-center justify-between gap-2 md:items-start md:gap-4",
              compact ? "flex-col" : ""
            )}
          >
            {/* Right: Current Prayer and Hijri Date */}
            <div className="flex items-start gap-2 md:gap-4">
              {/* Current Prayer */}
              {displayPrayer && (
                <div className="flex flex-col items-start">
                  <span className="text-primary text-lg leading-tight font-semibold md:text-3xl md:leading-normal md:font-medium">
                    {isArabic ? displayPrayer.name : t(displayPrayer.nameKey)}
                  </span>
                  <span className="text-xs text-white md:text-base">
                    {displayTime(displayPrayer.time)}
                  </span>
                </div>
              )}

              {/* Separator */}
              <div className="bg-border h-8 w-px md:h-12" />

              {/* Hijri Date */}
              <div className="flex flex-col items-start">
                <span className="text-primary text-lg leading-tight font-semibold md:text-3xl md:leading-normal md:font-medium">
                  {hijriDate.day}
                </span>
                <span className="text-xs text-white md:text-base">
                  {hijriDate.month}
                </span>
              </div>
            </div>

            {/* Left: Countdown */}
            <div
              className={cn(
                "flex flex-col items-end",
                compact ? "w-full grow items-center" : ""
              )}
            >
              <span className="mb-0.5 text-[10px] text-white uppercase md:mb-1 md:text-sm md:normal-case">
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
          {!compact && (
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 md:gap-3 md:pb-2">
              {prayerTimes.map((prayer) => {
                const isCurrent = prayer.nameKey === displayPrayer?.nameKey
                return (
                  <div
                    key={prayer.nameKey}
                    className={cn(
                      "flex min-w-[50px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 transition-colors md:min-w-[70px] md:gap-1 md:rounded-lg md:px-3 md:py-2",
                      isCurrent
                        ? "bg-primary/10"
                        : "bg-muted/30 md:hover:bg-muted/50"
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] leading-tight font-medium md:text-sm md:leading-normal",
                        isCurrent ? "text-primary" : "text-white"
                      )}
                    >
                      {isArabic ? prayer.name : t(prayer.nameKey)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-semibold tabular-nums md:text-xs",
                        isCurrent ? "text-primary" : "text-white"
                      )}
                    >
                      {displayTime(prayer.time)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
