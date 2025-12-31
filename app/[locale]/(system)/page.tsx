"use client"

import { useTranslations } from "next-intl"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useUserData } from "@/hooks/use-user-data"
import { Spinner } from "@/components/ui/spinner"

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

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            {t("title")}, {user?.name || t("greeting")}!
          </CardTitle>
          <CardDescription className="text-base">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("description")}</p>
        </CardContent>
      </Card>
    </div>
  )
}
