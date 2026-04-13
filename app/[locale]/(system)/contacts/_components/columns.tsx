"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Contact } from "@/prisma/contacts"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

export const useContactColumns = () => {
  const t = useTranslations()

  const columns: ColumnDef<Contact>[] = [
    {
      accessorKey: "fullName",
      header: t("contacts.table.name"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {!row.original.isRead && (
            <span className="bg-primary size-2 rounded-full" />
          )}
          <span className={!row.original.isRead ? "font-semibold" : ""}>
            {row.original.fullName}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: t("contacts.table.email"),
    },
    {
      accessorKey: "phone",
      header: t("contacts.table.phone"),
    },
    {
      accessorKey: "message",
      header: t("contacts.table.message"),
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[300px]">
          {row.original.message}
        </span>
      ),
    },
    {
      accessorKey: "source",
      header: t("contacts.table.source"),
      cell: ({ row }) => (
        <Badge variant={row.original.source === "project" ? "outline" : "secondary"}>
          {row.original.source === "project"
            ? t("contacts.source.project")
            : t("contacts.source.general")}
        </Badge>
      ),
    },
    {
      accessorKey: "isRead",
      header: t("contacts.table.status"),
      cell: ({ row }) => (
        <Badge variant={row.original.isRead ? "secondary" : "default"}>
          {row.original.isRead
            ? t("contacts.status.read")
            : t("contacts.status.unread")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("contacts.table.createdAt"),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date
        return format(new Date(date), "MMM dd, yyyy HH:mm")
      },
    },
  ]

  return columns
}
