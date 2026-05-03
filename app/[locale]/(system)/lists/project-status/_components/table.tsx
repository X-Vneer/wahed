"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { ProjectStatus } from "@/prisma/project-statuses"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { ProjectStatusModal } from "./project-status-modal"
import { useProjectStatusColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import apiClient from "@/services"

export function ProjectStatusTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProjectStatus, setSelectedProjectStatus] =
    useState<ProjectStatus | null>(null)

  const handleEditClick = (projectStatus: ProjectStatus) => {
    setSelectedProjectStatus(projectStatus)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedProjectStatus(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedProjectStatus(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<ProjectStatus>> => {
    const search = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/project-status", {
      params: {
        q: search || undefined,
        page,
        per_page: perPage,
      },
    })

    return response.data as TableQueryResponse<ProjectStatus>
  }

  const columns = useProjectStatusColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<ProjectStatus>
        columns={allColumns}
        queryKey={["project-status"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("projectStatus.create")}
        </Button>
      </BaseTable>

      <ProjectStatusModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedProjectStatus={selectedProjectStatus}
      />
    </>
  )
}
