import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"

export const useTaskCategories = () => {
  return useQuery({
    queryKey: ["lists", "task-categories"],
    queryFn: () => apiClient.get("/api/task-category"),
    staleTime: Infinity,
    retry: 1,
  })
}
