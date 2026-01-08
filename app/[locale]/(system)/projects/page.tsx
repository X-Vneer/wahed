"use client"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"

const ProjectsPage = () => {
  const t = useTranslations()
  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("sidebar.projects")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("sidebar.projects")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Button
          render={
            <Link href="/projects/add">
              <Plus className="size-4" />
              {t("projects.addNew")}
            </Link>
          }
        />
      </div>
    </div>
  )
}

export default ProjectsPage
