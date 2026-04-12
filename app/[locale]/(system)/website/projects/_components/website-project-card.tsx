/* eslint-disable @next/next/no-img-element -- CMS cover URLs are dynamic / arbitrary hosts */
"use client"

import { loginBg } from "@/assets"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Link } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import type { TransformedPublicProject } from "@/prisma/public-projects"
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ExternalLink,
  MapPin,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

type WebsiteProjectCardProps = {
  project: TransformedPublicProject
  className?: string
}

const statusConfig: Record<string, { key: string; className: string }> = {
  COMPLETED: {
    key: "completed",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  IN_PROGRESS: {
    key: "inProgress",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  PLANNING: {
    key: "planning",
    className: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  ON_HOLD: {
    key: "onHold",
    className: "bg-orange-100 text-orange-700 border-orange-200",
  },
  CANCELLED: {
    key: "cancelled",
    className: "bg-red-100 text-red-700 border-red-200",
  },
}

export function WebsiteProjectCard({
  project,
  className,
}: WebsiteProjectCardProps) {
  const t = useTranslations()
  const [isOpen, setIsOpen] = useState(false)

  const config = statusConfig[project.status] ?? statusConfig.PLANNING
  const statusLabel = t(`projects.status.${config.key}`)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="w-full">
        <Card
          className={cn(
            "shadow-none ring-0 max-md:py-4",
            !project.isActive &&
              "opacity-75 ring-1 ring-dashed ring-muted-foreground/20",
            className
          )}
        >
          <CardContent>
            <div className={cn("flex flex-col gap-4", "md:flex-row")}>
              {/* Cover image */}
              <div className="relative h-50 w-full shrink-0 overflow-hidden rounded-xl md:w-66">
                <img
                  src={project.images[0] || loginBg.src}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                {/* Visibility indicator overlay */}
                <div className="absolute start-2 top-2">
                  <Badge
                    variant={project.isActive ? "default" : "outline"}
                    className={cn(
                      "gap-1 shadow-sm backdrop-blur-sm",
                      !project.isActive && "bg-background/80"
                    )}
                  >
                    {project.isActive ? (
                      <Eye className="size-3" data-icon="inline-start" />
                    ) : (
                      <EyeOff className="size-3" data-icon="inline-start" />
                    )}
                    {project.isActive
                      ? t("websiteCms.projects.badge.onSite")
                      : t("websiteCms.projects.badge.draft")}
                  </Badge>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                {/* Top: badges row */}
                <div className="mb-2 flex flex-wrap items-center gap-2 lg:justify-end">
                  <Badge
                    className={cn(
                      "rounded-sm p-3 text-xs font-medium lg:px-5",
                      config.className
                    )}
                  >
                    {statusLabel}
                  </Badge>
                  {project.badges.map((badge) => (
                    <Badge
                      key={badge.id}
                      variant="outline"
                      className="rounded-sm p-3 text-xs font-medium lg:px-5"
                      style={{
                        backgroundColor: `${badge.color}15`,
                        color: badge.color,
                        borderColor: `${badge.color}40`,
                      }}
                    >
                      {badge.name}
                    </Badge>
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

                  {/* Description */}
                  {(project.shortDescription || project.description) && (
                    <p className="text-foreground line-clamp-2 font-medium">
                      {project.shortDescription || project.description}
                    </p>
                  )}

                  {/* Location and category */}
                  <div className="flex flex-wrap items-center gap-4">
                    {project.location && (
                      <div className="text-foreground flex items-center gap-2">
                        <MapPin className="size-4" />
                        <span>{project.location}</span>
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
                        <Building2 className="size-4" />
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
                        href={`/website/projects/${project.id}`}
                        className="flex items-center"
                      >
                        <Eye className="size-4" />
                        {t("websiteCms.projects.card.viewProject")}
                      </Link>
                    }
                  />

                  {project.features.length > 0 && (
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
                          {t("websiteCms.projects.card.features")}
                        </Button>
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collapsible features section */}
        {project.features.length > 0 && (
          <CollapsibleContent className="-mt-4 w-full rounded-t-none border-t">
            <Card className="rounded-t-none shadow-none ring-0">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {project.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center gap-3 rounded-lg bg-[#F7F7F7] px-3 py-2.5"
                    >
                      <span className="text-lg">{feature.icon}</span>
                      <div className="min-w-0">
                        <p className="text-muted-foreground truncate text-xs">
                          {feature.label}
                        </p>
                        <p className="text-foreground truncate text-sm font-medium">
                          {feature.value || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        )}
      </div>
    </Collapsible>
  )
}
