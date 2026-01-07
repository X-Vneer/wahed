"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Region } from "@/prisma/regions"
import { useTranslations } from "next-intl"
import { format } from "date-fns"

export const useRegionColumns = () => {
  const t = useTranslations()

  const columns: ColumnDef<Region>[] = [
    {
      accessorKey: "name",
      header: t("regions.table.name"),
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "nameAr",
      header: t("regions.table.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("regions.table.nameEn"),
    },
    {
      accessorKey: "citiesCount",
      header: t("regions.table.citiesCount"),
      cell: ({ row }) => row.original.citiesCount,
    },
    {
      accessorKey: "createdAt",
      header: t("regions.table.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]

  return columns
}
