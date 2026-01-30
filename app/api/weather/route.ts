import axios from "axios"
import { NextRequest, NextResponse } from "next/server"
import { getReqLocale } from "@/utils/get-req-locale"
import { getTranslations } from "next-intl/server"

const OPEN_WEATHER_BASE = "https://api.openweathermap.org/data/2.5/weather"

export async function GET(request: NextRequest) {
  const locale = await getReqLocale(request)
  const t = await getTranslations({ locale })

  try {
    const apiKey = process.env.OPEN_WEATHER_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: t("weather.errors.api_key_not_configured") },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    if (!lat || !lon) {
      return NextResponse.json(
        { error: t("weather.errors.missing_params") },
        { status: 400 }
      )
    }

    const url = `${OPEN_WEATHER_BASE}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${locale}`
    const res = await axios.get(url)

    return NextResponse.json(res.data)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json(
      { error: t("weather.errors.fetch_error") },
      { status: 500, statusText: "Internal Server Error" }
    )
  }
}
