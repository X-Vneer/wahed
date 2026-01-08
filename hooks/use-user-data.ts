"use client"

import { User } from "@/prisma/users/select"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/services"

export const useUserData = (
  options?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
  const fetchUserData = async (): Promise<User> => {
    const response = await apiClient.get<User>("/api/user/me")
    return response.data
  }

  return useQuery<User, Error>({
    queryKey: ["user", "me"],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    ...options,
  })
}
