"use client"

import { loginBg, noise, gridBg } from "@/assets"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useUserData } from "@/hooks/use-user-data"
import { useLogout } from "@/hooks/use-logout"
import { Spinner } from "@/components/ui/spinner"
import { useTranslations } from "next-intl"
import Image from "next/image"
import StaffTabs from "./tabs"
import { usePathname } from "@/lib/i18n/navigation"
import { LogOut } from "lucide-react"
import { PrayerTimer } from "@/components/prayer-timer"
import { WeatherStatus } from "@/components/weather-status"

export default function StaffPage() {
  const t = useTranslations("welcome.staff")
  const { data: user, isLoading } = useUserData()
  const logoutMutation = useLogout()

  const pathname = usePathname()
  const length = pathname.split("/")
  const hideHeroSection = length.length > 2

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      return t("goodMorning", { defaultValue: "Good morning" })
    } else if (hour >= 12 && hour < 17) {
      return t("goodAfternoon", { defaultValue: "Good afternoon" })
    } else if (hour >= 17 && hour < 21) {
      return t("goodEvening", { defaultValue: "Good evening" })
    } else {
      return t("goodNight", { defaultValue: "Good night" })
    }
  }

  if (hideHeroSection) {
    return null
  }

  return (
    <div>
      <div className="relative -mx-4 -mt-4 flex items-center justify-center overflow-hidden">
        {/* Background Images */}
        <Image
          src={loginBg}
          className="absolute h-full w-full object-cover"
          alt="bg"
          priority
        />
        <Image
          src={noise}
          className="absolute h-full w-full object-cover opacity-10"
          alt="Noise"
        />
        <Image
          src={gridBg}
          className="absolute h-full w-full object-cover"
          alt="grid"
        />

        {/* Gradient Overlays */}
        <div
          style={{
            background:
              "radial-gradient(40.38% 50% at 50% 50%, #18181B 0%, rgba(24, 24, 27, 0.2) 100%)",
          }}
          className="absolute inset-0 opacity-35"
        ></div>
        <div
          style={{
            background:
              "linear-gradient(116.56deg, rgba(255, 255, 255, 0) 24.66%, rgba(255, 94, 39, 0.2) 138.88%)",
          }}
          className="absolute inset-0 opacity-30"
        ></div>
        <div className="relative container grid grid-cols-4 items-center">
          <div>
            <PrayerTimer compact />
          </div>
          {/* Content */}
          <div className="relative col-span-2 flex flex-col items-center gap-6 px-4 py-12 text-center">
            {/* Page Title */}
            <h1 className="text-xl font-bold text-white md:text-2xl">
              {getGreeting()}, {user?.name || t("title")}
            </h1>

            {/* Profile Picture */}
            <div className="group relative">
              <Avatar className="size-20 border-2 border-white/20 shadow-2xl md:size-30">
                <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                <AvatarFallback className="text-xl font-bold md:text-3xl">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              {/* Logout Icon Overlay - appears on hover */}
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Logout"
              >
                <LogOut className="text-destructive size-6 stroke-1 md:size-8" />
              </button>
            </div>

            {/* User Name - Large */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white md:text-2xl">
                {user?.name || t("title")}
              </h2>
              {/* User Name - Small (duplicate) */}
              <p className="text-white/70 md:text-lg">
                {user?.roleName || t("member")}
              </p>
            </div>
          </div>
          <div>
            <WeatherStatus compact />
          </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <StaffTabs />
        </div>
      </div>
    </div>
  )
}
