import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { TaskStatus } from "@/prisma/task-statuses"

export const useTaskStatuses = () => {
  return useQuery({
    queryKey: ["lists", "task-statuses"],
    queryFn: () =>
      apiClient.get<{ data: TaskStatus[] }>("/api/lists/task-statuses"),
    staleTime: Infinity,
    retry: 1,
  })
}
