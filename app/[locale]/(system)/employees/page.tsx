"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useUsers } from "@/hooks/use-users"
import { useTranslations } from "next-intl"
import { parseAsString, useQueryState } from "nuqs"
import { UserForm } from "./_components/user-form"
import { UsersList } from "./_components/users-list"

export default function EmployeesPage() {
  const t = useTranslations()

  const { data: users = [] } = useUsers()

  const [selectedUserId] = useQueryState(
    "user_id",
    parseAsString.withDefault("")
  )

  const selectedUser = users.find((user) => user.id === selectedUserId) || null
  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
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

      {/* Main Content */}
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Right Panel - Users List */}
        <UsersList />
        {/* Left Panel - User Details Form */}
        <UserForm key={selectedUserId} selectedUser={selectedUser} />
      </div>
    </div>
  )
}
