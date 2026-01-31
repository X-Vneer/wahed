import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import { ProjectCategory } from "@/prisma/project-categories"

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ["lists", "project-categories"],
    queryFn: () =>
      apiClient.get<{ data: ProjectCategory[] }>(
        "/api/lists/project-categories"
      ),
    staleTime: Infinity,
    retry: 1,
  })
}
