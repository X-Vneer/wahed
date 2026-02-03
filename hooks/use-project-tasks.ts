"use client"

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import apiClient from "@/services"
import type { Task } from "@/prisma/tasks"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

export interface ProjectTasksResponse {
  project: { id: string; name: string }
  tasks: Task[]
}

export const useProjectTasks = (
  projectId: string | null,
  options?: Omit<
    UseQueryOptions<ProjectTasksResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const fetchTasks = async (): Promise<ProjectTasksResponse> => {
    if (!projectId) return { project: { id: "", name: "" }, tasks: [] }
    const response = await apiClient.get<ProjectTasksResponse>(
      `/api/projects/${projectId}/tasks`
    )
    return response.data
  }

  return useQuery<ProjectTasksResponse, Error>({
    queryKey: ["project-tasks", projectId ?? ""],
    queryFn: fetchTasks,
    enabled: !!projectId,
    staleTime: 60 * 1000,
    ...options,
  })
}

export const useReorderTasks = (projectId: string | null) => {
  const queryClient = useQueryClient()
  const t = useTranslations("tasks")

  return useMutation({
    mutationFn: async (taskIds: string[]) => {
      if (!projectId) throw new Error("Project ID is required")
      const response = await apiClient.patch("/api/tasks/reorder", {
        projectId,
        taskIds,
      })
      return response.data
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] })
      }
      toast.success(t("reorderSuccess") ?? "Order updated")
    },
    onError: () => {
      toast.error(t("reorderError") ?? "Failed to update order")
    },
  })
}

export const useDeleteTask = (projectId: string | null) => {
  const queryClient = useQueryClient()
  const t = useTranslations("tasks")

  return useMutation({
    mutationFn: async (taskId: string) => {
      const response = await apiClient.delete(`/api/tasks/${taskId}`)
      return response.data
    },
    onMutate: async (taskId) => {
      if (!projectId) return undefined
      const queryKey = ["project-tasks", projectId]
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<ProjectTasksResponse>(queryKey)
      queryClient.setQueryData<ProjectTasksResponse>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          tasks: old.tasks.filter((task) => task.id !== taskId),
        }
      })
      return { previous }
    },
    onError: (_err, _taskId, context) => {
      if (context?.previous && projectId) {
        queryClient.setQueryData(
          ["project-tasks", projectId],
          context.previous
        )
      }
      toast.error(t("deleteError") ?? "Failed to delete task")
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["project-tasks", projectId] })
      }
      toast.success(t("deleteSuccess") ?? "Task deleted")
    },
  })
}
