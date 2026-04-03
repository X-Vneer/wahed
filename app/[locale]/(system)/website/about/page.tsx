"use client"

import PageLoader from "@/components/page-loader"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import apiClient from "@/services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import {
  AboutHeroSectionForm,
  AboutHeroSectionValues,
} from "../_components/about-hero-section-form"
import {
  AboutStorySectionForm,
  AboutStorySectionValues,
} from "../_components/about-story-section-form"
import {
  AboutVisionMissionSectionForm,
  AboutVisionMissionSectionValues,
} from "@/app/[locale]/(system)/website/_components/about-vision-mission-section-form"
import {
  AboutValuesSectionForm,
  AboutValuesSectionValues,
} from "@/app/[locale]/(system)/website/_components/about-values-section-form"
import {
  AboutBoardSectionForm,
  AboutBoardSectionValues,
} from "@/app/[locale]/(system)/website/_components/about-board-section-form"

type BilingualAboutContent = {
  ar?: {
    heroSection?: Record<string, unknown>
    storySection?: Record<string, unknown>
    visionMissionSection?: Record<string, unknown>
    valuesSection?: Record<string, unknown>
    boardSection?: Record<string, unknown>
  }
  en?: {
    heroSection?: Record<string, unknown>
    storySection?: Record<string, unknown>
    visionMissionSection?: Record<string, unknown>
    valuesSection?: Record<string, unknown>
    boardSection?: Record<string, unknown>
  }
}

type AboutEditorData = {
  heroSection: AboutHeroSectionValues
  storySection: AboutStorySectionValues
  visionMissionSection: AboutVisionMissionSectionValues
  valuesSection: AboutValuesSectionValues
  boardSection: AboutBoardSectionValues
  rawContent: BilingualAboutContent
}

function extractAboutEditorData(
  content: BilingualAboutContent
): AboutEditorData {
  const getString = (value: unknown) => (typeof value === "string" ? value : "")
  const getStringArray = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : []

  return {
    heroSection: {
      backgroundImage: getString(content.ar?.heroSection?.backgroundImage),
      eyebrowTitleAr: getString(content.ar?.heroSection?.eyebrowTitle),
      eyebrowTitleEn: getString(content.en?.heroSection?.eyebrowTitle),
      titleAr: getString(content.ar?.heroSection?.title),
      titleEn: getString(content.en?.heroSection?.title),
    },
    storySection: {
      eyebrowTitleAr: getString(content.ar?.storySection?.eyebrowTitle),
      eyebrowTitleEn: getString(content.en?.storySection?.eyebrowTitle),
      titleAr: getString(content.ar?.storySection?.title),
      titleEn: getString(content.en?.storySection?.title),
      contentAr: getString(content.ar?.storySection?.content),
      contentEn: getString(content.en?.storySection?.content),
    },
    visionMissionSection: {
      image: getString(content.ar?.visionMissionSection?.image),
      visionTitleAr: getString(content.ar?.visionMissionSection?.visionTitle),
      visionTitleEn: getString(content.en?.visionMissionSection?.visionTitle),
      visionContentAr: getString(
        content.ar?.visionMissionSection?.visionContent
      ),
      visionContentEn: getString(
        content.en?.visionMissionSection?.visionContent
      ),
      missionTitleAr: getString(content.ar?.visionMissionSection?.missionTitle),
      missionTitleEn: getString(content.en?.visionMissionSection?.missionTitle),
      missionContentAr: getString(
        content.ar?.visionMissionSection?.missionContent
      ),
      missionContentEn: getString(
        content.en?.visionMissionSection?.missionContent
      ),
    },
    valuesSection: {
      eyebrowTitleAr: getString(content.ar?.valuesSection?.eyebrowTitle),
      eyebrowTitleEn: getString(content.en?.valuesSection?.eyebrowTitle),
      titleAr: getString(content.ar?.valuesSection?.title),
      titleEn: getString(content.en?.valuesSection?.title),
      firstTitleAr: getString(content.ar?.valuesSection?.firstTitle),
      firstTitleEn: getString(content.en?.valuesSection?.firstTitle),
      firstContentAr: getString(content.ar?.valuesSection?.firstContent),
      firstContentEn: getString(content.en?.valuesSection?.firstContent),
      secondTitleAr: getString(content.ar?.valuesSection?.secondTitle),
      secondTitleEn: getString(content.en?.valuesSection?.secondTitle),
      secondContentAr: getString(content.ar?.valuesSection?.secondContent),
      secondContentEn: getString(content.en?.valuesSection?.secondContent),
      thirdTitleAr: getString(content.ar?.valuesSection?.thirdTitle),
      thirdTitleEn: getString(content.en?.valuesSection?.thirdTitle),
      thirdContentAr: getString(content.ar?.valuesSection?.thirdContent),
      thirdContentEn: getString(content.en?.valuesSection?.thirdContent),
    },
    boardSection: {
      eyebrowTitleAr: getString(content.ar?.boardSection?.eyebrowTitle),
      eyebrowTitleEn: getString(content.en?.boardSection?.eyebrowTitle),
      titleAr: getString(content.ar?.boardSection?.title),
      titleEn: getString(content.en?.boardSection?.title),
      members: getStringArray(content.ar?.boardSection?.members),
    },
    rawContent: content,
  }
}

