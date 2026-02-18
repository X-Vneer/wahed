"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"
import { LayoutDashboard, Users } from "lucide-react"
import { setSystemLayout } from "../actions/set-system-layout"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

type Variant = "staff" | "admin"

export function LayoutViewSwitcher({ variant }: { variant: Variant }) {
  const router = useRouter()
  const t = useTranslations("sidebar")
  const [isSwitching, setIsSwitching] = useState(false)

  const handleClick = async () => {
    const value = variant === "staff" ? "admin" : "staff"
    setIsSwitching(true)
    try {
      const result = await setSystemLayout(value)
      if (result.ok) {
        router.refresh()
      }
    } finally {
      setIsSwitching(false)
    }
  }

  if (variant === "staff") {
    return (
      <Button
        variant="outline"
        size="lg"
        onClick={handleClick}
        disabled={isSwitching}
        aria-label={t("adminView")}
      >
        {isSwitching ? (
          <Spinner className="size-4" />
        ) : (
          <LayoutDashboard className="size-4" />
        )}
        <span className="ml-2 hidden sm:inline">{t("adminView")}</span>
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleClick}
      disabled={isSwitching}
      aria-label={t("staffView")}
    >
      {isSwitching ? (
        <Spinner className="size-4" />
      ) : (
        <Users className="size-4" />
      )}
      <span className="ml-2 hidden sm:inline">{t("staffView")}</span>
    </Button>
  )
}
