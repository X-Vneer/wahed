"use client"

import { User } from "@/prisma/users/select"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import axios from "axios"

export const useUserData = (
  options?: Omit<UseQueryOptions<User, Error>, "queryKey" | "queryFn">
) => {
  const fetchUserData = async (): Promise<User> => {
    const response = await axios.get<User>("/api/user/me", {
      withCredentials: true,
    })
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
