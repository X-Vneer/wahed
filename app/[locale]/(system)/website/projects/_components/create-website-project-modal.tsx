"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProjects } from "@/hooks/use-projects"
import { useRouter } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import { ArrowLeft, FolderOpen, Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

type CreateWebsiteProjectModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = "source" | "existing"

export function CreateWebsiteProjectModal({
  open,
  onOpenChange,
}: CreateWebsiteProjectModalProps) {
  const t = useTranslations()
  const getStatusBadge = (status?: string | null) => {
    const fallback = t(
      "websiteCms.projects.createModal.existing.statusNotAvailable"
    )

    if (!status) {
      return {
        text: fallback,
        className: "bg-gray-100 text-gray-700 border-gray-200",
      }
    }

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

  const router = useRouter()
  const [step, setStep] = useState<Step>("source")
  const { data: projectsData, isLoading } = useProjects()

  const projects = projectsData?.projects ?? []

  const hasExistingProjects = projects.length
  const handleSelectEmpty = () => {
    onOpenChange(false)
    router.push("/website/projects/create?source=empty")
  }

  const handleSelectExisting = (projectId: string) => {
    onOpenChange(false)
    router.push(
      `/website/projects/create?source=existing&projectId=${projectId}`
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setStep("source")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-white sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {t("websiteCms.projects.createModal.title")}
          </DialogTitle>
          <DialogDescription>
            {step === "source"
              ? t("websiteCms.projects.createModal.descriptionSelectSource")
              : t("websiteCms.projects.createModal.descriptionSelectExisting")}
          </DialogDescription>
        </DialogHeader>

        {step === "source" ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSelectEmpty}
              className="cursor-pointer rounded-xl text-start outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <Card className="hover:border-primary/50 h-full border bg-white transition-colors hover:bg-white/60">
                <CardHeader className="gap-2">
                  <div className="text-primary">
                    <Plus className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">
                    {t("websiteCms.projects.createModal.empty.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("websiteCms.projects.createModal.empty.description")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>

            <button
              type="button"
              onClick={() => setStep("existing")}
              className={cn(
                "rounded-xl text-start outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2",
                !hasExistingProjects && "cursor-not-allowed opacity-60"
              )}
              disabled={!hasExistingProjects}
            >
              <Card className="hover:border-primary/50 h-full border bg-white transition-colors hover:bg-white/60">
                <CardHeader className="gap-2">
                  <div className="text-primary">
                    <FolderOpen className="size-5" aria-hidden />
                  </div>
                  <CardTitle className="text-base">
                    {t("websiteCms.projects.createModal.existing.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("websiteCms.projects.createModal.existing.description")}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {isLoading ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("common.loading")}
                  </CardTitle>
                </CardHeader>
              </Card>
            ) : null}

            {!isLoading && projects.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("websiteCms.projects.createModal.existing.emptyTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t(
                      "websiteCms.projects.createModal.existing.emptyDescription"
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : !isLoading ? (
              <ScrollArea className="h-[50svh]">
                {projects.map((project) => {
                  const statusBadge = getStatusBadge(project.status)

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelectExisting(project.id)}
                      className="mb-2 w-full cursor-pointer rounded-xl pe-4 text-start outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      <Card className="hover:border-primary/50 border transition-colors">
                        <CardHeader className="gap-1">
                          <CardTitle className="text-base">
                            {project.name}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {project.description ||
                              t(
                                "websiteCms.projects.createModal.existing.noDescription"
                              )}
                          </CardDescription>
                          <Badge
                            className={cn(
                              "w-fit rounded-sm px-3 py-1 text-xs font-medium",
                              statusBadge.className
                            )}
                          >
                            {statusBadge.text}
                          </Badge>
                        </CardHeader>
                      </Card>
                    </button>
                  )
                })}
              </ScrollArea>
            ) : null}
          </div>
        )}

        <DialogFooter>
          {step === "existing" ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("source")}
            >
              <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden />
              {t("websiteCms.projects.createModal.actions.back")}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleOpenChange(false)}
          >
            {t("common.cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
