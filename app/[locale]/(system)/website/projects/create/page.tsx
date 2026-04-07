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
  const t = useTranslations("websiteCms.projects")
  const tCommon = useTranslations()
  const searchParams = useSearchParams()
  const source = searchParams.get("source")
  const projectId = searchParams.get("projectId")
  const { data, isLoading } = useProjects(undefined, {
    enabled: source === "existing",
  })

  const sourceLabel =
    source === "existing"
      ? t("createPage.sourceExisting")
      : t("createPage.sourceEmpty")

  const selectedProject =
    source === "existing"
      ? (data?.projects ?? []).find((project) => project.id === projectId)
      : null

  const linkedProjectId =
    source === "existing" && projectId ? projectId : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("createPage.title")}
          </CardTitle>
          <CardDescription>{t("createPage.description")}</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">
            {t("createPage.sourceTitle")}
          </CardTitle>
          <CardDescription>
            {t("createPage.selectedOption")}{" "}
            <span className="font-medium">{sourceLabel}</span>
            {source === "existing" ? (
              <>
                {" "}
                —{" "}
                {isLoading
                  ? tCommon("common.loading")
                  : selectedProject?.name ?? t("createPage.projectNotFound")}
              </>
            ) : null}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("createPage.formTitle")}</CardTitle>
          <CardDescription>{t("createPage.formDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <CreatePublicProjectForm linkedProjectId={linkedProjectId} />
        </CardContent>
      </Card>
    </div>
  )
}
