"use client"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PageLoader from "@/components/page-loader"
import { HeroSectionValues } from "./_components/hero-section-form"
import { BriefSectionValues } from "./_components/brief-section-form"
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { HeroSectionForm } from "./_components/hero-section-form"
import { BriefSectionForm } from "./_components/brief-section-form"

type BilingualHomeContent = {
  ar?: {
    heroSection?: Record<string, string>
    briefSection?: Record<string, string>
    aboutSection?: Record<string, string>
  }
  en?: {
    heroSection?: Record<string, string>
    briefSection?: Record<string, string>
    aboutSection?: Record<string, string>
  }
}

type HomeEditorData = {
  heroSection: HeroSectionValues
  briefSection: BriefSectionValues
  rawContent: BilingualHomeContent
}

function extractHomeEditorData(content: BilingualHomeContent): HomeEditorData {
  const arBrief = content.ar?.briefSection ?? content.ar?.aboutSection
  const enBrief = content.en?.briefSection ?? content.en?.aboutSection

  return {
    heroSection: {
      backgroundImage: content.ar?.heroSection?.backgroundImage ?? "",
      titleAr: content.ar?.heroSection?.title ?? "",
      titleEn: content.en?.heroSection?.title ?? "",
      descriptionAr: content.ar?.heroSection?.description ?? "",
      descriptionEn: content.en?.heroSection?.description ?? "",
      ctaLabelAr: content.ar?.heroSection?.ctaLabel ?? "",
      ctaLabelEn: content.en?.heroSection?.ctaLabel ?? "",
    },
    briefSection: {
      image: arBrief?.image ?? "",
      contentAr: arBrief?.content ?? "",
      contentEn: enBrief?.content ?? "",
    },
    rawContent: content,
  }
}

export default function WebsiteHomePage() {
  const tCommon = useTranslations()
  const t = useTranslations("websiteCms.home")
  const { data, isLoading, isError } = useQuery<HomeEditorData, Error>({
    queryKey: ["website-content", "home", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get<{ content: BilingualHomeContent }>(
        "/api/website/content/home?scope=bilingual"
      )
      const content = response.data.content
      return extractHomeEditorData(content)
    },
  })

  const saveSection = async (section: {
    ar: Record<string, string>
    en: Record<string, string>
    key: "heroSection" | "briefSection"
  }) => {
    const currentAr = data?.rawContent?.ar ?? {}
    const currentEn = data?.rawContent?.en ?? {}

    await apiClient.put("/api/website/content/home?scope=bilingual", {
      ar: {
        ...currentAr,
        [section.key]: section.ar,
      },
      en: {
        ...currentEn,
        [section.key]: section.en,
      },
    })
  }

  const handleHeroSectionSubmit = async ({
    values,
  }: {
    values: HeroSectionValues
  }) => {
    await saveSection({
      key: "heroSection",
      ar: {
        title: values.titleAr,
        description: values.descriptionAr,
        ctaLabel: values.ctaLabelAr,
        backgroundImage: values.backgroundImage,
      },
      en: {
        title: values.titleEn,
        description: values.descriptionEn,
        ctaLabel: values.ctaLabelEn,
        backgroundImage: values.backgroundImage,
      },
    })
  }

  const handleBriefSectionSubmit = async ({
    values,
  }: {
    values: BriefSectionValues
  }) => {
    await saveSection({
      key: "briefSection",
      ar: {
        image: values.image,
        content: values.contentAr,
      },
      en: {
        image: values.image,
        content: values.contentEn,
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
        initialValues={data?.heroSection}
        onSubmit={handleHeroSectionSubmit}
      />

      <BriefSectionForm
        slug="home"
        initialValues={data?.briefSection}
        onSubmit={handleBriefSectionSubmit}
      />
    </div>
  )
}
