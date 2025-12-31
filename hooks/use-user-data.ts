"use client"

import { UserData } from "@/@types/user"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import axios from "axios"

type UserDataError = {
  error: string
}

export const useUserData = (
  options?: Omit<UseQueryOptions<UserData, Error>, "queryKey" | "queryFn">
) => {
  const t = useTranslations("errors")

  const fetchUserData = async (): Promise<UserData> => {
    try {
      const response = await axios.get<UserData>("/api/user/me", {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // If the error message is already translated (from server), use it directly
        // Otherwise, use the default translation
        const serverError = (error.response?.data as UserDataError)?.error
        if (serverError) {
          throw new Error(serverError)
        }
        // Fallback to translated error message
        throw new Error(t("failed_to_fetch_user_data"))
      }
      throw new Error(t("failed_to_fetch_user_data"))
    }
  }

  return useQuery<UserData, Error>({
    queryKey: ["user", "me"],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    ...options,
  })
}
