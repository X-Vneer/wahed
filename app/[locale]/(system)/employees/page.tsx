"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import type { User } from "@/prisma/users/select"
import { EmployeesTable } from "./_components/employees-table"
import { EmployeeDialog } from "./_components/employee-dialog"

export default function EmployeesPage() {
  const t = useTranslations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const handleAddNew = () => {
    setSelectedUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("employees.title")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("employees.title")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex grow justify-end gap-2">
          <Button type="button" onClick={handleAddNew}>
            <Plus className="size-4" />
            {t("employees.addNew")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <EmployeesTable onEdit={handleEdit} />

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedUser={selectedUser}
      />
    </div>
  )
}
