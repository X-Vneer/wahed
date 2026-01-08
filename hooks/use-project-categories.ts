import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ["lists", "project-categories"],
    queryFn: () => apiClient.get("/api/lists/project-categories"),
    staleTime: Infinity,
    retry: 1,
  })
}
