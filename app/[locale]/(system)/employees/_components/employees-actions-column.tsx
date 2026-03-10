"use client"

import { Button } from "@/components/ui/button"
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
import type { User } from "@/prisma/users/select"
import type { ColumnDef } from "@tanstack/react-table"
import { Edit, KeyRound, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

interface EmployeesActionsColumnProps {
  onEdit: (user: User) => void
}

interface ActionsCellProps {
  user: User
  onEdit: (user: User) => void
}

function ActionsCell({ user, onEdit }: ActionsCellProps) {
  const t = useTranslations()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.delete(`/api/users/${userId}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["employees"] })
      setDeleteDialogOpen(false)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate(user.id)
  }

  const passwordMutation = useMutation({
    mutationFn: async (payload: { id: string; password: string }) => {
      const response = await apiClient.patch(`/api/users/${payload.id}`, {
        password: payload.password,
      })
      return response.data
    },
    onSuccess: () => {
      setPasswordDialogOpen(false)
      setNewPassword("")
      toast.success(t("employees.success.user_updated"))
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.error ?? t("errors.internal_server_error")
      toast.error(message)
    },
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      toast.error(t("employees.errors.password.required"))
      return
    }
    passwordMutation.mutate({ id: user.id, password: newPassword })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(user)}
          aria-label="Edit"
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setPasswordDialogOpen(true)}
          aria-label={t("employees.form.password")}
        >
          <KeyRound className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setDeleteDialogOpen(true)}
          aria-label="Delete"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{t("employees.changePassword.title")}</DialogTitle>
            </DialogHeader>
            <div>
              <label
                htmlFor="new-password"
                className="mb-1 block text-sm font-medium"
              >
                {t("employees.changePassword.newPassword")}
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPasswordDialogOpen(false)
                  setNewPassword("")
                }}
                disabled={passwordMutation.isPending}
              >
                {t("employees.deleteConfirm.cancel")}
              </Button>
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending && (
                  <Spinner className="mr-2 size-4" />
                )}
                {t("employees.changePassword.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("employees.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("employees.deleteConfirm.description", {
                name: user.name ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={deleteMutation.isPending}
              onClick={() => {
                setDeleteDialogOpen(false)
              }}
            >
              {t("employees.deleteConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteMutation.isPending
                ? t("employees.deleteConfirm.deleting")
                : t("employees.deleteConfirm.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function useEmployeesActionsColumn({
  onEdit,
}: EmployeesActionsColumnProps): ColumnDef<User> {
  const t = useTranslations()

  return {
    id: "actions",
    header: t("employees.table.actions"),
    cell: ({ row }) => {
      const user = row.original
      return <ActionsCell user={user} onEdit={onEdit} />
    },
  }
}

