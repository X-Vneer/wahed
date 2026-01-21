"use client"

import { User, UserListSelect } from "@/prisma/users/select"
import apiClient from "@/services"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"

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

export const useUsersList = (
  params?: { q?: string },
  options?: Omit<
    UseQueryOptions<UserListSelect[], Error>,
    "queryKey" | "queryFn"
  >
) => {
  const fetchUsers = async () => {
    const response = await apiClient.get<UserListSelect[]>("/api/lists/users", {
      params,
    })
    return response.data
  }
  return useQuery<UserListSelect[], Error>({
    queryKey: ["users", "list", params?.q || ""],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}
