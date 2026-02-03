"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Link } from "@/lib/i18n/navigation"
import { type TransformedProject } from "@/prisma/projects"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from "next-intl"

export function TaskProjectCard({ project }: { project: TransformedProject }) {
  const t = useTranslations("projects")

  return (
    <Card className="bg-card flex flex-col overflow-hidden rounded-xl border shadow-none ring-0">
      <CardContent className="flex flex-1 flex-col gap-3 px-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground text-lg font-bold">{project.name}</h3>
          {project.area && (
            <span className="text-muted-foreground shrink-0 text-sm">
              {project.area} {t("areaUnit")}
            </span>
          )}
        </div>
        {project.description && (
          <p className="text-foreground line-clamp-3 text-sm">
            {project.description}
          </p>
        )}
        <div className="mt-auto pt-2">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 hover:text-primary w-full"
            nativeButton={false}
            render={
              <Link
                href={`/tasks/${project.id}`}
                className="flex items-center justify-center gap-2"
              >
                {t("viewTasks")}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Link>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
