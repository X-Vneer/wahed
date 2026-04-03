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
import { AboutSectionValues } from "./_components/about-section-form"
import {
  ContactSectionForm,
  ContactSectionValues,
} from "./_components/contact-section-form"
import {
  PartnersSectionForm,
  PartnersSectionValues,
} from "./_components/partners-section-form"
import apiClient from "@/services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { HeroSectionForm } from "./_components/hero-section-form"
import { BriefSectionForm } from "./_components/brief-section-form"
import { AboutSectionForm } from "./_components/about-section-form"

type BilingualHomeContent = {
  ar?: {
    heroSection?: Record<string, unknown>
    briefSection?: Record<string, unknown>
    aboutSection?: Record<string, unknown>
    partnersSection?: Record<string, unknown>
    contactSection?: Record<string, unknown>
    ctaSection?: Record<string, unknown>
  }
  en?: {
    heroSection?: Record<string, unknown>
    briefSection?: Record<string, unknown>
    aboutSection?: Record<string, unknown>
    partnersSection?: Record<string, unknown>
    contactSection?: Record<string, unknown>
    ctaSection?: Record<string, unknown>
  }
}

type HomeEditorData = {
  heroSection: HeroSectionValues
  briefSection: BriefSectionValues
  aboutSection: AboutSectionValues
  partnersSection: PartnersSectionValues
  contactSection: ContactSectionValues
  rawContent: BilingualHomeContent
}

function extractHomeEditorData(content: BilingualHomeContent): HomeEditorData {
  const getString = (value: unknown) => (typeof value === "string" ? value : "")
  const getStringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : []

  const arBrief = content.ar?.briefSection ?? content.ar?.aboutSection
  const enBrief = content.en?.briefSection ?? content.en?.aboutSection
  const arPartners = content.ar?.partnersSection
  const enPartners = content.en?.partnersSection
  const arContact = content.ar?.contactSection ?? content.ar?.ctaSection
  const enContact = content.en?.contactSection ?? content.en?.ctaSection

  return {
    heroSection: {
      backgroundImage: getString(content.ar?.heroSection?.backgroundImage),
      titleAr: getString(content.ar?.heroSection?.title),
      titleEn: getString(content.en?.heroSection?.title),
      descriptionAr: getString(content.ar?.heroSection?.description),
      descriptionEn: getString(content.en?.heroSection?.description),
      ctaLabelAr: getString(content.ar?.heroSection?.ctaLabel),
      ctaLabelEn: getString(content.en?.heroSection?.ctaLabel),
    },
    briefSection: {
      image: getString(arBrief?.image),
      contentAr: getString(arBrief?.content),
      contentEn: getString(enBrief?.content),
    },
    aboutSection: {
      image: getString(content.ar?.aboutSection?.image),
      titlePartOneAr: getString(content.ar?.aboutSection?.titlePartOne),
      titlePartOneEn: getString(content.en?.aboutSection?.titlePartOne),
      titlePartTwoAr: getString(content.ar?.aboutSection?.titlePartTwo),
      titlePartTwoEn: getString(content.en?.aboutSection?.titlePartTwo),
      descriptionAr: getString(content.ar?.aboutSection?.description),
      descriptionEn: getString(content.en?.aboutSection?.description),
      ctaLabelAr: getString(content.ar?.aboutSection?.ctaLabel),
      ctaLabelEn: getString(content.en?.aboutSection?.ctaLabel),
    },
    partnersSection: {
      logos: getStringArray(arPartners?.logos),
      eyebrowTitleAr: getString(arPartners?.eyebrowTitle),
      eyebrowTitleEn: getString(enPartners?.eyebrowTitle),
      titleAr: getString(arPartners?.title),
      titleEn: getString(enPartners?.title),
      contentAr: getString(arPartners?.content ?? arPartners?.description),
      contentEn: getString(enPartners?.content ?? enPartners?.description),
    },
    contactSection: {
      eyebrowTitleAr: getString(arContact?.eyebrowTitle),
      eyebrowTitleEn: getString(enContact?.eyebrowTitle),
      titleAr: getString(arContact?.title),
      titleEn: getString(enContact?.title),
      contentAr: getString(arContact?.content ?? arContact?.description),
      contentEn: getString(enContact?.content ?? enContact?.description),
      ctaLabelAr: getString(arContact?.ctaLabel),
      ctaLabelEn: getString(enContact?.ctaLabel),
    },
    rawContent: content,
  }
}

export default function WebsiteHomePage() {
  const tCommon = useTranslations()
  const t = useTranslations("websiteCms.home")
  const queryClient = useQueryClient()
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
    ar: Record<string, unknown>
    en: Record<string, unknown>
    key:
      | "heroSection"
      | "briefSection"
      | "aboutSection"
      | "partnersSection"
      | "contactSection"
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

    await queryClient.invalidateQueries({
      queryKey: ["website-content", "home", "bilingual"],
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

  const handleAboutSectionSubmit = async ({
    values,
  }: {
    values: AboutSectionValues
  }) => {
    await saveSection({
      key: "aboutSection",
      ar: {
        image: values.image,
        titlePartOne: values.titlePartOneAr,
        titlePartTwo: values.titlePartTwoAr,
        description: values.descriptionAr,
        ctaLabel: values.ctaLabelAr,
      },
      en: {
        image: values.image,
        titlePartOne: values.titlePartOneEn,
        titlePartTwo: values.titlePartTwoEn,
        description: values.descriptionEn,
        ctaLabel: values.ctaLabelEn,
      },
    })
  }

  const handlePartnersSectionSubmit = async ({
    values,
  }: {
    values: PartnersSectionValues
  }) => {
    await saveSection({
      key: "partnersSection",
      ar: {
        logos: values.logos,
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
        content: values.contentAr,
        description: values.contentAr,
      },
      en: {
        logos: values.logos,
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
        content: values.contentEn,
        description: values.contentEn,
      },
    })
  }

  const handleContactSectionSubmit = async ({
    values,
  }: {
    values: ContactSectionValues
  }) => {
    await saveSection({
      key: "contactSection",
      ar: {
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
        content: values.contentAr,
        description: values.contentAr,
        ctaLabel: values.ctaLabelAr,
      },
      en: {
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
        content: values.contentEn,
        description: values.contentEn,
        ctaLabel: values.ctaLabelEn,
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

      <AboutSectionForm
        slug="home"
        initialValues={data?.aboutSection}
        onSubmit={handleAboutSectionSubmit}
      />

      <PartnersSectionForm
        slug="home"
        initialValues={data?.partnersSection}
        onSubmit={handlePartnersSectionSubmit}
      />

      <ContactSectionForm
        slug="home"
        initialValues={data?.contactSection}
        onSubmit={handleContactSectionSubmit}
      />
    </div>
  )
}
