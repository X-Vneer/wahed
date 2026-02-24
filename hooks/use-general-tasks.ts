"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/services"
import type { Task } from "@/prisma/tasks"

export interface GeneralTasksResponse {
  tasks: Task[]
}

export const useGeneralTasks = (
  options?: Omit<UseQueryOptions<GeneralTasksResponse, Error>, "queryKey" | "queryFn">
) => {
  const fetchGeneralTasks = async (): Promise<GeneralTasksResponse> => {
    const response = await apiClient.get<GeneralTasksResponse>("/api/tasks/general")
    return response.data
  }

  return useQuery<GeneralTasksResponse, Error>({
    queryKey: ["general-tasks"],
    queryFn: fetchGeneralTasks,
    staleTime: 60 * 1000,
    ...options,
  })
}

