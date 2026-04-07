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
  ContactHeroInfoSectionForm,
  ContactHeroInfoSectionValues,
} from "./_components/contact-hero-info-section-form"
import { PageSeoForm } from "../_components/page-seo-form"

type BilingualContactContent = {
  ar?: Record<string, unknown>
  en?: Record<string, unknown>
}

type ContactEditorData = {
  heroInfoSection: ContactHeroInfoSectionValues
  rawContent: BilingualContactContent
}

function getString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function extractContactEditorData(
  content: BilingualContactContent
): ContactEditorData {
  const ar = content.ar ?? {}
  const en = content.en ?? {}
  const arHero = ar.heroSection as Record<string, unknown> | undefined
  const enHero = en.heroSection as Record<string, unknown> | undefined
  const arInfo = ar.infoSection as Record<string, unknown> | undefined
  const enInfo = en.infoSection as Record<string, unknown> | undefined

  const phone =
    getString(arInfo?.phone) || getString(ar.phone) || getString(enInfo?.phone)
  const email =
    getString(arInfo?.email) || getString(ar.email) || getString(enInfo?.email)
  const linkedin =
    getString(arInfo?.linkedin) ||
    getString(ar.linkedin) ||
    getString(enInfo?.linkedin)
  const instagram =
    getString(arInfo?.instagram) ||
    getString(ar.instagram) ||
    getString(enInfo?.instagram)

  return {
    heroInfoSection: {
      eyebrowTitleAr: getString(arHero?.eyebrowTitle),
      eyebrowTitleEn: getString(enHero?.eyebrowTitle),
      heroTitleAr: getString(arHero?.title),
      heroTitleEn: getString(enHero?.title),
      infoTitleAr: getString(arInfo?.title),
      infoTitleEn: getString(enInfo?.title),
      infoContentAr: getString(arInfo?.content),
      infoContentEn: getString(enInfo?.content),
      channelsTitleAr: getString(arInfo?.channelsTitle),
      channelsTitleEn: getString(enInfo?.channelsTitle),
      phone,
      email,
      linkedin,
      instagram,
    },
    rawContent: content,
  }
}

export default function WebsiteContactPage() {
  const tCommon = useTranslations()
  const t = useTranslations("websiteCms.contact")
  const queryClient = useQueryClient()
  const { data, isLoading, isError } = useQuery<ContactEditorData, Error>({
    queryKey: ["website-content", "contact", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get<{
        content: BilingualContactContent
      }>("/api/website/content/contact?scope=bilingual")
      const content = response.data.content
      return extractContactEditorData(content)
    },
  })

  const handleHeroInfoSubmit = async ({
    values,
  }: {
    slug: string
    values: ContactHeroInfoSectionValues
  }) => {
    const currentAr = { ...(data?.rawContent?.ar ?? {}) }
    const currentEn = { ...(data?.rawContent?.en ?? {}) }

    for (const key of ["email", "phone", "linkedin", "instagram"] as const) {
      delete currentAr[key]
      delete currentEn[key]
    }

    const shared = {
      phone: values.phone,
      email: values.email,
      linkedin: values.linkedin,
      instagram: values.instagram,
    }

    await apiClient.put("/api/website/content/contact?scope=bilingual", {
      ar: {
        ...currentAr,
        heroSection: {
          eyebrowTitle: values.eyebrowTitleAr,
          title: values.heroTitleAr,
        },
        infoSection: {
          title: values.infoTitleAr,
          content: values.infoContentAr,
          channelsTitle: values.channelsTitleAr,
          ...shared,
        },
      },
      en: {
        ...currentEn,
        heroSection: {
          eyebrowTitle: values.eyebrowTitleEn,
          title: values.heroTitleEn,
        },
        infoSection: {
          title: values.infoTitleEn,
          content: values.infoContentEn,
          channelsTitle: values.channelsTitleEn,
          ...shared,
        },
      },
    })

    await queryClient.invalidateQueries({
      queryKey: ["website-content", "contact", "bilingual"],
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

      <ContactHeroInfoSectionForm
        slug="contact"
        initialValues={data?.heroInfoSection}
        onSubmit={handleHeroInfoSubmit}
      />

      <PageSeoForm slug="contact" />
    </div>
  )
}
