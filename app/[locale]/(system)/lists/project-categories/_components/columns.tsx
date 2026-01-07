"use client"

import { Badge } from "@/components/ui/badge"
import type { ProjectCategory } from "@/prisma/project-categories"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

export function useProjectCategoryColumns(): ColumnDef<ProjectCategory>[] {
  const t = useTranslations()

  return [
    {
      accessorKey: "nameAr",
      header: t("projectCategories.form.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("projectCategories.form.nameEn"),
    },
    {
      accessorKey: "isActive",
      header: t("projectCategories.form.isActive"),
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
      header: t("projectCategories.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
    {
      accessorKey: "updatedAt",
      header: t("projectCategories.form.updatedAt"),
      cell: ({ row }) => {
        const date = row.getValue("updatedAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
