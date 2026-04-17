/* eslint-disable @next/next/no-img-element -- CMS cover URLs are dynamic / arbitrary hosts */
"use client"

import { loginBg } from "@/assets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import type { TransformedPublicProject } from "@/prisma/public-projects"
import apiClient from "@/services"
import axios from "axios"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MapPin,
  Pencil,
  Search,
  Star,
  Trash2,
} from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

type WebsiteProjectCardProps = {
  project: TransformedPublicProject
  className?: string
}

const statusConfig: Record<
  string,
  { key: string; dot: string; bg: string; text: string; border: string }
> = {
  COMPLETED: {
    key: "completed",
    dot: "bg-purple-500",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  IN_PROGRESS: {
    key: "inProgress",
    dot: "bg-blue-500",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  PLANNING: {
    key: "planning",
    dot: "bg-yellow-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
  },
  ON_HOLD: {
    key: "onHold",
    dot: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  CANCELLED: {
    key: "cancelled",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
}

export function WebsiteProjectCard({
  project,
  className,
}: WebsiteProjectCardProps) {
  const t = useTranslations()
  const formatter = useFormatter()
  const [isOpen, setIsOpen] = useState(false)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const queryKey = ["website", "public-projects"]

  const config = statusConfig[project.status] ?? statusConfig.PLANNING
  const statusLabel = t(`projects.status.${config.key}`)

  const featuredMutation = useMutation({
    mutationFn: (isFeatured: boolean) =>
      apiClient.patch(
        `/api/website/public-projects/${project.id}/featured`,
        { isFeatured }
      ),
    onMutate: async (isFeatured) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<{
        projects: TransformedPublicProject[]
      }>(queryKey)

      queryClient.setQueryData<{ projects: TransformedPublicProject[] }>(
        queryKey,
        (old) =>
          old
            ? {
                projects: old.projects.map((p) =>
                  p.id === project.id ? { ...p, isFeatured } : p
                ),
              }
            : old
      )

      return { previous }
    },
    onError: (err, _isFeatured, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : t("errors.internal_server_error")
      toast.error(message)
    },
    onSuccess: (_data, isFeatured) => {
      toast.success(
        isFeatured
          ? t("websiteCms.projects.card.featuredSuccess")
          : t("websiteCms.projects.card.unfeaturedSuccess")
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const visibilityMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      apiClient.patch(
        `/api/website/public-projects/${project.id}/visibility`,
        { isActive }
      ),
    onMutate: async (isActive) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<{
        projects: TransformedPublicProject[]
      }>(queryKey)

      queryClient.setQueryData<{ projects: TransformedPublicProject[] }>(
        queryKey,
        (old) =>
          old
            ? {
                projects: old.projects.map((p) =>
                  p.id === project.id ? { ...p, isActive } : p
                ),
              }
            : old
      )

      return { previous }
    },
    onError: (_err, _isActive, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
      toast.error(t("errors.internal_server_error"))
    },
    onSuccess: (_data, isActive) => {
      toast.success(
        isActive
          ? t("websiteCms.projects.card.publishedSuccess")
          : t("websiteCms.projects.card.unpublishedSuccess")
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiClient.delete(`/api/website/public-projects/${project.id}`),
    onSuccess: () => {
      toast.success(t("websiteCms.projects.card.deleteSuccess"))
      queryClient.invalidateQueries({ queryKey })
    },
    onError: (err) => {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : t("websiteCms.projects.card.deleteError")
      toast.error(message)
    },
  })

  const hasDetails =
    project.features.length > 0 ||
    project.description ||
    project.area ||
    project.deedNumber ||
    project.startingPrice

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <Card
          className={cn(
            "shadow-none ring-0 max-md:py-4",
            !project.isActive &&
              "ring-dashed ring-muted-foreground/20 opacity-60 ring-1 hover:opacity-90",
            className
          )}
        >
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              {/* Cover image */}
              <div className="relative h-50 w-full shrink-0 overflow-hidden rounded-xl md:w-66">
                <img
                  src={project.images[0] || loginBg.src}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                {/* Top: status + visibility + badges */}
                <div className="mb-2 flex flex-wrap items-center gap-2 lg:justify-end">
                  {/* Status badge with dot indicator */}
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-6 gap-1.5 rounded-sm border px-3 py-2 text-xs font-medium",
                      config.bg,
                      config.text,
                      config.border
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        config.dot
                      )}
                    />
                    {statusLabel}
                  </Badge>

                  {/* Visibility toggle */}
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id={`visibility-${project.id}`}
                      checked={project.isActive}
                      onCheckedChange={(checked) =>
                        visibilityMutation.mutate(checked)
                      }
                      disabled={visibilityMutation.isPending}
                      className="scale-85"
                    />
                    <label
                      htmlFor={`visibility-${project.id}`}
                      className={cn(
                        "cursor-pointer text-xs font-medium",
                        project.isActive
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {project.isActive
                        ? t("websiteCms.projects.badge.onSite")
                        : t("websiteCms.projects.badge.draft")}
                    </label>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center gap-1.5">
                    <Switch
                      id={`featured-${project.id}`}
                      checked={project.isFeatured}
                      onCheckedChange={(checked) =>
                        featuredMutation.mutate(checked)
                      }
                      disabled={featuredMutation.isPending}
                      className="scale-85"
                    />
                    <label
                      htmlFor={`featured-${project.id}`}
                      className={cn(
                        "cursor-pointer text-xs font-medium",
                        project.isFeatured
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {project.isFeatured ? (
                        <span className="flex items-center gap-1">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {t("websiteCms.projects.badge.featured")}
                        </span>
                      ) : (
                        t("websiteCms.projects.badge.notFeatured")
                      )}
                    </label>
                  </div>

                  {/* Custom project badges */}
                  {project.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center rounded-sm border px-3 py-1.5 text-xs font-medium"
                      style={{
                        backgroundColor: `${badge.color}10`,
                        color: badge.color,
                        borderColor: `${badge.color}30`,
                      }}
                    >
                      {badge.name}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  {/* Title + area */}
                  <h3 className="text-foreground text-lg font-bold">
                    {project.title}
                    {project.area ? (
                      <>
                        {" . "}
                        <span className="text-muted-foreground text-sm font-normal">
                          {project.area} {t("projects.areaUnit")}
                        </span>
                      </>
                    ) : null}
                  </h3>

                  {/* Short description */}
                  {project.shortDescription && (
                    <p className="text-foreground line-clamp-2 font-medium">
                      {project.shortDescription}
                    </p>
                  )}

                  {/* Location and category */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {(project.cityName || project.location) && (
                      <div className="text-foreground flex items-center gap-2">
                        <MapPin className="size-4 shrink-0" />
                        <div className="flex items-center gap-1">
                          {project.regionName && (
                            <span>{project.regionName}</span>
                          )}
                          {project.regionName && project.cityName && (
                            <span>-</span>
                          )}
                          {project.cityName && <span>{project.cityName}</span>}
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
                    {project.category && (
                      <div className="text-foreground flex items-center gap-2">
                        <Building2 className="size-4 shrink-0" />
                        <span>{project.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm max-md:h-10 max-md:w-full"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/website/projects/${project.id}/edit`}
                        className="flex items-center"
                      >
                        <Pencil className="size-4" />
                        {t("websiteCms.projects.card.editProject")}
                      </Link>
                    }
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-sm max-md:h-10 max-md:w-full"
                    nativeButton={false}
                    render={
                      <Link
                        href={`/website/projects/${project.id}/seo`}
                        className="flex items-center"
                      >
                        <Search className="size-4" />
                        {t("websiteCms.projects.card.seo")}
                      </Link>
                    }
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 border-destructive/30 text-sm max-md:h-10 max-md:w-full"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="size-4" />
                    {t("websiteCms.projects.card.deleteProject")}
                  </Button>

                  {hasDetails && (
                    <CollapsibleTrigger
                      render={
                        <Button
                          variant="outline"
                          className="text-primary border-primary hover:text-primary bg-white max-md:h-10 max-md:w-full"
                          size="sm"
                        >
                          {isOpen ? (
                            <ChevronUp className="size-4" />
                          ) : (
                            <ChevronDown className="size-4" />
                          )}
                          {isOpen
                            ? t("websiteCms.projects.card.viewLess")
                            : t("websiteCms.projects.card.viewMore")}
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expanded details section */}
        {hasDetails && (
          <CollapsibleContent className="-mt-4 w-full rounded-t-none border-t">
            <Card className="rounded-t-none shadow-none ring-0">
              <CardContent className="space-y-4 pt-5">
                {/* Full description */}
                {project.description && (
                  <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                )}

                {/* Details — inline list */}
                {(project.area ||
                  project.deedNumber ||
                  project.startingPrice ||
                  project.location) && (
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                    {project.area && (
                      <span>
                        <span className="text-muted-foreground">
                          {t("websiteCms.projects.card.area")}:
                        </span>{" "}
                        <span className="font-medium">
                          {project.area} {t("projects.areaUnit")}
                        </span>
                      </span>
                    )}
                    {project.deedNumber && (
                      <span>
                        <span className="text-muted-foreground">
                          {t("websiteCms.projects.card.deedNumber")}:
                        </span>{" "}
                        <span className="font-medium">
                          {project.deedNumber}
                        </span>
                      </span>
                    )}
                    {project.startingPrice != null && (
                      <span>
                        <span className="text-muted-foreground">
                          {t("websiteCms.projects.card.priceRange")}:
                        </span>{" "}
                        <span className="font-medium">
                          {project.endingPrice != null
                            ? `${formatter.number(project.startingPrice)} - ${formatter.number(project.endingPrice)}`
                            : formatter.number(project.startingPrice)}
                        </span>
                      </span>
                    )}
                    {project.location && (
                      <span>
                        <span className="text-muted-foreground">
                          {t("websiteCms.projects.card.location")}:
                        </span>{" "}
                        <span className="font-medium">{project.location}</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Features */}
                {project.features.length > 0 && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {project.features.map((feature) => (
                        <div
                          key={feature.id}
                          className="bg-muted/40 flex items-center gap-2 rounded-md px-2.5 py-2"
                        >
                          <img
                            src={feature.icon}
                            alt=""
                            className="size-4 shrink-0 object-contain"
                          />
                          <span className="truncate text-xs">
                            <span className="text-muted-foreground">
                              {feature.label}
                            </span>
                            {feature.value && (
                              <span className="text-foreground font-medium">
                                {" "}
                                {feature.value}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("websiteCms.projects.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("websiteCms.projects.deleteConfirm.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {t("websiteCms.projects.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-white"
              onClick={() => {
                setDeleteDialogOpen(false)
                deleteMutation.mutate()
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending
                ? t("websiteCms.projects.deleteConfirm.deleting")
                : t("websiteCms.projects.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Collapsible>
  )
}
