"use client"

import { BaseTable, type TableQueryResponse } from "@/components/table/table"
import type { Contact } from "@/prisma/contacts"
import apiClient from "@/services"
import { useTranslations } from "next-intl"
import { useContactColumns } from "./columns"
import { useActionsColumn } from "./actions-column"
import { ReadFilter } from "./read-filter"
import { SourceFilter } from "./source-filter"
import { ContactDetailModal } from "./contact-detail-modal"
import { useState } from "react"

export function ContactsTable() {
  const t = useTranslations()
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const handleViewClick = (contact: Contact) => {
    setSelectedContact(contact)
    setDetailOpen(true)
  }

  const queryFn = async (
    searchParams: URLSearchParams
  ): Promise<TableQueryResponse<Contact>> => {
    const search = searchParams.get("q") || ""
    const isRead = searchParams.get("is_read")
    const source = searchParams.get("source")
    const page = parseInt(searchParams.get("page") || "1", 10)
    const perPage = parseInt(searchParams.get("per_page") || "15", 10)

    const response = await apiClient.get("/api/contacts", {
      params: {
        q: search || undefined,
        is_read: isRead || undefined,
        source: source || undefined,
        page,
        per_page: perPage,
      },
    })

    return response.data as TableQueryResponse<Contact>
  }

  const columns = useContactColumns()
  const actionsColumn = useActionsColumn({
    onView: handleViewClick,
  })

  const allColumns = [...columns, actionsColumn]

  return (
    <>
      <BaseTable<Contact>
        columns={allColumns}
        queryKey={["contacts"]}
        queryFn={queryFn}
        emptyMessage={t("table.noDataFound")}
        filters={
          <>
            <ReadFilter />
            <SourceFilter />
          </>
        }
      />

      <ContactDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={selectedContact}
      />
    </>
  )
}