export default function WebsiteAboutPage() {
  const tCommon = useTranslations()
  const t = useTranslations("websiteCms.about")
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery<AboutEditorData, Error>({
    queryKey: ["website-content", "about", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get<{ content: BilingualAboutContent }>(
        "/api/website/content/about?scope=bilingual"
      )
      const content = response.data.content
      return extractAboutEditorData(content)
    },
  })

  const saveSection = async (section: {
    ar: Record<string, unknown>
    en: Record<string, unknown>
    key:
      | "heroSection"
      | "storySection"
      | "visionMissionSection"
      | "valuesSection"
      | "boardSection"
  }) => {
    const currentAr = data?.rawContent?.ar ?? {}
    const currentEn = data?.rawContent?.en ?? {}

    await apiClient.put("/api/website/content/about?scope=bilingual", {
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
      queryKey: ["website-content", "about", "bilingual"],
    })
  }

  const handleHeroSectionSubmit = async ({
    values,
  }: {
    values: AboutHeroSectionValues
  }) => {
    await saveSection({
      key: "heroSection",
      ar: {
        backgroundImage: values.backgroundImage,
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
      },
      en: {
        backgroundImage: values.backgroundImage,
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
      },
    })
  }

  const handleStorySectionSubmit = async ({
    values,
  }: {
    values: AboutStorySectionValues
  }) => {
    await saveSection({
      key: "storySection",
      ar: {
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
        content: values.contentAr,
      },
      en: {
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
        content: values.contentEn,
      },
    })
  }

  const handleVisionMissionSectionSubmit = async ({
    values,
  }: {
    values: AboutVisionMissionSectionValues
  }) => {
    await saveSection({
      key: "visionMissionSection",
      ar: {
        image: values.image,
        visionTitle: values.visionTitleAr,
        visionContent: values.visionContentAr,
        missionTitle: values.missionTitleAr,
        missionContent: values.missionContentAr,
      },
      en: {
        image: values.image,
        visionTitle: values.visionTitleEn,
        visionContent: values.visionContentEn,
        missionTitle: values.missionTitleEn,
        missionContent: values.missionContentEn,
      },
    })
  }

  const handleValuesSectionSubmit = async ({
    values,
  }: {
    values: AboutValuesSectionValues
  }) => {
    await saveSection({
      key: "valuesSection",
      ar: {
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
        firstTitle: values.firstTitleAr,
        firstContent: values.firstContentAr,
        secondTitle: values.secondTitleAr,
        secondContent: values.secondContentAr,
        thirdTitle: values.thirdTitleAr,
        thirdContent: values.thirdContentAr,
      },
      en: {
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
        firstTitle: values.firstTitleEn,
        firstContent: values.firstContentEn,
        secondTitle: values.secondTitleEn,
        secondContent: values.secondContentEn,
        thirdTitle: values.thirdTitleEn,
        thirdContent: values.thirdContentEn,
      },
    })
  }

  const handleBoardSectionSubmit = async ({
    values,
  }: {
    values: AboutBoardSectionValues
  }) => {
    await saveSection({
      key: "boardSection",
      ar: {
        eyebrowTitle: values.eyebrowTitleAr,
        title: values.titleAr,
        members: values.members,
      },
      en: {
        eyebrowTitle: values.eyebrowTitleEn,
        title: values.titleEn,
        members: values.members,
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

      <AboutHeroSectionForm
        slug="about"
        initialValues={data?.heroSection}
        onSubmit={handleHeroSectionSubmit}
      />

      <AboutStorySectionForm
        slug="about"
        initialValues={data?.storySection}
        onSubmit={handleStorySectionSubmit}
      />

      <AboutVisionMissionSectionForm
        slug="about"
        initialValues={data?.visionMissionSection}
        onSubmit={handleVisionMissionSectionSubmit}
      />

      <AboutValuesSectionForm
        slug="about"
        initialValues={data?.valuesSection}
        onSubmit={handleValuesSectionSubmit}
      />

      <AboutBoardSectionForm
        slug="about"
        initialValues={data?.boardSection}
        onSubmit={handleBoardSectionSubmit}
      />
    </div>
  )
}
