"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useWeather } from "@/hooks/use-weather"
import { useTranslations } from "next-intl"

const OPEN_WEATHER_ICON_BASE = "https://openweathermap.org/img/wn"

export function WeatherStatus({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("weather")
  const { data: weather, isLoading, isError, error } = useWeather()

  if (isLoading) {
    return (
      <Card
        className={cn(
          "w-full",
          compact ? "z-10 w-fit bg-transparent py-0" : ""
        )}
      >
        <CardContent className="px-3 py-3 md:px-6 md:py-6">
          <div className="text-primary text-lg font-medium md:text-2xl">—</div>
          <div className="text-xs text-white md:text-sm">{t("loading")}</div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !weather) {
    return (
      <Card
        className={cn(
          "w-full",
          compact ? "z-10 w-fit bg-transparent py-0" : ""
        )}
      >
        <CardContent className="px-3 py-3 md:px-6 md:py-6">
          <div className="text-primary text-lg font-medium md:text-2xl">—</div>
          <div className="text-xs text-white md:text-sm">
            {error instanceof Error ? error.message : t("unavailable")}
          </div>
        </CardContent>
      </Card>
    )
  }

  const condition = weather.weather[0]
  const temp = Math.round(weather.main.temp)
  const feelsLike = Math.round(weather.main.feels_like)
  const icon = condition?.icon ?? "01d"
  // Description comes localized from Open Weather API (lang param)
  const description =
    condition?.description?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? "—"
  const location = weather.name
    ? `${weather.name}${weather.sys?.country ? `, ${weather.sys.country}` : ""}`
    : ""

  return (
    <Card
      className={cn("w-full", compact ? "z-10 w-fit bg-transparent py-0" : "")}
    >
      <CardContent className="px-3 py-3 md:px-6 md:py-6">
        <div className="flex flex-col gap-3 md:gap-6">
          <div>
            {/* Left: Location and condition */}
            <div className="flex flex-col items-start gap-2 md:gap-4">
              <div className="flex flex-col items-start">
                <span className="text-primary text-lg leading-tight font-semibold md:text-2xl md:leading-normal md:font-medium">
                  {location || "—"}
                </span>
                <span className="text-xs text-white md:text-base">
                  {t("feelsLike", { temp: feelsLike })}
                </span>
              </div>
              <div className="bg-border h-px w-full" />
              <div className="flex justify-between">
                <div className="flex flex-col items-start">
                  <span className="text-primary text-lg leading-tight font-semibold md:text-2xl md:leading-normal md:font-medium">
                    {temp}°C
                  </span>
                  <span className="text-xs text-white md:text-base">
                    {description}
                  </span>
                </div>
                {/* Right: Icon */}
                <div className={cn("flex shrink-0 flex-col items-center")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${OPEN_WEATHER_ICON_BASE}/${icon}@2x.png`}
                    alt={description}
                    className="size-10 md:size-13"
                    width={64}
                    height={64}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Extra details when not compact */}
          {!compact && (
            <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-1 md:gap-3 md:pb-2">
              <div className="bg-muted/30 flex min-w-[70px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 md:min-w-[80px] md:gap-1 md:rounded-lg md:px-3 md:py-2">
                <span className="text-[10px] font-medium text-white md:text-sm">
                  {t("humidity")}
                </span>
                <span className="text-[11px] font-semibold text-white md:text-xs">
                  {weather.main.humidity}%
                </span>
              </div>
              {weather.wind != null && (
                <div className="bg-muted/30 flex min-w-[70px] flex-col items-center gap-0.5 rounded-md px-2 py-1.5 md:min-w-[80px] md:gap-1 md:rounded-lg md:px-3 md:py-2">
                  <span className="text-[10px] font-medium text-white md:text-sm">
                    {t("wind")}
                  </span>
                  <span className="text-[11px] font-semibold text-white md:text-xs">
                    {t("windSpeed", {
                      speed: Math.round(weather.wind.speed),
                    })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
