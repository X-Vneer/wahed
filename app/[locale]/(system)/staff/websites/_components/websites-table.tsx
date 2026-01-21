"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import apiClient from "@/services"
import { useTranslations } from "next-intl"
import { useActionsColumn } from "./actions-column"
import { useWebsiteColumns } from "./columns"

type WebsitesTableProps = {
  onEdit: (website: WebsiteWithLocale) => void
}

export function WebsitesTable({ onEdit }: WebsitesTableProps) {
  const t = useTranslations()

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<WebsiteWithLocale>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/websites", {
      params: {
        q: search || undefined,
        status: status !== "all" ? status : undefined,
        page,
        per_page: perPage,
      },
    })

    // Transform the response to match TableQueryResponse format
    // Since the API returns an array, we need to handle pagination on the client
    // or update the API to return paginated response
    const data = response.data as WebsiteWithLocale[]
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

  const columns = useWebsiteColumns()
  const actionsColumn = useActionsColumn({
    onEdit,
  })

  const allColumns = [...columns, actionsColumn]

  // Status filter options
  const statusOptions = [
    { value: "active", label: t("websites.status.active") },
    { value: "inactive", label: t("websites.status.inactive") },
  ]

  return (
    <BaseTable<WebsiteWithLocale>
      columns={allColumns}
      queryKey={["websites"]}
      queryFn={queryFn}
      emptyMessage={t("websites.no_websites_found")}
      statuses={statusOptions}
    ></BaseTable>
  )
}
