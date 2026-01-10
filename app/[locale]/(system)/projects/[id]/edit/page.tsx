import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { EditProjectForm } from "../../_components/edit-project-form"
import { getTranslations } from "next-intl/server"
import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { projectInclude } from "@/prisma/projects"
import { hasPermission } from "@/utils/has-permission"
import { notFound } from "next/navigation"

type PageProps = {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function EditProjectPage({ params }: PageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale })

  // Check permission
  const permissionCheck = await hasPermission(
    PERMISSIONS_GROUPED.PROJECT.UPDATE
  )
  if (!permissionCheck.hasPermission) {
    notFound()
  }

  // Fetch project with all relations
  const project = await db.project.findUnique({
    where: { id },
    include: projectInclude,
  })

  if (!project) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("projects.edit")}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">
                {t("sidebar.projects")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${id}`}>
                {locale === "ar" ? project.nameAr : project.nameEn}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("projects.edit")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <EditProjectForm project={project} />
    </div>
  )
}
