"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import UserAvatar from "@/components/user-avatar"
import UsersSelect from "@/components/users-select"
import { PERMISSIONS_GROUPED } from "@/config/permissions"
import { usePermission } from "@/hooks/use-permission"
import { useUsersList } from "@/hooks/use-users"
import type { TaskDetail } from "@/prisma/tasks"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@mantine/form"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { UserPlus, UserMinus } from "lucide-react"

type TaskAssigneesProps = {
  taskId: string
  assignees: TaskDetail["assignedTo"]
}

type AddFormValues = { assignedToIds: string[] }

function EditAssigneesDialog({
  open,
  onOpenChange,
  taskId,
  assignees,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  assignees: TaskDetail["assignedTo"]
  onSuccess: () => void
}) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")
  const tCommon = useTranslations("common")
  const tErrors = useTranslations("errors")
  const assigneeIds = assignees.map((u) => u.id)

  const form = useForm<AddFormValues>({
    mode: "controlled",
    initialValues: { assignedToIds: assigneeIds },
  })

  const updateMutation = useMutation({
    mutationFn: async (assignedToIds: string[]) => {
      const { data } = await apiClient.patch<TaskDetail>(
        `/api/tasks/${taskId}/assignees`,
        { assignedToIds }
      )
      return data
    },
    onSuccess: () => {
      toast.success(tCommon("saved"))
      onSuccess()
      onOpenChange(false)
      form.reset()
    },
    onError: () => {
      toast.error(tErrors("internal_server_error"))
    },
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset()
    onOpenChange(next)
  }

  const handleSubmit = (values: AddFormValues) => {
    updateMutation.mutate(values.assignedToIds)
  }

  useEffect(() => {
    if (open) {
      form.setValues({ assignedToIds: assigneeIds })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, assigneeIds.join(",")])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("addAssigneesDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.onSubmit(handleSubmit)}
          className="grid gap-4 py-2"
        >
          <FieldGroup>
            <UsersSelect<AddFormValues>
              form={form}
              name="assignedToIds"
              label={t("addAssigneesLabel")}
              publicLabel={tTasks("form.assigneesPublic")}
              multiple
              onValueChange={(value) =>
                form.setFieldValue(
                  "assignedToIds",
                  Array.isArray(value) ? value : []
                )
              }
            />
          </FieldGroup>
          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex min-w-28 flex-1 justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={form.submitting || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90 min-w-28"
              >
                {(form.submitting || updateMutation.isPending) && (
                  <Spinner className="mr-2 size-4" />
                )}
                {tCommon("save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function TaskAssignees({ taskId, assignees }: TaskAssigneesProps) {
  const t = useTranslations("taskPage")
  const tTasks = useTranslations("tasks")
  const { checkPermission } = usePermission()
  const canEdit = checkPermission(PERMISSIONS_GROUPED.TASK.ASSIGN)
  const queryClient = useQueryClient()
  const { data: users = [] } = useUsersList()
  const assigneeIds = assignees.map((u) => u.id)
  const availableToAdd = users.filter((u) => !assigneeIds.includes(u.id))
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const invalidateTask = () => {
    queryClient.invalidateQueries({ queryKey: ["task", taskId] })
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-foreground text-lg font-semibold">
            {t("assignees")}
          </h3>
          {canEdit && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                disabled={availableToAdd.length === 0}
              >
                <UserPlus className="mr-1 size-4" />
                {t("addAssignees")}
              </Button>
            </div>
          )}
        </div>
        {assignees.length === 0 && !canEdit ? (
          <p className="text-muted-foreground text-sm">
            {tTasks("noAssignee")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {assignees.map((user) => (
              <li key={user.id}>
                <UserAvatar
                  name={user.name ?? ""}
                  email={user.email ?? ""}
                  image={user.image ?? undefined}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <EditAssigneesDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        taskId={taskId}
        assignees={assignees}
        onSuccess={invalidateTask}
      />
    </Card>
  )
}
