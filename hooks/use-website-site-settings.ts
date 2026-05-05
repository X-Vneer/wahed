"use client"

import type { UpdateWebsiteSiteSettingsInput } from "@/schemas/website-site-settings"
import type { WebsiteSiteSettingsAdminDto } from "@/lib/website-site-settings/service"
import apiClient from "@/services"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

export const websiteSiteSettingsQueryKey = ["website-site-settings"] as const

export function useWebsiteSiteSettingsQuery(
  options?: Omit<
    UseQueryOptions<WebsiteSiteSettingsAdminDto, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<WebsiteSiteSettingsAdminDto, Error>({
    queryKey: websiteSiteSettingsQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<WebsiteSiteSettingsAdminDto>(
        "/api/website/site-settings"
      )
      return data
    },
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export function useUpdateWebsiteSiteSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: UpdateWebsiteSiteSettingsInput) => {
      const { data } = await apiClient.patch<WebsiteSiteSettingsAdminDto>(
        "/api/website/site-settings",
        patch
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(websiteSiteSettingsQueryKey, data)
    },
  })
}

/** Fetches website CMS site settings and exposes a patch mutation (React Query). */
export function useWebsiteSiteSettings() {
  const query = useWebsiteSiteSettingsQuery()
  const mutation = useUpdateWebsiteSiteSettings()

  return {
    settings: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    reload: query.refetch,
    updatePartial: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
