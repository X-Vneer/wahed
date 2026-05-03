"use client"

import type { PublicProjectStatus } from "@/prisma/public-project-statuses"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

export function usePublicProjectStatusColumns(): ColumnDef<PublicProjectStatus>[] {
  const t = useTranslations()

  return [
    {
      accessorKey: "isSystem",
      header: t("publicProjectStatus.form.type"),
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
              ? t("publicProjectStatus.type.system")
              : t("publicProjectStatus.type.custom")}
          </span>
        )
      },
    },
    {
      accessorKey: "nameAr",
      header: t("publicProjectStatus.form.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("publicProjectStatus.form.nameEn"),
    },
    {
      accessorKey: "color",
      header: t("publicProjectStatus.form.color"),
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
      header: t("publicProjectStatus.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("publicProjectStatus.form.updatedAt"),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
