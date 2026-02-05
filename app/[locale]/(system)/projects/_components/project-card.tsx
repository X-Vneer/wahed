/* eslint-disable @next/next/no-img-element */
"use client"

import { loginBg } from "@/assets"
import { AttachmentPreview } from "@/components/attachment-preview"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { TASK_STATUS_ID_IN_PROGRESS } from "@/config"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { type TransformedProject } from "@/prisma/projects"
import {
  Building2,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  MapPin,
} from "lucide-react"
import MiniTaskCard from "./mini-task-card"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"

function ProjectCard({ project }: { project: TransformedProject }) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  // Get status badge text and color
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      COMPLETED: {
        text: t("projects.status.completed"),
        className: "bg-purple-100 text-purple-700 border-purple-200",
      },
      IN_PROGRESS: {
        text: t("projects.status.inProgress"),
        className: "bg-blue-100 text-blue-700 border-blue-200",
      },
      PLANNING: {
        text: t("projects.status.planning"),
        className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      ON_HOLD: {
        text: t("projects.status.onHold"),
        className: "bg-orange-100 text-orange-700 border-orange-200",
      },
      CANCELLED: {
        text: t("projects.status.cancelled"),
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
  const projectType = project.categories?.[0] || t("projects.type.residential")

  // Get attachments (files)
  const attachments = project.attachments || []

  const taskCount = project.taskCount ?? 0
  const doneTaskCount = project.doneTaskCount ?? 0
  const remainingDays = project.remainingDays ?? 0
  const currentTask =
    project.tasks?.find(
      (task) => task.status.id === TASK_STATUS_ID_IN_PROGRESS
    ) ?? project.tasks?.find((task) => task.doneAt == null)
  const tasks = project.tasks

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <Card className="shadow-none ring-0 max-md:py-4">
          <CardContent>
            <div className={cn("flex flex-col gap-4", "md:flex-row")}>
              <div className="relative h-50 w-full shrink-0 overflow-hidden rounded-xl md:w-66">
                <img
                  src={project.image || loginBg.src}
                  alt={project.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                {/* Status Badges - Top Left */}
                <div className="mb-2 flex items-center gap-2 lg:justify-end">
                  <Badge
                    variant="outline"
                    className="rounded-sm py-3 text-xs font-medium text-gray-700 lg:px-5"
                  >
                    <Clock className="size-3" />
                    {t("projects.daysRemaining", { count: remainingDays })}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-sm py-3 text-xs font-medium text-gray-700 lg:px-5"
                  >
                    <CheckSquare className="size-3" />
                    {t("projects.stage", {
                      current: doneTaskCount,
                      total: taskCount,
                    })}
                  </Badge>
                  <Badge
                    className={cn(
                      "inline-b rounded-sm p-3 text-xs font-medium lg:px-5",
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
                      {project.area
                        ? `${project.area} ${t("projects.areaUnit")}`
                        : ""}
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
                            {t("projects.visitSite")}
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
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <MiniTaskCard task={currentTask ?? null} />
                  <div className="flex items-center gap-2 max-md:mt-2 max-md:w-full max-md:flex-col">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-sm max-md:h-10 max-md:w-full"
                      nativeButton={false}
                      render={
                        <Link
                          href={`/projects/${project.id}`}
                          className="flex items-center"
                        >
                          <Eye className="size-4" />
                          {t("projects.viewProject")}
                        </Link>
                      }
                    />
                    <CollapsibleTrigger
                      render={
                        <Button
                          variant="outline"
                          className="text-primary border-primary hover:text-primary bg-white max-md:h-10 max-md:w-full"
                          size={"sm"}
                        >
                          {isOpen ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                          {t("projects.quickAccess")}
                        </Button>
                      }
                    ></CollapsibleTrigger>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <CollapsibleContent className="-mt-4 w-full rounded-t-none border-t">
          <Card className="rounded-t-none shadow-none ring-0">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Tasks Column - Left */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="text-primary size-5" />
                    <h4 className="font-semibold">
                      {t("projects.sidebar.tasks")}
                    </h4>
                  </div>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {tasks.length > 0 ? (
                        tasks.map((task) => (
                          <MiniTaskCard key={task.id} task={task} />
                        ))
                      ) : (
                        <p className="text-muted-foreground py-4 text-center text-sm">
                          {t("projects.noTasks")}
                        </p>
                      )}
                    </div>{" "}
                  </ScrollArea>
                </div>

                {/* Files Column - Right */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="text-primary size-5" />
                    <h4 className="font-semibold">
                      {t("projects.sidebar.files")}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-2">
                    {attachments.length > 0 ? (
                      attachments.map((attachment) => (
                        <AttachmentPreview
                          key={attachment.id}
                          attachment={attachment}
                        />
                      ))
                    ) : (
                      <p className="text-muted-foreground py-4 text-center text-sm">
                        {t("projects.form.attachments.noFiles") ||
                          "No files attached"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
export default ProjectCard
