"use client"

import type { UpdateSystemSiteSettingsInput } from "@/schemas/system-site-settings"
import type { SystemSiteSettingsAdminDto } from "@/lib/system-site-settings/service"
import apiClient from "@/services"
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"

export const systemSiteSettingsQueryKey = ["system-site-settings"] as const

export function useSystemSiteSettingsQuery(
  options?: Omit<
    UseQueryOptions<SystemSiteSettingsAdminDto, Error>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<SystemSiteSettingsAdminDto, Error>({
    queryKey: systemSiteSettingsQueryKey,
    queryFn: async () => {
      const { data } = await apiClient.get<SystemSiteSettingsAdminDto>(
        "/api/system/site-settings"
      )
      return data
    },
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  })
}

export function useUpdateSystemSiteSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (patch: UpdateSystemSiteSettingsInput) => {
      const { data } = await apiClient.patch<SystemSiteSettingsAdminDto>(
        "/api/system/site-settings",
        patch
      )
      return data
    },
    onSuccess: (data) => {
      queryClient.setQueryData(systemSiteSettingsQueryKey, data)
    },
  })
}

/** Fetches internal system site settings and exposes a patch mutation. */
export function useSystemSiteSettings() {
  const query = useSystemSiteSettingsQuery()
  const mutation = useUpdateSystemSiteSettings()

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
