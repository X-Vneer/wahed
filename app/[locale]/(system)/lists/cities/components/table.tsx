"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import { Button } from "@/components/ui/button"
import type { City } from "@/prisma/cities"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import axios from "axios"
import { CityModal } from "./city-modal"
import { useCityColumns } from "./columns"
import { useActionsColumn } from "./actions-column"

export function CitiesTable() {
  const t = useTranslations()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)

  const handleEditClick = (city: City) => {
    setSelectedCity(city)
    setModalOpen(true)
  }

  const handleCreateClick = () => {
    setSelectedCity(null)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedCity(null)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<City>> => {
    const search = searchParams.get("q") || ""
    const status = searchParams.get("status")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await axios.get("/api/cities", {
      params: {
        q: search || undefined,
        status: status || undefined,
        page,
        per_page: perPage,
      },
      withCredentials: true,
    })

    return response.data as TableQueryResponse<City>
  }

  const columns = useCityColumns()
  const actionsColumn = useActionsColumn({
    onEdit: handleEditClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<City>
        columns={allColumns}
        queryKey={["cities"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
      >
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 size-4" />
          {t("cities.create")}
        </Button>
      </BaseTable>

      <CityModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        selectedCity={selectedCity}
      />
    </>
  )
}
