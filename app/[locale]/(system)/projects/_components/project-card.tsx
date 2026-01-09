/* eslint-disable @next/next/no-img-element */
import { type TransformedProject } from "@/prisma/projects"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/lib/i18n/navigation"
import {
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  ChevronDown,
  Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

function ProjectCard({ project }: { project: TransformedProject }) {
  const t = useTranslations("projects")

  // Get status badge text and color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      COMPLETED: {
        text: t("status.completed"),
        className: "bg-purple-100 text-purple-700 border-purple-200",
      },
      IN_PROGRESS: {
        text: t("status.inProgress"),
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      PLANNING: {
        text: t("status.planning"),
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      ON_HOLD: {
        text: t("status.onHold"),
        className: "bg-orange-100 text-orange-700 border-orange-200",
      },
      CANCELLED: {
        text: t("status.cancelled"),
        className: "bg-red-100 text-red-700 border-red-200",
      },
    }
    return (
      statusMap[status] || {
        text: status,
        className: "bg-gray-100 text-gray-700 border-gray-200",
      }
    )
  }

  const statusBadge = getStatusBadge(project.status)

  // Get project type (first category or default)
  const projectType = project.categories?.[0] || t("type.residential")

  return (
    <Card className="shadow-none ring-0">
      <CardContent>
        <div
          className={cn(
            "flex flex-col gap-4",
            project.image ? "md:flex-row" : ""
          )}
        >
          {project.image && (
            <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl md:w-64">
              <img
                src={project.image}
                alt={project.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col justify-between">
            {/* Status Badges - Top Left */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Badge
                variant="outline"
                className="rounded-sm px-5 py-3 text-xs font-medium text-gray-700"
              >
                <Clock className="size-3" />
                {t("daysRemaining", { count: 4 })}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-sm px-5 py-3 text-xs font-medium text-gray-700"
              >
                <Clock className="size-3" />
                {t("stage", { current: 5, total: 10 })}
              </Badge>
              <Badge
                className={cn(
                  "inline-b rounded-sm p-3 px-5 text-xs font-medium",
                  statusBadge.className
                )}
              >
                {statusBadge.text}
              </Badge>
            </div>

            <div className="space-y-2">
              {/* Project Title and Distance */}
              <h3 className="text-foreground text-lg font-bold">
                {project.name} .
                <span className="text-muted-foreground text-sm font-normal">
                  {project.area ? `${project.area} ${t("areaUnit")}` : ""}
                </span>
              </h3>

              {/* Description */}
              {project.description && (
                <p className="text-foreground line-clamp-2 font-medium">
                  {project.description}
                </p>
              )}

              {/* Location and Type */}
              <div className="flex flex-wrap items-center gap-4">
                {project.cityName && (
                  <div className="text-foreground flex items-center gap-2">
                    <MapPin className="size-4" />
                    <div className="flex gap-1">
                      <span>{project.regionName}</span>-
                      <span>{project.cityName}</span>
                    </div>
                    {project.googleMapsAddress && (
                      <Link
                        href={project.googleMapsAddress}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {t("visitSite")}
                      </Link>
                    )}
                  </div>
                )}
                <div className="text-foreground flex items-center gap-2">
                  <Building2 className="size-4" />
                  <span>{projectType}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
              <div className="flex items-center gap-2 rounded-lg border bg-gray-50 px-3 py-1.5 text-sm">
                <Clock className="text-muted-foreground size-4" />
                <span className="text-muted-foreground">
                  {t("daysRemaining", { count: 4 })}
                </span>
                <div className="ml-2 h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground text-xs">80%</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center"
                  >
                    <Eye className="size-4" />
                    {t("viewProject")}
                  </Link>
                }
              />
              <Button
                variant="outline"
                className="text-primary border-primary hover:text-primary bg-white"
                size={"sm"}
              >
                <ChevronDown className="size-4" />
                {t("quickAccess")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
export default ProjectCard
