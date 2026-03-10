"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/prisma/users/select"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ActivitySwitch } from "./activity-switch"

export const useEmployeesColumns = () => {
  const t = useTranslations()
  const locale = useLocale()

  const columns: ColumnDef<User>[] = [
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const user = row.original
        const nameInitial = user.name?.charAt(0).toUpperCase() ?? "?"

        return (
          <Avatar size="sm">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name ?? ""} />
            ) : null}
            <AvatarFallback>{nameInitial}</AvatarFallback>
          </Avatar>
        )
      },
    },
    {
      accessorKey: "name",
      header: t("employees.table.name"),
      cell: ({ row }) => row.original.name || "-",
    },
    {
      accessorKey: "email",
      header: t("employees.table.email"),
      cell: ({ row }) => row.original.email || "-",
    },
    {
      accessorKey: "phone",
      header: t("employees.table.phone"),
      cell: ({ row }) => row.original.phone || "-",
    },
    {
      accessorKey: "roleName",
      header: t("employees.table.roleName"),
      cell: ({ row }) => row.original.roleName || "-",
    },
    {
      accessorKey: "createdAt",
      header: t("employees.table.createdAt"),
      cell: ({ row }) => {
        const value = row.getValue("createdAt") as string | Date | undefined
        if (!value) return "-"
        const date = value instanceof Date ? value : new Date(value)
        return format(date, "PPP", {
          locale: locale === "ar" ? ar : enUS,
        })
      },
    },
    {
      id: "activity",
      header: t("employees.table.activity"),
      cell: ({ row }) => {
        const user = row.original
        return <ActivitySwitch userId={user.id} isActive={user.isActive} />
      },
    },
    {
      id: "status",
      header: t("employees.table.status"),
      cell: ({ row }) => {
        const user = row.original
        const status = user.isActive
          ? { label: t("employees.status.active"), variant: "default" as const }
          : {
              label: t("employees.status.inactive"),
              variant: "secondary" as const,
            }
        return <Badge variant={status.variant}>{status.label}</Badge>
      },
    },
  ]

  return columns
}
