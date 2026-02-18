"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"
import { useUserData } from "@/hooks/use-user-data"
import {
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  LOCATION_PROMPT_DO_NOT_SHOW_KEY,
} from "@/config"
import { LocationPermissionDialog } from "@/components/location-permission-dialog"

const saveUserLocation = async (params: {
  latitude: number
  longitude: number
}) => {
  const { data } = await apiClient.patch("/api/user/me/location", params)
  return data
}

function getDoNotShowAgain(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(LOCATION_PROMPT_DO_NOT_SHOW_KEY) === "1"
  } catch {
    return false
  }
}

function setDoNotShowAgainStorage(value: boolean): void {
  if (typeof window === "undefined") return
  try {
    if (value) {
      localStorage.setItem(LOCATION_PROMPT_DO_NOT_SHOW_KEY, "1")
    } else {
      localStorage.removeItem(LOCATION_PROMPT_DO_NOT_SHOW_KEY)
    }
  } catch {
    // ignore
  }
}

export type UserLocationValue = {
  latitude: number
  longitude: number
  locationLoaded: boolean
}

const UserLocationContext = createContext<UserLocationValue | null>(null)

export function UserLocationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { data: userData, isFetched: userDataFetched } = useUserData({
    retry: false,
  })
  const [latitude, setLatitude] = useState<number>(DEFAULT_LATITUDE)
  const [longitude, setLongitude] = useState<number>(DEFAULT_LONGITUDE)
  const [locationLoaded, setLocationLoaded] = useState(false)
  const [showLocationPrompt, setShowLocationPrompt] = useState(false)
  const locationResolved = useRef(false)

  const saveLocationMutation = useMutation({
    mutationFn: saveUserLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] })
    },
  })

  const requestLocation = useCallback(
    (doNotShowAgain: boolean) => {
      if (doNotShowAgain) setDoNotShowAgainStorage(true)
      setShowLocationPrompt(false)

      if (!("geolocation" in navigator)) {
        setLatitude(DEFAULT_LATITUDE)
        setLongitude(DEFAULT_LONGITUDE)
        setLocationLoaded(true)
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setLatitude(lat)
          setLongitude(lng)
          if (userData?.id) {
            saveLocationMutation.mutate({ latitude: lat, longitude: lng })
          }
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
    },
    [userData?.id, saveLocationMutation]
  )

  const declineLocation = useCallback((doNotShowAgain: boolean) => {
    if (doNotShowAgain) setDoNotShowAgainStorage(true)
    setShowLocationPrompt(false)
    setLatitude(DEFAULT_LATITUDE)
    setLongitude(DEFAULT_LONGITUDE)
    setLocationLoaded(true)
  }, [])

  useEffect(() => {
    if (!userDataFetched || locationLoaded || locationResolved.current) return
    if (typeof window === "undefined") {
      setLocationLoaded(true)
      return
    }

    const hasSavedLocation =
      userData && userData.latitude != null && userData.longitude != null

    if (hasSavedLocation) {
      setLatitude(userData.latitude as number)
      setLongitude(userData.longitude as number)
      setLocationLoaded(true)
      locationResolved.current = true
      return
    }

    if (!("geolocation" in navigator)) {
      setLocationLoaded(true)
      locationResolved.current = true
      return
    }

    if (getDoNotShowAgain()) {
      setLatitude(DEFAULT_LATITUDE)
      setLongitude(DEFAULT_LONGITUDE)
      setLocationLoaded(true)
      locationResolved.current = true
      return
    }

    locationResolved.current = true
    setShowLocationPrompt(true)
    // saveLocationMutation is stable; userData is covered by specific fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    userDataFetched,
    userData?.id,
    userData?.latitude,
    userData?.longitude,
    locationLoaded,
  ])

  const value: UserLocationValue = {
    latitude,
    longitude,
    locationLoaded,
  }

  return (
    <UserLocationContext.Provider value={value}>
      {children}
      <LocationPermissionDialog
        open={showLocationPrompt}
        onAllow={requestLocation}
        onDecline={declineLocation}
      />
    </UserLocationContext.Provider>
  )
}

export function useUserLocationContext(): UserLocationValue {
  const ctx = useContext(UserLocationContext)
  if (!ctx) {
    throw new Error("useUserLocation must be used within UserLocationProvider")
  }
  return ctx
}
