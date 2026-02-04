"use client"

import apiClient from "@/services"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type DeleteSubtaskInput = {
  taskId: string
  subtaskId: string
}

export function useDeleteSubtask() {
  const t = useTranslations("tasks")

  return useMutation({
    mutationFn: async ({ taskId, subtaskId }: DeleteSubtaskInput) => {
      const response = await apiClient.delete(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`
      )
      return response.data
    },
    onSuccess: () => {
      toast.success(t("deleteSuccess") ?? "Subtask deleted")
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error ??
          t("deleteError") ??
          "Failed to delete subtask"
      )
    },
  })
}
