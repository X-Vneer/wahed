"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { City } from "@/prisma/cities"
import { useTranslations } from "next-intl"
import { format } from "date-fns"

export const useCityColumns = () => {
  const t = useTranslations()

  const columns: ColumnDef<City>[] = [
    {
      accessorKey: "name",
      header: t("cities.table.name"),
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: "nameAr",
      header: t("cities.table.nameAr"),
    },
    {
      accessorKey: "nameEn",
      header: t("cities.table.nameEn"),
    },
    {
      accessorKey: "regionName",
      header: t("cities.table.regionName"),
      cell: ({ row }) => row.original.regionName || "-",
    },
    {
      accessorKey: "createdAt",
      header: t("cities.table.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]

  return columns
}
