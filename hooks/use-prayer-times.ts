"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { PrayerTimesResponse } from "@/@types/prayer-times"
import { format } from "date-fns"
import { useLocale } from "next-intl"
import { useState, useEffect } from "react"

// Macau coordinates as default
const DEFAULT_LATITUDE = 22.2109
const DEFAULT_LONGITUDE = 113.5439

const fetchPrayerTimes = async (
  date: string,
  latitude: number,
  longitude: number
) => {
  const { data } = await axios.get<PrayerTimesResponse>(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}`
  )
  return data.data
}

export const usePrayerTimes = () => {
  const locale = useLocale()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = format(new Date(), "dd-MM-yyyy")

  const [latitude, setLatitude] = useState<number>(DEFAULT_LATITUDE)
  const [longitude, setLongitude] = useState<number>(DEFAULT_LONGITUDE)
  const [locationLoaded, setLocationLoaded] = useState(false)

  useEffect(() => {
    // Get user's geolocation
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude)
          setLongitude(position.coords.longitude)
          setLocationLoaded(true)
        },
        (error) => {
          // If geolocation fails, use Macau as default
          console.warn("Geolocation error:", error)
          setLatitude(DEFAULT_LATITUDE)
          setLongitude(DEFAULT_LONGITUDE)
          setLocationLoaded(true)
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 60000, // Cache for 1 minute
        }
      )
    } else {
      // Geolocation not supported, use Macau as default
      setLocationLoaded(true)
    }
  }, [])

  return useQuery({
    queryKey: ["prayerTimes", date, timezone, latitude, longitude, locale],
    queryFn: () => fetchPrayerTimes(date, latitude, longitude),
    staleTime: 1000 * 60 * 60,
    enabled: locationLoaded, // Only fetch when location is determined
  })
}
