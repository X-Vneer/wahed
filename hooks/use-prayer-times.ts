"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { PrayerTimesResponse } from "@/@types/prayer-times"
import { format } from "date-fns"
import { useLocale } from "next-intl"
import { useUserLocation } from "@/hooks/use-user-location"

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
  const { latitude, longitude, locationLoaded } = useUserLocation()
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = format(new Date(), "dd-MM-yyyy")

  return useQuery({
    queryKey: ["prayerTimes", date, timezone, latitude, longitude, locale],
    queryFn: () => fetchPrayerTimes(date, latitude, longitude),
    staleTime: 1000 * 60 * 60,
    enabled: locationLoaded,
  })
}
