/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { OpenWeatherResponse } from "@/@types/weather"
import { useState, useEffect } from "react"
import { useLocale } from "next-intl"

// Default coordinates (same as prayer times)
const DEFAULT_LATITUDE = 24.774265
const DEFAULT_LONGITUDE = 46.738586

const fetchWeather = async (
  latitude: number,
  longitude: number,
  lang: string
): Promise<OpenWeatherResponse> => {
  const { data } = await apiClient.get<OpenWeatherResponse>("/api/weather", {
    params: { lat: latitude, lon: longitude, lang },
  })
  return data
}

export const useWeather = () => {
  const locale = useLocale()
  const [latitude, setLatitude] = useState<number>(DEFAULT_LATITUDE)
  const [longitude, setLongitude] = useState<number>(DEFAULT_LONGITUDE)
  const [locationLoaded, setLocationLoaded] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setLocationLoaded(true)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationLoaded(true)
      },
      () => {
        setLatitude(DEFAULT_LATITUDE)
        setLongitude(DEFAULT_LONGITUDE)
        setLocationLoaded(true)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    )
  }, [])

  return useQuery({
    queryKey: ["weather", latitude, longitude, locale],
    queryFn: () => fetchWeather(latitude, longitude, locale),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: locationLoaded,
  })
}
