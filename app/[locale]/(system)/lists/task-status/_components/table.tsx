"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { TaskStatus } from "@/prisma/task-statuses"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import axios from "axios"
import { TaskStatusModal } from "./task-status-modal"
import { useTaskStatusColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import apiClient from "@/services"

export function TaskStatusTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTaskStatus, setSelectedTaskStatus] =
    useState<TaskStatus | null>(null)

  const handleEditClick = (taskStatus: TaskStatus) => {
    setSelectedTaskStatus(taskStatus)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedTaskStatus(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedTaskStatus(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<TaskStatus>> => {
    const search = searchParams.get("q") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/task-status", {
      params: {
        q: search || undefined,
        page,
        per_page: perPage,
      },
    })

    // The API now returns paginated data directly
    return response.data as TableQueryResponse<TaskStatus>
  }

  const columns = useTaskStatusColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<TaskStatus>
        columns={allColumns}
        queryKey={["task-status"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("taskStatus.create")}
        </Button>
      </BaseTable>

      {/* Create/Edit Modal */}
      <TaskStatusModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedTaskStatus={selectedTaskStatus}
      />
    </>
  )
}
