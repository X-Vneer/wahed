"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import type { StaffPageSettings } from "@/lib/get-staff-page-settings"

type StaffPageSettingsContextValue = {
  settings: StaffPageSettings
  setSettings: (settings: StaffPageSettings) => void
}

const StaffPageSettingsContext =
  createContext<StaffPageSettingsContextValue | null>(null)

const DEFAULT_SETTINGS: StaffPageSettings = {
  heroBackgroundImageUrl: null,
  attendanceLink: "/attendance",
  accountingLink: "/accounting",
}

export function StaffPageSettingsProvider({
  initialSettings,
  children,
}: {
  initialSettings: StaffPageSettings
  children: ReactNode
}) {
  const [settings, setSettingsState] = useState<StaffPageSettings>(
    () => initialSettings ?? DEFAULT_SETTINGS
  )
  const setSettings = useCallback((next: StaffPageSettings) => {
    setSettingsState(next)
  }, [])

  return (
    <StaffPageSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </StaffPageSettingsContext.Provider>
  )
}

export function useStaffPageSettingsContext(): StaffPageSettingsContextValue {
  const ctx = useContext(StaffPageSettingsContext)
  if (!ctx) {
    throw new Error(
      "useStaffPageSettingsContext must be used within StaffPageSettingsProvider"
    )
  }
  return ctx
}
