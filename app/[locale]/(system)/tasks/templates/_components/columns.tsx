"use client"

import { Badge } from "@/components/ui/badge"
import type { TaskTemplate } from "@/prisma/task-templates"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { useLocale, useTranslations } from "next-intl"

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "taskTemplate.form.priorityLow",
  MEDIUM: "taskTemplate.form.priorityMedium",
  HIGH: "taskTemplate.form.priorityHigh",
}

export function useTaskTemplateColumns(): ColumnDef<TaskTemplate>[] {
  const t = useTranslations()
  const locale = useLocale()

  return [
    {
      accessorKey: "title",
      header: t("taskTemplate.form.title"),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("title") as string}</span>
      ),
    },
    {
      accessorKey: "description",
      header: t("taskTemplate.form.description"),
      cell: ({ row }) => {
        const desc = row.getValue("description") as string | null
        if (!desc) return <span className="text-muted-foreground">—</span>
        return (
          <span className="max-w-[200px] truncate block" title={desc}>
            {desc}
          </span>
        )
      },
    },
    {
      accessorKey: "priority",
      header: t("taskTemplate.form.priority"),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string
        const labelKey = PRIORITY_LABELS[priority] ?? "taskTemplate.form.priorityMedium"
        return (
          <Badge variant="secondary" className="font-normal">
            {t(labelKey)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "estimatedWorkingDays",
      header: t("taskTemplate.form.estimatedWorkingDays"),
      cell: ({ row }) => {
        const days = row.getValue("estimatedWorkingDays") as number | null
        return (
          <span className="text-muted-foreground">
            {days != null ? `${days} ${locale === "ar" ? "أيام" : "days"}` : "—"}
          </span>
        )
      },
    },
    {
      accessorKey: "defaultStatus",
      header: t("taskTemplate.form.defaultStatus"),
      cell: ({ row }) => {
        const status = row.original.defaultStatus
        if (!status) return <span className="text-muted-foreground">—</span>
        const name = locale === "ar" ? status.nameAr : status.nameEn
        return <span>{name}</span>
      },
    },
    {
      accessorKey: "categories",
      header: t("taskTemplate.form.categories"),
      cell: ({ row }) => {
        const categories = row.original.categories ?? []
        const count = categories.length
        if (count === 0) return <span className="text-muted-foreground">—</span>
        const names = categories
          .map((c) => (locale === "ar" ? c.nameAr : c.nameEn))
          .join(", ")
        return (
          <span className="max-w-[180px] truncate block" title={names}>
            {count} {locale === "ar" ? "فئة" : "categories"}
          </span>
        )
      },
    },
    {
      accessorKey: "subItems",
      header: t("taskTemplate.form.subItems"),
      cell: ({ row }) => {
        const items = row.original.subItems ?? []
        return (
          <span className="text-muted-foreground">
            {items.length} {locale === "ar" ? "عنصر" : "items"}
          </span>
        )
      },
    },
    {
      accessorKey: "isActive",
      header: t("taskTemplate.form.isActive"),
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? t("table-status-filter.active") : t("table-status-filter.inactive")}
          </Badge>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: t("taskTemplate.form.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy")
      },
    },
  ]
}
