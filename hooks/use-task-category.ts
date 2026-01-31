import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { TaskCategory } from "@/prisma/task-categories"

export const useTaskCategories = () => {
  return useQuery({
    queryKey: ["lists", "task-categories"],
    queryFn: () =>
      apiClient.get<{ data: TaskCategory[] }>("/api/lists/task-categories"),
    staleTime: Infinity,
    retry: 1,
  })
}
