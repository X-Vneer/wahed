"use client"

import { WebsiteProjectCard } from "@/app/[locale]/(system)/website/projects/_components/website-project-card"
import PageLoader from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { TransformedPublicProject } from "@/prisma/public-projects"
import apiClient from "@/services"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { PageSeoForm } from "../_components/page-seo-form"
import { CreateWebsiteProjectModal } from "./_components/create-website-project-modal"
import {
  ProjectsHeroSectionForm,
  type ProjectsHeroSectionValues,
} from "./_components/projects-hero-section-form"
import {
  ProjectsIntroSectionForm,
  type ProjectsIntroSectionValues,
} from "./_components/projects-intro-section-form"

type PublicProjectsResponse = {
  projects: TransformedPublicProject[]
}

type BilingualProjectsContent = {
  ar?: {
    heroSection?: Record<string, unknown>
    introSection?: Record<string, unknown>
    cards?: unknown[]
  }
  en?: {
    heroSection?: Record<string, unknown>
    introSection?: Record<string, unknown>
    cards?: unknown[]
  }
}

type ProjectsEditorData = {
  heroSection: ProjectsHeroSectionValues
  introSection: ProjectsIntroSectionValues
  rawContent: BilingualProjectsContent
}

function extractProjectsEditorData(
  content: BilingualProjectsContent
): ProjectsEditorData {
  const getString = (value: unknown) =>
    typeof value === "string" ? value : ""

  return {
    heroSection: {
      backgroundImage: getString(content.ar?.heroSection?.backgroundImage),
      eyebrowTitleAr: getString(content.ar?.heroSection?.eyebrowTitle),
      eyebrowTitleEn: getString(content.en?.heroSection?.eyebrowTitle),
      titleAr: getString(content.ar?.heroSection?.title),
      titleEn: getString(content.en?.heroSection?.title),
    },
    introSection: {
      contentAr: getString(content.ar?.introSection?.content),
      contentEn: getString(content.en?.introSection?.content),
    },
    rawContent: content,
  }
}

export default function WebsiteProjectsPage() {
  const t = useTranslations("websiteCms.projects")
  const tCommon = useTranslations()
  const queryClient = useQueryClient()
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const { data, isLoading } = useQuery<PublicProjectsResponse, Error>({
    queryKey: ["website", "public-projects"],
    queryFn: async () => {
      const response = await apiClient.get<PublicProjectsResponse>(
        "/api/website/public-projects"
      )
      return response.data
    },
  })

  const {
    data: contentData,
    isLoading: isContentLoading,
    isError: isContentError,
  } = useQuery<ProjectsEditorData, Error>({
    queryKey: ["website-content", "projects", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get<{
        content: BilingualProjectsContent
      }>("/api/website/content/projects?scope=bilingual")
      return extractProjectsEditorData(response.data.content)
    },
  })

  const saveSection = async (section: {
    ar: Record<string, unknown>
    en: Record<string, unknown>
    key: "heroSection" | "introSection"
  }) => {
    const currentAr = contentData?.rawContent?.ar ?? {}
    const currentEn = contentData?.rawContent?.en ?? {}

    await apiClient.put("/api/website/content/projects?scope=bilingual", {
      ar: { ...currentAr, [section.key]: section.ar },
      en: { ...currentEn, [section.key]: section.en },
    })

    await queryClient.invalidateQueries({
      queryKey: ["website-content", "projects", "bilingual"],
    })
  }

  const handleHeroSubmit = async ({
    values,
  }: {
    values: ProjectsHeroSectionValues
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

  const handleIntroSubmit = async ({
    values,
  }: {
    values: ProjectsIntroSectionValues
  }) => {
    await saveSection({
      key: "introSection",
      ar: { content: values.contentAr },
      en: { content: values.contentEn },
    })
  }

  const projects = data?.projects ?? []
  const visible = projects.filter((p) => p.isActive)
  const drafts = projects.filter((p) => !p.isActive)

  if (isLoading || isContentLoading) {
    return <PageLoader />
  }

  if (isContentError) {
    return (
      <div className="text-destructive flex h-full items-center justify-center text-sm">
        {tCommon("errors.internal_server_error")}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="">
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <CardHeader className="w-full space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {t("title")}
            </CardTitle>
            <CardDescription className="text-muted-foreground max-w-xl text-sm">
              {t("description")}
            </CardDescription>
          </CardHeader>

          <Tooltip>
            <TooltipTrigger
              render={
                <span className="inline-flex sm:shrink-0">
                  <Button
                    type="button"
                    className="gap-2"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    <Plus className="size-4" aria-hidden />
                    {t("createModal.trigger")}
                  </Button>
                </span>
              }
            />
            <TooltipContent side="bottom">
              {t("createModal.triggerHint")}
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <ProjectsHeroSectionForm
        initialValues={contentData?.heroSection}
        onSubmit={handleHeroSubmit}
      />

      <ProjectsIntroSectionForm
        initialValues={contentData?.introSection}
        onSubmit={handleIntroSubmit}
      />

      <section className="space-y-3" aria-labelledby="projects-visible-heading">
        <div>
          <h2
            id="projects-visible-heading"
            className="text-lg font-medium tracking-tight"
          >
            {t("sections.visibleOnSite")}
          </h2>
          <p className="text-muted-foreground text-sm">
            {t("sections.visibleHint")}
          </p>
        </div>

        {visible.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                {t("empty.visible")}
              </CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <ul className="grid gap-4">
            {visible.map((project) => (
              <li key={project.id}>
                <WebsiteProjectCard project={project} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {drafts.length > 0 ? (
        <section
          className="space-y-3"
          aria-labelledby="projects-drafts-heading"
        >
          <div>
            <h2
              id="projects-drafts-heading"
              className="text-lg font-medium tracking-tight"
            >
              {t("sections.drafts")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("sections.draftsHint")}
            </p>
          </div>

          <ul className="grid gap-4">
            {drafts.map((project) => (
              <li key={project.id}>
                <WebsiteProjectCard project={project} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CreateWebsiteProjectModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />

      <PageSeoForm slug="projects" />
    </div>
  )
}
