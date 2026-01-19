"use client"

import { LogOut } from "lucide-react"
import { useRouter } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import apiClient from "@/services"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export function LogoutButton() {
  const router = useRouter()
  const t = useTranslations("sidebar")
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await apiClient.post("/api/auth/logout")
      router.refresh()
      router.push("/auth/login")
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive focus-visible:ring-destructive/20"
    >
      {isLoggingOut ? (
        <>
          <Spinner className="size-4" />
          <span className="sr-only">{t("logout")}</span>
        </>
      ) : (
        <>
          <LogOut className="size-4" />
          <span>{t("logout")}</span>
        </>
      )}
    </Button>
  )
}
