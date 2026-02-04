"use client"

import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type CreateTaskCommentInput = {
  taskId: string
  content: string
}

export function useCreateTaskComment() {
  const queryClient = useQueryClient()
  const t = useTranslations("taskPage")

  return useMutation({
    mutationFn: async ({ taskId, content }: CreateTaskCommentInput) => {
      const response = await apiClient.post(`/api/tasks/${taskId}/comments`, {
        content,
      })
      return response.data
    },
    onSuccess: (_data, { taskId }) => {
      toast.success(t("commentAdded") ?? "")
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] })
    },
    onError: (error) => {
      toast.error(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.response?.data?.error ?? t("commentAddError") ?? ""
      )
    },
  })
}
