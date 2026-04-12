"use client"

import { PublicProjectForm } from "../../_components/public-project-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PageLoader from "@/components/page-loader"
import type { PublicProjectEditData } from "@/prisma/public-projects"
import apiClient from "@/services"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

type PublicProjectResponse = {
  project: PublicProjectEditData
}

export default function EditWebsiteProjectPage() {
  const t = useTranslations()
  const params = useParams<{ id: string }>()

  const { data, isLoading, isError } = useQuery<PublicProjectResponse, Error>({
    queryKey: ["website", "public-projects", params.id],
    queryFn: async () => {
      const response = await apiClient.get<PublicProjectResponse>(
        `/api/website/public-projects/${params.id}`
      )
      return response.data
    },
    enabled: Boolean(params.id),
  })

  if (isLoading) {
    return <PageLoader />
  }

  if (isError || !data?.project) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("websiteCms.projects.editPage.notFound")}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("websiteCms.projects.editPage.title")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.editPage.description")}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("websiteCms.projects.editPage.formTitle")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.editPage.formDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PublicProjectForm mode="edit" initialData={data.project} />
        </CardContent>
      </Card>

    </div>
  )
}
