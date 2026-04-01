"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PageLoader from "@/components/page-loader"
import { HeroSectionValues } from "./_components/hero-section-form"
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { HeroSectionForm } from "./_components/hero-section-form"

export default function WebsiteHomePage() {
  const tCommon = useTranslations()
  const t = useTranslations("websiteCms.home")
  const {
    data: initialValues,
    isLoading,
    isError,
  } = useQuery<HeroSectionValues, Error>({
    queryKey: ["website-content", "home", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get("/api/website/content/home?scope=bilingual")
      const content = response.data.content as {
        ar?: { heroSection?: Record<string, string> }
        en?: { heroSection?: Record<string, string> }
      }

      return {
        backgroundImage: content.ar?.heroSection?.backgroundImage ?? "",
        titleAr: content.ar?.heroSection?.title ?? "",
        titleEn: content.en?.heroSection?.title ?? "",
        descriptionAr: content.ar?.heroSection?.description ?? "",
        descriptionEn: content.en?.heroSection?.description ?? "",
        ctaLabelAr: content.ar?.heroSection?.ctaLabel ?? "",
        ctaLabelEn: content.en?.heroSection?.ctaLabel ?? "",
      }
    },
  })

  const handleSubmit = async ({ values }: { values: HeroSectionValues }) => {
    await apiClient.put("/api/website/content/home?scope=bilingual", {
      ar: {
        heroSection: {
          title: values.titleAr,
          description: values.descriptionAr,
          ctaLabel: values.ctaLabelAr,
          backgroundImage: values.backgroundImage,
        },
      },
      en: {
        heroSection: {
          title: values.titleEn,
          description: values.descriptionEn,
          ctaLabel: values.ctaLabelEn,
          backgroundImage: values.backgroundImage,
        },
      },
    })
  }

  if (isLoading) {
    return <PageLoader />
  }

  if (isError) {
    return (
      <div className="text-destructive flex h-full items-center justify-center text-sm">
        {tCommon("errors.internal_server_error")}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-semibold tracking-tight lg:text-2xl">
            {t("title")}
          </CardTitle>

          <CardDescription className="text-muted-foreground text-sm">
            {t("description")}
          </CardDescription>
        </CardHeader>
      </Card>

      <HeroSectionForm
        slug="home"
        initialValues={initialValues}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
