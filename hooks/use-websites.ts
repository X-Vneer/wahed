"use client"

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query"
import apiClient from "@/services"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import type { Website } from "@/lib/generated/prisma/client"
import { CreateWebsiteInput, UpdateWebsiteInput } from "@/lib/schemas/website"

export type WebsiteWithLocale = Website & {
  name: string
  description: string | null
}

export const useWebsites = (
  params?: { q?: string; status?: string },
  options?: Omit<
    UseQueryOptions<WebsiteWithLocale[], Error>,
    "queryKey" | "queryFn"
  >
) => {
  const fetchWebsites = async () => {
    const response = await apiClient.get<WebsiteWithLocale[]>("/api/websites", {
      params,
    })
    return response.data
  }

  return useQuery<WebsiteWithLocale[], Error>({
    queryKey: ["websites", params?.q || "", params?.status || ""],
    queryFn: fetchWebsites,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}

export const useCreateWebsite = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async (data: CreateWebsiteInput) => {
      const response = await apiClient.post<WebsiteWithLocale>(
        "/api/websites",
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] })
      toast.success(t("websites.success.website_created"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}

export const useUpdateWebsite = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateWebsiteInput
    }) => {
      const response = await apiClient.put<WebsiteWithLocale>(
        `/api/websites/${id}`,
        data
      )
      return response.data
    },
    // Optimistic update so the UI reflects the new status immediately
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["websites"] })

      const previousQueries = queryClient.getQueriesData({
        queryKey: ["websites"],
      })

      queryClient.setQueriesData(
        { queryKey: ["websites"] },
        (old: unknown | undefined) => {
          if (!old) return old

          // Simple list of websites (used by useWebsites)
          if (Array.isArray(old)) {
            return old.map((website) =>
              (website as WebsiteWithLocale).id === id
                ? ({ ...website, ...data } as WebsiteWithLocale)
                : website
            )
          }

          // Paginated table data (BaseTable)
          const maybePaginated = old as {
            data?: WebsiteWithLocale[]
            [key: string]: unknown
          }

          if (Array.isArray(maybePaginated.data)) {
            return {
              ...maybePaginated,
              data: maybePaginated.data.map((website) =>
                website.id === id ? { ...website, ...data } : website
              ),
            }
          }

          return old
        }
      )

      return { previousQueries }
    },
    onError: (error: Error, _variables, context) => {
      // Rollback optimistic updates
      if (context?.previousQueries) {
        for (const [queryKey, previousData] of context.previousQueries) {
          queryClient.setQueryData(queryKey, previousData)
        }
      }

      toast.error(error.message || t("errors.internal_server_error"))
    },
    onSuccess: () => {
      toast.success(t("websites.success.website_updated"))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] })
    },
  })
}

export const useDeleteWebsite = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/websites/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["websites"] })
      toast.success(t("websites.success.website_deleted"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}
