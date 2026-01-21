"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import type { BannerInclude } from "@/prisma/banners"
import apiClient from "@/services"
import { useTranslations } from "next-intl"
import { useActionsColumn } from "./actions-column"
import { useBannerColumns } from "./columns"
import { useRouter } from "@/lib/i18n/navigation"

export function BannersTable() {
  const t = useTranslations()
  const router = useRouter()

  const handleEditClick = (banner: BannerInclude) => {
    router.push(`/staff/banners/${banner.id}/edit`)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<BannerInclude>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status") || "all"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/banners", {
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
    const data = response.data as BannerInclude[]
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

  const columns = useBannerColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  // Status filter options
  const statusOptions = [
    { value: "active", label: t("banners.status.active") },
    { value: "inactive", label: t("banners.status.inactive") },
    { value: "scheduled", label: t("banners.status.scheduled") },
    { value: "expired", label: t("banners.status.expired") },
  ]

  return (
    <BaseTable<BannerInclude>
      columns={allColumns}
      queryKey={["banners"]}
      queryFn={queryFn}
      emptyMessage={t("banners.no_banners_found")}
      statuses={statusOptions}
    ></BaseTable>
  )
}
