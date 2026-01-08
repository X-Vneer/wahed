"use client"

import { User } from "@/prisma/users/select"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/services"

export const useUsers = (
  params?: { q?: string },
  options?: Omit<UseQueryOptions<User[], Error>, "queryKey" | "queryFn">
) => {
  const fetchUsers = async () => {
    const response = await apiClient.get<User[]>("/api/users", {
      params,
    })
    return response.data
  }

  return useQuery<User[], Error>({
    queryKey: ["users", params?.q || ""],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}
