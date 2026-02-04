"use client"

import type { TaskDetail } from "@/prisma/tasks"
import apiClient from "@/services"
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type ToggleSubtaskDoneInput = {
  taskId: string
  subtaskId: string
  done: boolean
}

type ToggleSubtaskDoneContext = {
  previous?: TaskDetail
  queryKey: QueryKey
}

export function useToggleSubtaskDone() {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async ({ taskId, subtaskId, done }: ToggleSubtaskDoneInput) => {
      const response = await apiClient.patch(
        `/api/tasks/${taskId}/subtasks/${subtaskId}`,
        { done }
      )
      return response.data
    },
    onMutate: async ({
      taskId,
      subtaskId,
      done,
    }: ToggleSubtaskDoneInput): Promise<ToggleSubtaskDoneContext> => {
      const queryKey: QueryKey = ["task", taskId]

      await queryClient.cancelQueries({ queryKey })

      const previous = queryClient.getQueryData<TaskDetail>(queryKey)

      queryClient.setQueryData<TaskDetail>(queryKey, (old) => {
        if (!old) return old

        return {
          ...old,
          subTasks: old.subTasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, done } : subtask
          ),
        }
      })

      return { previous, queryKey }
    },
    onError: (
      error: { response?: { data?: { error?: string } } },
      _variables,
      context
    ) => {
      if (context?.previous) {
        queryClient.setQueryData(context.queryKey, context.previous)
      }

      toast.error(
        error.response?.data?.error ??
          t("errors.internal_server_error") ??
          t("tasks.reorderError")
      )
    },
    onSuccess: (_data, { done }) => {
      toast.success(
        done ? t("tasks.taskDoneUpdated") : t("tasks.taskUndoneUpdated")
      )
    },
    onSettled: (_data, _error, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
  })
}

