"use client"

import { Badge } from "@/components/ui/badge"
import type { TaskCategory } from "@/prisma/task-categories"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

export function useTaskCategoryColumns(): ColumnDef<TaskCategory>[] {
  const t = useTranslations()

  return [
    {
      accessorKey: "nameAr",
      header: t("taskCategory.form.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("taskCategory.form.nameEn"),
    },
    {
      accessorKey: "isActive",
      header: t("taskCategory.form.isActive"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("taskCategory.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("taskCategory.form.updatedAt"),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
