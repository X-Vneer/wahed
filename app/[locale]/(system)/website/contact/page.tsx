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

type ContactContent = {
  email: string
  phone: string
  linkedin: string
  instagram: string
}

export default function WebsiteContactPage() {
  const t = useTranslations("websiteCms.contact")
  const { content, isLoading, save } =
    useWebsiteContent<ContactContent>("contact")
  const [values, setValues] = useState<ContactContent>({
    email: "",
    phone: "",
    linkedin: "",
    instagram: "",
  })

  useEffect(() => {
    if (content) {
      setValues({
        email: content.email ?? "",
        phone: content.phone ?? "",
        linkedin: content.linkedin ?? "",
        instagram: content.instagram ?? "",
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
              <Label htmlFor="contact-email">{t("fields.email")}</Label>
              <Input
                id="contact-email"
                value={values.email}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, email: event.target.value }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">{t("fields.phone")}</Label>
              <Input
                id="contact-phone"
                value={values.phone}
                onChange={(event) =>
                  setValues((prev) => ({ ...prev, phone: event.target.value }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-linkedin">{t("fields.linkedin")}</Label>
              <Input
                id="contact-linkedin"
                value={values.linkedin}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    linkedin: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-instagram">{t("fields.instagram")}</Label>
              <Input
                id="contact-instagram"
                value={values.instagram}
                onChange={(event) =>
                  setValues((prev) => ({
                    ...prev,
                    instagram: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {t("save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
