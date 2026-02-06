/* eslint-disable @next/next/no-img-element */
import { loginBg } from "@/assets"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PERMISSIONS_GROUPED } from "@/config"
import db from "@/lib/db"
import { Link } from "@/lib/i18n/navigation"
import { projectInclude, transformProject } from "@/prisma/projects"
import { hasPermission } from "@/utils/has-permission"
import {
  Building2,
  Clock,
  ExternalLink,
  Grid2X2Check,
  MapPin,
  Ruler,
} from "lucide-react"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { EditProjectLink } from "../_components/edit-project-link"
import MiniTaskCard from "../_components/mini-task-card"
import { ArchiveButton } from "./_components/archive-button"
import { DeleteButton } from "./_components/delete-button"
import { ProjectAttachments } from "./_components/project-attachments"

type PageProps = {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { id, locale } = await params
  const t = await getTranslations({ locale })

  // Check permission
  const permissionCheck = await hasPermission(PERMISSIONS_GROUPED.PROJECT.VIEW)
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

  // Transform project for display
  const transformedProject = transformProject(project, locale)

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("sidebar.view-project")}</h1>
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
                <BreadcrumbPage>{transformedProject.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex grow justify-end gap-2">
          <ArchiveButton isArchived={!!transformedProject.archivedAt} />
          <EditProjectLink />
          <DeleteButton />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex grow flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-3">
              {/* Header - Project Name */}
              <h1 className="text-2xl font-bold">{transformedProject.name}</h1>

              {/* Main Image */}
              <div className="relative h-[300px] w-full overflow-hidden rounded-lg">
                <img
                  src={transformedProject.image || loginBg.src}
                  alt={transformedProject.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Description */}
              {transformedProject.description && (
                <div className="text-muted-foreground text-sm leading-relaxed">
                  {transformedProject.description}
                </div>
              )}

              {/* Project Details - Two Column Layout */}
              <div className="grid grid-cols-1 gap-6 font-medium text-[#141414] md:grid-cols-2">
                {/* Right Column */}
                <div className="space-y-5">
                  {/* Location */}
                  {(transformedProject.cityName ||
                    transformedProject.regionName) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="size-5" />
                      <div className="min-w-0 flex-1">
                        <span className="">
                          {transformedProject.regionName && (
                            <span>{transformedProject.regionName}</span>
                          )}
                          {transformedProject.regionName &&
                            transformedProject.cityName && (
                              <span>{t("projects.locationSeparator")}</span>
                            )}
                          {transformedProject.cityName && (
                            <span>{transformedProject.cityName}</span>
                          )}
                        </span>{" "}
                        {transformedProject.googleMapsAddress && (
                          <Link
                            href={transformedProject.googleMapsAddress}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary ml-2 inline-flex items-center gap-1 text-sm hover:underline"
                          >
                            {t("projects.visitSite")}
                            <ExternalLink className="size-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Area */}
                  {transformedProject.area && (
                    <div className="flex items-center gap-3">
                      <Ruler className="size-5" />
                      <span className="">
                        {transformedProject.area} {t("projects.areaUnit")}
                      </span>
                    </div>
                  )}

                  {/* Work Duration */}
                  {transformedProject.workDuration && (
                    <div className="flex items-center gap-3">
                      <Clock className="size-5" />
                      <span className="">
                        {transformedProject.workDuration}{" "}
                        {t("projects.workDurationUnit")}
                      </span>
                    </div>
                  )}
                </div>

                {/* Left Column */}
                <div className="space-y-5">
                  {/* Type (Categories) */}
                  {transformedProject.categories &&
                    transformedProject.categories.length > 0 && (
                      <div className="flex items-center gap-3">
                        <Grid2X2Check className="size-5" />
                        <span className="">
                          {transformedProject.categories
                            .map((category) => category)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                  {/* Number of Floors */}
                  {transformedProject.numberOfFloors && (
                    <div className="flex items-center gap-3">
                      <Building2 className="size-5 shrink-0" />
                      <span className="">
                        {t("projects.numberOfFloorsLabel", {
                          count: transformedProject.numberOfFloors,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Fields Section */}
          {transformedProject.additionalData &&
            transformedProject.additionalData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    {t("projects.form.additionalFields.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    {transformedProject.additionalData.map((field) => {
                      const value = field.value as unknown

                      if (
                        value === null ||
                        value === undefined ||
                        (typeof value === "string" && value.trim() === "") ||
                        (Array.isArray(value) && value.length === 0)
                      ) {
                        return null
                      }

                      let displayValue: string

                      if (Array.isArray(value)) {
                        displayValue = value.join(", ")
                      } else if (typeof value === "object") {
                        displayValue =
                          // Try to stringify objects safely
                          (value as { toString?: () => string }).toString?.() ??
                          JSON.stringify(value)
                      } else {
                        displayValue = String(value)
                      }

                      return (
                        <div
                          key={field.id ?? field.name}
                          className="flex flex-col items-start gap-4"
                        >
                          <dt className="text-muted-foreground text-sm font-medium">
                            {field.name}
                            {field.required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </dt>
                          <dd className="text-right text-sm">{displayValue}</dd>
                        </div>
                      )
                    })}
                  </dl>
                </CardContent>
              </Card>
            )}

          {/* Attachments Section */}
          <ProjectAttachments
            projectId={id}
            initialAttachments={transformedProject.attachments || []}
          />
        </div>
        <div className="flex flex-col gap-3 lg:w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {t("sidebar.tasks")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {transformedProject.tasks &&
                transformedProject.tasks.length > 0 ? (
                  transformedProject.tasks.map((task) => (
                    <MiniTaskCard key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    {t("projects.noCurrentTask")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
