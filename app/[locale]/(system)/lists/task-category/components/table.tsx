"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { TaskCategory } from "@/prisma/task-categories"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import axios from "axios"
import { TaskCategoryModal } from "./task-category-modal"
import { useTaskCategoryColumns } from "./columns"
import { useActionsColumn } from "./actions-column"

export function TaskCategoryTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(
    null
  )

  const handleEditClick = (category: TaskCategory) => {
    setSelectedCategory(category)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedCategory(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedCategory(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<TaskCategory>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await axios.get("/api/task-category", {
      params: {
        q: search || undefined,
        status: status || undefined,
        page,
        per_page: perPage,
      },
      withCredentials: true,
    })

    // The API now returns paginated data directly
    return response.data as TableQueryResponse<TaskCategory>
  }

  const columns = useTaskCategoryColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<TaskCategory>
        columns={allColumns}
        queryKey={["task-category"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
        statuses={[
          { value: "active", label: t("table-status-filter.active") },
          { value: "inactive", label: t("table-status-filter.inactive") },
        ]}
        statusFilterKey="status"
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("taskCategory.create")}
        </Button>
      </BaseTable>

      {/* Create/Edit Modal */}
      <TaskCategoryModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedCategory={selectedCategory}
      />
    </>
  )
}
