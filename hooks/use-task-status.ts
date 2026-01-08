import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"

export const useTaskStatuses = () => {
  return useQuery({
    queryKey: ["lists", "task-statuses"],
    queryFn: () => apiClient.get("/api/lists/task-status"),
    staleTime: Infinity,
    retry: 1,
  })
}
