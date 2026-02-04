"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { useDeleteTaskComment } from "@/hooks/use-delete-task-comment"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { ar, enUS } from "date-fns/locale"
import { useLocale } from "next-intl"
import type { TaskDetail } from "@/prisma/tasks"
import { Trash2 } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"
import { TaskAddComment } from "./task-add-comment"
import { useState } from "react"

type TaskCommentsProps = {
  taskId: string
}

type TaskComment = TaskDetail["comments"][number]

const dateFnsLocale = (locale: string) => (locale === "ar" ? ar : enUS)

export function TaskComments({ taskId }: TaskCommentsProps) {
  const t = useTranslations()
  const locale = useLocale()
  const localeDate = dateFnsLocale(locale)
  const deleteCommentMutation = useDeleteTaskComment()
  const queryClient = useQueryClient()
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)

  const {
    data: comments,
    isLoading,
    isError,
  } = useQuery<TaskDetail["comments"]>({
    queryKey: ["task-comments", taskId],
    queryFn: async () => {
      const response = await apiClient.get<TaskDetail["comments"]>(
        `/api/tasks/${taskId}/comments`
      )
      return response.data
    },
  })

  const handleDelete = (commentId: string) => {
    if (deleteCommentMutation.isPending) return

    deleteCommentMutation.mutate(
      { taskId, commentId },
      {
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey: ["task", taskId] })
        },
      }
    )
    setCommentToDelete(null)
  }

  return (
    <Card>
      <CardContent className="space-y-4">
        <h3 className="text-foreground text-sm font-bold">
          {t("taskPage.projectComments")}
        </h3>
        {isLoading ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t("loading")}
          </p>
        ) : isError || !comments ? (
          <p className="text-destructive py-4 text-center text-sm">
            {t("errors.internal_server_error")}
          </p>
        ) : comments.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            {t("taskPage.noComments")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((comment: TaskComment) => {
              const name = comment.createdBy?.name ?? "?"
              const initials = name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
              return (
                <li key={comment.id} className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage
                        src={comment.createdBy?.image ?? undefined}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-foreground text-sm font-medium">
                      {name}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-foreground text-sm leading-relaxed">
                      {comment.content}
                    </p>
                    <div className={`mt-1 flex justify-between`}>
                      <div
                        className={`flex items-center justify-between gap-2`}
                      >
                        <p className="text-muted-foreground text-xs">
                          {format(new Date(comment.createdAt), "MMM d, yyyy", {
                            locale: localeDate,
                          })}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        aria-label={t("delete")}
                        onClick={() => setCommentToDelete(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <TaskAddComment taskId={taskId} />

        <AlertDialog
          open={commentToDelete !== null}
          onOpenChange={(open) => !open && setCommentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t("taskPage.deleteCommentConfirmTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("taskPage.deleteCommentConfirmDescription")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteCommentMutation.isPending}>
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90 text-white"
                onClick={() =>
                  commentToDelete && handleDelete(commentToDelete)
                }
                disabled={deleteCommentMutation.isPending}
              >
                {t("common.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
