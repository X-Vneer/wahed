/* eslint-disable @next/next/no-img-element */
"use client"

import { Spinner } from "@/components/ui/spinner"
import { useProjects } from "@/hooks/use-projects"
import { useTranslations } from "next-intl"
import ProjectCard from "./project-card"

export function ListProjects() {
  const t = useTranslations("projects")
  const { data, isLoading, error } = useProjects()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive text-sm">
          {t("errors.failedToLoad") || "Failed to load projects"}
        </p>
      </div>
    )
  }

  const projects = data?.projects || []

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground text-sm">
          {t("noProjects") || "No projects found"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
