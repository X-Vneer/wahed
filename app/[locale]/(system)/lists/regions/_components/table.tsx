"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { Region } from "@/prisma/regions"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { RegionModal } from "./region-modal"
import { useRegionColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import apiClient from "@/services"

export function RegionsTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)

  const handleEditClick = (region: Region) => {
    setSelectedRegion(region)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedRegion(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedRegion(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<Region>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/regions", {
      params: {
        q: search || undefined,
        status: status || undefined,
        page,
        per_page: perPage,
      },
    })

    return response.data as TableQueryResponse<Region>
  }

  const columns = useRegionColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<Region>
        columns={allColumns}
        queryKey={["regions"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("regions.create")}
        </Button>
      </BaseTable>

      <RegionModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedRegion={selectedRegion}
      />
    </>
  )
}
