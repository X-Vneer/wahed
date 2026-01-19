"use client"

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import apiClient from "@/services"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { BannerInclude } from "@/prisma/banners"
import { UpdateBannerInput } from "@/lib/schemas/banner"



export const useBanners = (
  params?: { q?: string },
  options?: Omit<UseQueryOptions<BannerInclude[], Error>, "queryKey" | "queryFn">
) => {
  const fetchBanners = async () => {
    const response = await apiClient.get<BannerInclude[]>("/api/banners", {
      params,
    })
    return response.data
  }

  return useQuery<BannerInclude[], Error>({
    queryKey: ["banners", params?.q || ""],
    queryFn: fetchBanners,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    ...options,
  })
}

export const useCreateBanner = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async (data: {
      titleAr: string
      titleEn: string
      descriptionAr?: string | null
      descriptionEn?: string | null
      content?: string | null
      image: string
      startDate: Date
      endDate: Date
      users?: string[] | null
      isActive?: boolean
    }) => {
      const response = await apiClient.post<BannerInclude>("/api/banners", data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
      toast.success(t("banners.success.banner_created"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}

export const useUpdateBanner = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateBannerInput
    }) => {
      const response = await apiClient.put<BannerInclude>(`/api/banners/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
      toast.success(t("banners.success.banner_updated"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}

export const useDeleteBanner = () => {
  const queryClient = useQueryClient()
  const t = useTranslations()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/banners/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] })
      toast.success(t("banners.success.banner_deleted"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}

