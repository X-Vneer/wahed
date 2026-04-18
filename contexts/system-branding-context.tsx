"use client"

import type { SystemBranding } from "@/lib/system-site-settings/service"
import { createContext, useContext } from "react"

const SystemBrandingContext = createContext<SystemBranding | null>(null)

export function SystemBrandingProvider({
  value,
  children,
}: {
  value: SystemBranding
  children: React.ReactNode
}) {
  return (
    <SystemBrandingContext.Provider value={value}>
      {children}
    </SystemBrandingContext.Provider>
  )
}

/**
 * Returns current system branding; falls back to safe defaults if the provider is
 * not mounted (e.g. public pages outside the authenticated layout).
 */
export function useSystemBranding(): SystemBranding {
  const ctx = useContext(SystemBrandingContext)
  if (ctx) return ctx
  return {
    systemName: "Wahd",
    systemNameAr: null,
    systemNameEn: "Wahd",
    logoForDarkBgUrl: null,
    logoForLightBgUrl: null,
    logoSquareUrl: null,
    faviconUrl: null,
    primaryColor: null,
    accentColor: null,
    sidebarVariant: "light",
    loginBackgroundUrl: null,
    loginWelcomeTitle: null,
    loginSubtitle: null,
    supportEmail: null,
    supportPhone: null,
  }
}
