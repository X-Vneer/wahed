"use client"

import { PublicProjectSeoForm } from "../../_components/public-project-seo-form"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function PublicProjectSeoPage() {
  const t = useTranslations()
  const params = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            {t("websiteCms.projects.seoPage.title")}
          </CardTitle>
          <CardDescription>
            {t("websiteCms.projects.seoPage.description")}
          </CardDescription>
        </CardHeader>
      </Card>

      <PublicProjectSeoForm projectId={params.id} />
    </div>
  )
}
