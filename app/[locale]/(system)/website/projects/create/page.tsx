"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { useProjects } from "@/hooks/use-projects"
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("createPage.title")}
          </CardTitle>
          <CardDescription>
            {t("createPage.description")}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-base">{t("createPage.sourceTitle")}</CardTitle>
          <CardDescription>
            {t("createPage.selectedOption")}{" "}
            <span className="font-medium">{sourceLabel}</span>
            {source === "existing" ? (
              <>
                {" "}
                -{" "}
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
          <CardDescription>
            {t("createPage.formDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="project-name">{t("createPage.fields.name")}</Label>
              <Input
                id="project-name"
                placeholder={t("createPage.placeholders.name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">
                {t("createPage.fields.description")}
              </Label>
              <Textarea
                id="project-description"
                placeholder={t("createPage.placeholders.description")}
                rows={5}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled>
                {t("createPage.actions.saveComingSoon")}
              </Button>
              <Button variant="outline" type="button" render={<Link href="/website/projects" />}>
                {t("createPage.actions.backToProjects")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
