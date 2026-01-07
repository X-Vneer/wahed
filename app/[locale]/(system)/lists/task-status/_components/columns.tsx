"use client"

import type { TaskStatus } from "@/prisma/task-statuses"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

export function useTaskStatusColumns(): ColumnDef<TaskStatus>[] {
  const t = useTranslations()

  return [
    {
      accessorKey: "nameAr",
      header: t("taskStatus.form.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("taskStatus.form.nameEn"),
    },
    {
      accessorKey: "color",
      header: t("taskStatus.form.color"),
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
      header: t("taskStatus.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("taskStatus.form.updatedAt"),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
