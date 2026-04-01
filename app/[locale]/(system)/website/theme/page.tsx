"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWebsiteContent } from "@/app/[locale]/(system)/website/_components/use-website-content"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type ThemeContent = {
  primaryColor: string
  accentColor: string
  fontStyle: string
}

export default function WebsiteThemePage() {
  const t = useTranslations("websiteCms.theme")
  const { content, isLoading, save } = useWebsiteContent<ThemeContent>("theme")
  const [values, setValues] = useState<ThemeContent>({
    primaryColor: "",
    accentColor: "",
    fontStyle: "sans",
  })

  useEffect(() => {
    if (content) {
      setValues({
        primaryColor: content.primaryColor ?? "",
        accentColor: content.accentColor ?? "",
        fontStyle: content.fontStyle ?? "sans",
      })
    }
  }, [content])

  const handleSave = async () => {
    await save(values)
    toast.success(t("save"))
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>{t("card.title")}</CardTitle>
          <CardDescription>{t("card.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">{t("fields.primaryColor")}</Label>
              <Input
                id="primary-color"
                value={values.primaryColor}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    primaryColor: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent-color">{t("fields.accentColor")}</Label>
              <Input
                id="accent-color"
                value={values.accentColor}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    accentColor: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t("fields.fontStyle")}</Label>
            <Select
              value={values.fontStyle}
              onValueChange={(value) =>
                setValues((prev) => ({ ...prev, fontStyle: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("fields.fontPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans">{t("fontOptions.sans")}</SelectItem>
                <SelectItem value="serif">{t("fontOptions.serif")}</SelectItem>
                <SelectItem value="mono">{t("fontOptions.mono")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {t("save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
