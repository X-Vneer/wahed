"use client"

import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { OpenWeatherResponse } from "@/@types/weather"
import { useLocale } from "next-intl"
import { useUserLocation } from "@/hooks/use-user-location"

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
  const { latitude, longitude, locationLoaded } = useUserLocation()

  return useQuery({
    queryKey: ["weather", latitude, longitude, locale],
    queryFn: () => fetchWeather(latitude, longitude, locale),
    staleTime: 1000 * 60 * 10, // 10 minutes
    enabled: locationLoaded,
  })
}
