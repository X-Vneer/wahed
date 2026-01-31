"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { TaskTemplate } from "@/prisma/task-templates"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { TaskTemplateModal } from "./task-template-modal"
import { useTaskTemplateColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import apiClient from "@/services"

const TASK_TEMPLATE_STATUSES = [
  { value: "all", label: "table-status-filter.all" },
  { value: "active", label: "table-status-filter.active" },
  { value: "inactive", label: "table-status-filter.inactive" },
]

export function TaskTemplatesTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(
    null
  )

  const handleEditClick = (template: TaskTemplate) => {
    setSelectedTemplate(template)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedTemplate(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedTemplate(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<TaskTemplate>> => {
    const search = searchParams.get("q") ?? ""
    const status = searchParams.get("status") ?? "all"
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const perPage = parseInt(searchParams.get("per_page") ?? "15", 10)

    const response = await apiClient.get("/api/tasks/templates", {
      params: {
        q: search || undefined,
        status: status !== "all" ? status : undefined,
        page,
        per_page: perPage,
      },
    })

    return response.data as TableQueryResponse<TaskTemplate>
  }

  const columns = useTaskTemplateColumns()
  const actionsColumn = useActionsColumn({ onEdit: handleEditClick })
  const allColumns = [...columns, actionsColumn]

  const statuses = TASK_TEMPLATE_STATUSES.map((s) => ({
    value: s.value,
    label: t(s.label),
  }))

  return (
    <>
      <BaseTable<TaskTemplate>
        columns={allColumns}
        queryKey={["tasks", "templates"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
        statusFilterKey="status"
        statuses={statuses}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("taskTemplate.create")}
        </Button>
      </BaseTable>

      <TaskTemplateModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedTemplate={selectedTemplate}
      />
    </>
  )
}
