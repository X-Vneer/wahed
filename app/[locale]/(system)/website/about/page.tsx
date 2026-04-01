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
import { Textarea } from "@/components/ui/textarea"
import { useWebsiteContent } from "@/app/[locale]/(system)/website/_components/use-website-content"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type AboutContent = {
  heading: string
  summary: string
}

export default function WebsiteAboutPage() {
  const t = useTranslations("websiteCms.about")
  const { content, isLoading, save } = useWebsiteContent<AboutContent>("about")
  const [values, setValues] = useState<AboutContent>({
    heading: "",
    summary: "",
  })

  useEffect(() => {
    if (content) {
      setValues({
        heading: content.heading ?? "",
        summary: content.summary ?? "",
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
          <div className="space-y-2">
            <Label htmlFor="about-heading">{t("fields.heading")}</Label>
            <Input
              id="about-heading"
              value={values.heading}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, heading: event.target.value }))
              }
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="about-summary">{t("fields.summary")}</Label>
            <Textarea
              id="about-summary"
              value={values.summary}
              onChange={(event) =>
                setValues((prev) => ({ ...prev, summary: event.target.value }))
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
