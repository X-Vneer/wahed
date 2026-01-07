"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Search, Plus, Trash2 } from "lucide-react"
import { useUsers } from "@/hooks/use-users"
import type { User } from "@/prisma/users/select"
import { useDebouncedValue } from "@/hooks/use-debounced"
import { parseAsString, useQueryState } from "nuqs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

export function UsersList() {
  const t = useTranslations("employees")
  const [q, setQ] = useState("")
  const debouncedValue = useDebouncedValue(q, 500)
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)

  const { data: users = [], isLoading } = useUsers({ q: debouncedValue })

  //   selected user
  const [selectedUser, setSelectedUser] = useQueryState(
    "user_id",
    parseAsString.withDefault("")
  )

  const handleSelectUser = (user: User) => {
    setSelectedUser(user.id)
  }

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await axios.delete(`/api/users/${userId}`, {
        withCredentials: true,
      })
      return response.data
    },
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ["users"] })
      // Clear selected user if it was deleted
      if (selectedUser === userToDelete) {
        setSelectedUser(null)
      }
      // Close dialog
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    },
    onError: (error) => {
      toast.error(
        error.response?.data.error || t("errors.internal_server_error")
      )
      setDeleteDialogOpen(false)
      // Keep dialog open on error so user can see the error or try again
    },
  })

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!userToDelete) return
    deleteMutation.mutate(userToDelete)
  }

  return (
    <Card className="w-full sm:w-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{t("users")}</CardTitle>
          <Button
            onClick={() => {
              setSelectedUser(null)
            }}
            size="sm"
          >
            <Plus className="size-4" />
            {t("addNew")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              className="pr-10"
            />
          </div>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className={`group flex items-center gap-2 rounded-lg border p-3 transition-colors ${
                  selectedUser === user.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <button
                  onClick={() => handleSelectUser(user)}
                  className="flex-1 text-start"
                >
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteClick(user.id)
                  }}
                >
                  <Trash2 className="text-destructive size-4" />
                </Button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {t("no_users found")}
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirm.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete &&
                t("deleteConfirm.description", {
                  name: users.find((u) => u.id === userToDelete)?.name || "",
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
                setUserToDelete(null)
              }}
            >
              {t("deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("deleteConfirm.deleting")
                : t("deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
