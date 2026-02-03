"use client"

import type { Task } from "@/prisma/tasks"
import type { ProjectTasksResponse } from "@/hooks/use-project-tasks"
import apiClient from "@/services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

type ChangeTaskStatusVariables = {
  taskId: string
  statusId: string
  statusName: string
  statusColor?: string | null
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient()
  const t = useTranslations("tasks")

  return useMutation({
    mutationFn: async ({ taskId, statusId }: ChangeTaskStatusVariables) => {
      const response = await apiClient.patch<Task>(
        `/api/tasks/${taskId}/status`,
        {
          statusId,
        }
      )
      return response.data
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["project-tasks"] })

      const previousQueries =
        queryClient.getQueriesData<ProjectTasksResponse>({
          queryKey: ["project-tasks"],
        })

      previousQueries.forEach(([queryKey, previousData]) => {
        if (!previousData) return

        const nextTasks = previousData.tasks.map((task) =>
          task.id === variables.taskId
            ? {
                ...task,
                status: {
                  ...task.status,
                  name: variables.statusName,
                  color: variables.statusColor ?? task.status.color,
                },
              }
            : task
        )

        queryClient.setQueryData<ProjectTasksResponse>(queryKey, {
          ...previousData,
          tasks: nextTasks,
        })
      })

      return { previousQueries }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-tasks"] })
      toast.success(t("statusUpdated"))
    },
    onError: (
      error: { response?: { data?: { error?: string } } },
      _variables,
      context
    ) => {
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, previousData]) => {
          queryClient.setQueryData<ProjectTasksResponse>(queryKey, previousData)
        })
      }

      toast.error(error.response?.data?.error ?? t("errors.invalid_status"))
    },
  })
}

