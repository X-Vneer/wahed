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
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { PageSeoForm } from "../_components/page-seo-form"
import { CreateWebsiteProjectModal } from "./_components/create-website-project-modal"

type PublicProjectsResponse = {
  projects: TransformedPublicProject[]
}

export default function WebsiteProjectsPage() {
  const t = useTranslations("websiteCms.projects")
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

  const projects = data?.projects ?? []
  const visible = projects.filter((p) => p.isActive)
  const drafts = projects.filter((p) => !p.isActive)

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
