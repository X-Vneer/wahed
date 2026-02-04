"use client"

import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type DeleteTaskCommentInput = {
  taskId: string
  commentId: string
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient()
  const t = useTranslations("taskPage")

  return useMutation({
    mutationFn: async ({ taskId, commentId }: DeleteTaskCommentInput) => {
      const response = await apiClient.delete(
        `/api/tasks/${taskId}/comments/${commentId}`
      )
      return response.data
    },
    onSuccess: (_data, { taskId }) => {
      toast.success(t("commentDeleted") ?? "")
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
    },
    onError: (error) => {
      toast.error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.error ?? t("commentDeleteError") ?? ""
      )
    },
  })
}
