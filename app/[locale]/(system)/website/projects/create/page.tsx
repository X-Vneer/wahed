"use client"

import { CreatePublicProjectForm } from "../_components/create-public-project-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProjects } from "@/hooks/use-projects"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function CreateWebsiteProjectPage() {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const source = searchParams.get("source")
  const projectId = searchParams.get("projectId")
  const { data, isLoading } = useProjects(undefined, {
    enabled: source === "existing",
  })

  const sourceLabel =
    source === "existing"
      ? t("websiteCms.projects.createPage.sourceExisting")
      : t("websiteCms.projects.createPage.sourceEmpty")

  const selectedProject =
    source === "existing"
      ? (data?.projects ?? []).find((project) => project.id === projectId)
      : null

  const linkedProjectId = source === "existing" && projectId ? projectId : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("websiteCms.projects.createPage.title")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.createPage.description")}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">
            {t("websiteCms.projects.createPage.sourceTitle")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.createPage.selectedOption")}{" "}
            <span className="font-medium">{sourceLabel}</span>
            {source === "existing" ? (
              <>
                {" "}
                —{" "}
                {isLoading
                  ? t("common.loading")
                  : (selectedProject?.name ??
                    t("websiteCms.projects.createPage.projectNotFound"))}
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("websiteCms.projects.createPage.formTitle")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.createPage.formDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePublicProjectForm linkedProjectId={linkedProjectId} />
        </CardContent>
      </Card>
    </div>
  )
}
