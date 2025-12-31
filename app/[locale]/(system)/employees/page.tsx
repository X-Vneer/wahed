"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  createUserAction,
  updateUserAction,
  getAllPermissionsAction,
} from "./actions"
import { UsersList } from "./components/users-list"
import { UserForm } from "./components/user-form"
import type { User } from "@/hooks/use-users"
import type { PermissionKey } from "@/lib/generated/prisma/enums"

export default function EmployeesPage() {
  const t = useTranslations("employees")
  const tSidebar = useTranslations("sidebar")
  const queryClient = useQueryClient()

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [permissions, setPermissions] = useState<
    Array<{ id: string; key: PermissionKey; name: string }>
  >([])

  // Load permissions
  useEffect(() => {
    async function loadPermissions() {
      const permissionsResult = await getAllPermissionsAction()
      if (permissionsResult.success) {
        setPermissions(permissionsResult.permissions)
      }
    }

    loadPermissions()
  }, [])

  const handleFormSubmit = async (data: {
    name: string
    email: string
    password: string
    permissions: PermissionKey[]
  }) => {
    if (selectedUser) {
      // Update user
      const result = await updateUserAction(selectedUser.id, {
        name: data.name,
        email: data.email,
        password: data.password || undefined,
        permissions: data.permissions,
      })

      if (result.success) {
        // Invalidate users query to refetch
        await queryClient.invalidateQueries({ queryKey: ["users"] })
        setSelectedUser(null)
      }

      return result
    } else {
      // Create user
      const result = await createUserAction({
        name: data.name,
        email: data.email,
        password: data.password,
        permissions: data.permissions,
      })

      if (result.success) {
        // Invalidate users query to refetch
        await queryClient.invalidateQueries({ queryKey: ["users"] })
      }

      return result
    }
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{tSidebar("home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("title")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Right Panel - Users List */}
        <UsersList
          onAddNew={() => {
            setSelectedUser(null)
          }}
        />
        {/* Left Panel - User Details Form */}
        <UserForm
          selectedUser={selectedUser}
          permissions={permissions}
          onSubmit={handleFormSubmit}
          onSuccess={() => {
            setSelectedUser(null)
          }}
        />
      </div>
    </div>
  )
}
