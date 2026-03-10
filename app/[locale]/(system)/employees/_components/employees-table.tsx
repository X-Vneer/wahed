"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import type { User } from "@/prisma/users/select"
import apiClient from "@/services"
import { useTranslations } from "next-intl"
import { useEmployeesColumns } from "./employees-columns"
import { useEmployeesActionsColumn } from "./employees-actions-column"

type EmployeesTableProps = {
  onEdit: (user: User) => void
}

export function EmployeesTable({ onEdit }: EmployeesTableProps) {
  const t = useTranslations()

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<User>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get<User[]>("/api/users", {
      params: {
        q: search || undefined,
        status: status !== "all" ? status : undefined,
        page,
        per_page: perPage,
      },
    })

    const data = response.data as User[]
    const startIndex = (page - 1) * perPage
    const endIndex = startIndex + perPage
    const paginatedData = data.slice(startIndex, endIndex)

    return {
      data: paginatedData,
      from: startIndex + 1,
      to: Math.min(endIndex, data.length),
      total: data.length,
      per_page: perPage,
      current_page: page,
      last_page: Math.ceil(data.length / perPage),
    }
  }

  const columns = useEmployeesColumns()
  const actionsColumn = useEmployeesActionsColumn({
    onEdit,
  })

  const allColumns = [...columns, actionsColumn]

  const statusOptions = [
    { value: "active", label: t("employees.status.active") },
    { value: "inactive", label: t("employees.status.inactive") },
  ]

  return (
    <BaseTable<User>
      className="min-w-2xl"
      columns={allColumns}
      queryKey={["employees"]}
      queryFn={queryFn}
      emptyMessage={t("employees.no_employees_found")}
      statuses={statusOptions}
      statusFilterKey="status"
    />
  )
}
