"use client"

import type { ProjectStatus } from "@/prisma/project-statuses"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

export function useProjectStatusColumns(): ColumnDef<ProjectStatus>[] {
  const t = useTranslations()

  return [
    {
      accessorKey: "isSystem",
      header: t("projectStatus.form.type"),
      cell: ({ row }) => {
        const isSystem = row.getValue("isSystem") as boolean
        return (
          <span
            className={
              isSystem
                ? "rounded bg-muted px-2 py-0.5 text-xs font-medium"
                : "rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            }
          >
            {isSystem
              ? t("projectStatus.type.system")
              : t("projectStatus.type.custom")}
          </span>
        )
      },
    },
    {
      accessorKey: "nameAr",
      header: t("projectStatus.form.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("projectStatus.form.nameEn"),
    },
    {
      accessorKey: "color",
      header: t("projectStatus.form.color"),
      cell: ({ row }) => {
        const color = row.getValue("color") as string
        return (
          <div className="flex items-center gap-2">
            <div
              className="h-6 w-6 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="font-mono text-sm">{color}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("projectStatus.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("projectStatus.form.updatedAt"),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
