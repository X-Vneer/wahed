"use client"

import type { Task } from "@/prisma/tasks"
import type { ProjectTasksResponse } from "@/hooks/use-project-tasks"
import apiClient from "@/services"
import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

export function useToggleTaskDone() {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async ({ taskId, done }: { taskId: string; done: boolean }) => {
      const response = await apiClient.patch<Task>(
        `/api/tasks/${taskId}/done`,
        {
          done,
        }
      )
      return response.data
    },
    onMutate: async ({ taskId, done }) => {
      await queryClient.cancelQueries({ queryKey: ["project-tasks"] })
      const previous = queryClient.getQueriesData<ProjectTasksResponse>({
        queryKey: ["project-tasks"],
      })

      // Optimistically update project tasks list
      queryClient.setQueriesData<ProjectTasksResponse>(
        { queryKey: ["project-tasks"] },
        (old) => {
          if (!old?.tasks) return old
          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === taskId
                ? { ...task, doneAt: done ? new Date() : null }
                : task
            ),
          }
        }
      )

      // Optimistically update single task detail view
      const taskQueryKey = ["task", taskId]
      const previousTask = queryClient.getQueryData<Task>(taskQueryKey)

      if (previousTask) {
        queryClient.setQueryData<Task>(taskQueryKey, {
          ...previousTask,
          doneAt: done ? new Date() : null,
        })
      }

      return { previous, previousTask }
    },
    onError: (error: { response?: { data?: { error?: string } } }, _variables, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as QueryKey, data)
        })
      }

      if (context?.previousTask && _variables) {
        const taskQueryKey = ["task", _variables.taskId]
        queryClient.setQueryData<Task | undefined>(taskQueryKey, context.previousTask)
      }
      toast.error(
        error.response?.data?.error ?? t("errors.internal_server_error")
      )
    },
    onSuccess: (_, { taskId, done }) => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] })
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      toast.success(
        done ? t("tasks.taskDoneUpdated") : t("tasks.taskUndoneUpdated")
      )
    },
  })
}
