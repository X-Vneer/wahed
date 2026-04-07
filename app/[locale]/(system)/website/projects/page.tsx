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
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { PageSeoForm } from "../_components/page-seo-form"

type ProjectCard = {
  title: string
  status: string
  description: string
  /** When false, the project is a draft and hidden on the public site. */
  published?: boolean
  /** Optional hero image for the project card. */
  coverImage?: string
}

type ProjectsContent = {
  cards: ProjectCard[]
}

function isPublished(card: ProjectCard) {
  return card.published !== false
}

export default function WebsiteProjectsPage() {
  const t = useTranslations("websiteCms.projects")
  const { data, isLoading } = useQuery<ProjectsContent, Error>({
    queryKey: ["website-content", "projects", "bilingual"],
    queryFn: async () => {
      const response = await apiClient.get<{ content: ProjectsContent }>(
        "/api/website/content/projects?scope=bilingual"
      )
      return response.data.content
    },
  })

  const cards = data?.cards ?? []
  const visible = cards.filter(isPublished)
  const drafts = cards.filter((c) => !isPublished(c))

  if (isLoading) {
    return <PageLoader />
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
                  <Button type="button" disabled className="gap-2">
                    <Plus className="size-4" aria-hidden />
                    {t("actions.publishProject")}
                  </Button>
                </span>
              }
            />
            <TooltipContent side="bottom">
              {t("actions.publishComingSoon")}
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

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
          <ul className="grid gap-4 lg:grid-cols-2">
            {visible.map((card, index) => (
              <li key={`${card.title}-${index}`} className="min-w-0">
                <WebsiteProjectCard
                  title={card.title}
                  description={card.description}
                  status={card.status}
                  variant="published"
                  stateBadgeLabel={t("badge.onSite")}
                  coverImage={card.coverImage}
                />
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

          <ul className="grid gap-4 lg:grid-cols-2">
            {drafts.map((card, index) => (
              <li key={`draft-${card.title}-${index}`} className="min-w-0">
                <WebsiteProjectCard
                  title={card.title}
                  description={card.description}
                  status={card.status}
                  variant="draft"
                  stateBadgeLabel={t("badge.draft")}
                  coverImage={card.coverImage}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <PageSeoForm slug="projects" />
    </div>
  )
}
