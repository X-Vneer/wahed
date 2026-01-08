"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { ProjectCategory } from "@/prisma/project-categories"
import apiClient from "@/services"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useActionsColumn } from "./actions-column"
import { useProjectCategoryColumns } from "./columns"
import { ProjectCategoryModal } from "./project-category-modal"

export function ProjectCategoriesTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory | null>(null)

  const handleEditClick = (category: ProjectCategory) => {
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
  ): Promise<TableQueryResponse<ProjectCategory>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/project-categories", {
      params: {
        q: search || undefined,
        status: status || undefined,
        page,
        per_page: perPage,
      },
    })

    // The API now returns paginated data directly
    return response.data as TableQueryResponse<ProjectCategory>
  }

  const columns = useProjectCategoryColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<ProjectCategory>
        columns={allColumns}
        queryKey={["project-categories"]}
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
          {t("projectCategories.create")}
        </Button>
      </BaseTable>

      {/* Create/Edit Modal */}
      <ProjectCategoryModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedCategory={selectedCategory}
      />
    </>
  )
}
