"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { useUserData } from "@/hooks/use-user-data"
import { UserRole } from "@/lib/generated/prisma/enums"
import { useTranslations } from "next-intl"
import StaffPage from "./_components/staff/home"

export default function Page() {
  const t = useTranslations("welcome")
  const { data: user, isLoading } = useUserData()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  const isAdmin = user?.role === UserRole.ADMIN
  const roleKey = isAdmin ? "admin" : "staff"

  // Show hero section for staff users
  if (!isAdmin) {
    return <StaffPage />
  }

  // Show card view for admin users
  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t(`${roleKey}.title`)}, {user?.name || t("greeting")}!
          </CardTitle>
          <CardDescription className="text-base">
            {t(`${roleKey}.subtitle`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t(`${roleKey}.description`)}</p>
          <div className="mt-6 space-y-2">
            <h3 className="text-sm font-semibold">{t("admin.features")}</h3>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
              <li>{t("admin.feature1")}</li>
              <li>{t("admin.feature2")}</li>
              <li>{t("admin.feature3")}</li>
              <li>{t("admin.feature4")}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
