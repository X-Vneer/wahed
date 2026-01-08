"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import axios from "axios"
import type { TransformedProject } from "@/prisma/projects"

export interface ProjectsResponse {
  projects: TransformedProject[]
  total: number
  archived: number
}

export const useProjects = (
  params?: { status?: string; archived?: string },
  options?: Omit<
    UseQueryOptions<ProjectsResponse, Error>,
    "queryKey" | "queryFn"
  >
) => {
  const fetchProjects = async () => {
    const response = await axios.get<ProjectsResponse>("/api/projects", {
      params,
      withCredentials: true,
    })
    return response.data
  }

  return useQuery<ProjectsResponse, Error>({
    queryKey: ["projects", params?.status || "", params?.archived || ""],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}
