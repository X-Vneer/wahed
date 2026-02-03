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
      return { previous }
    },
    onError: (error: { response?: { data?: { error?: string } } }, _, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey as QueryKey, data)
        })
      }
      toast.error(
        error.response?.data?.error ?? t("errors.internal_server_error")
      )
    },
    onSuccess: (_, { done }) => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] })
      toast.success(
        done ? t("tasks.taskDoneUpdated") : t("tasks.taskUndoneUpdated")
      )
    },
  })
}
