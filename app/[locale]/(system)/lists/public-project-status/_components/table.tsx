"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { PublicProjectStatus } from "@/prisma/public-project-statuses"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { PublicProjectStatusModal } from "./public-project-status-modal"
import { usePublicProjectStatusColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import apiClient from "@/services"

export function PublicProjectStatusTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState<PublicProjectStatus | null>(null)

  const handleEditClick = (row: PublicProjectStatus) => {
    setSelected(row)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelected(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelected(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<PublicProjectStatus>> => {
    const search = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/public-project-status", {
      params: {
        q: search || undefined,
        page,
        per_page: perPage,
      },
    })

    return response.data as TableQueryResponse<PublicProjectStatus>
  }

  const columns = usePublicProjectStatusColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<PublicProjectStatus>
        columns={allColumns}
        queryKey={["public-project-status"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("publicProjectStatus.create")}
        </Button>
      </BaseTable>

      <PublicProjectStatusModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedRow={selected}
      />
    </>
  )
}
