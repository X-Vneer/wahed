import { useQuery } from "@tanstack/react-query"
import apiClient from "@/services"
import type { PublicProjectStatus } from "@/prisma/public-project-statuses"

export const usePublicProjectStatuses = () => {
  return useQuery({
    queryKey: ["lists", "public-project-statuses"],
    queryFn: () =>
      apiClient.get<{ data: PublicProjectStatus[] }>(
        "/api/lists/public-project-statuses"
      ),
    staleTime: Infinity,
    retry: 1,
  })
}
