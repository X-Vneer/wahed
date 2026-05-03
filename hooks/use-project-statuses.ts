import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import type { ProjectStatus } from "@/prisma/project-statuses"

export const useProjectStatuses = () => {
  return useQuery({
    queryKey: ["lists", "project-statuses"],
    queryFn: () =>
      apiClient.get<{ data: ProjectStatus[] }>("/api/lists/project-statuses"),
    staleTime: Infinity,
    retry: 1,
  })
}
