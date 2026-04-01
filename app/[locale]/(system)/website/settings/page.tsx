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
import { useWebsiteContent } from "@/app/[locale]/(system)/website/_components/use-website-content"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type SettingsContent = {
  siteName: string
  tagline: string
  metaTitle: string
}

export default function WebsiteGeneralSettingsPage() {
  const t = useTranslations("websiteCms.settings")
  const { content, isLoading, save } =
    useWebsiteContent<SettingsContent>("settings")
  const [values, setValues] = useState<SettingsContent>({
    siteName: "",
    tagline: "",
    metaTitle: "",
  })

  useEffect(() => {
    if (content) {
      setValues({
        siteName: content.siteName ?? "",
        tagline: content.tagline ?? "",
        metaTitle: content.metaTitle ?? "",
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
              <Label htmlFor="site-name">{t("fields.siteName")}</Label>
              <Input
                id="site-name"
                value={values.siteName}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    siteName: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-tagline">{t("fields.tagline")}</Label>
              <Input
                id="site-tagline"
                value={values.tagline}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, tagline: event.target.value }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-meta-title">{t("fields.metaTitle")}</Label>
            <Input
              id="site-meta-title"
              value={values.metaTitle}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, metaTitle: event.target.value }))
              }
              disabled={isLoading}
            />
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {t("save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
