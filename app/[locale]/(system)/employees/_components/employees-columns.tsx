"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { User } from "@/prisma/users/select"
import { useTranslations, useLocale } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"

type UpdateUserPayload = {
  id: string
  data: Partial<User>
}

export const useEmployeesColumns = () => {
  const t = useTranslations()
  const locale = useLocale()
  const queryClient = useQueryClient()

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: UpdateUserPayload) => {
      const response = await apiClient.put(`/api/users/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["employees"] })
    },
  })

  const columns: ColumnDef<User>[] = [
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

        return (
          <Switch
            checked={!!user.isActive}
            disabled={updateUserMutation.isPending}
            onCheckedChange={(checked) => {
              updateUserMutation.mutate({
                id: user.id,
                data: { isActive: checked },
              })
            }}
            aria-label={t("employees.table.activity")}
          />
        )
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

