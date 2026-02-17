"use client"

import { useMutation } from "@tanstack/react-query"
import apiClient from "@/services"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import type { UpdateStaffPageSettingsInput } from "@/lib/schemas/staff-page-settings"
import type { StaffPageSettings } from "@/lib/get-staff-page-settings"
import { useStaffPageSettingsContext } from "@/contexts/staff-page-settings-context"

export type { StaffPageSettings } from "@/lib/get-staff-page-settings"

export function useStaffPageSettings() {
  const { settings } = useStaffPageSettingsContext()
  return { data: settings, isLoading: false }
}

export function useUpdateStaffPageSettings() {
  const { setSettings } = useStaffPageSettingsContext()
  const t = useTranslations()

  return useMutation({
    mutationFn: async (input: UpdateStaffPageSettingsInput) => {
      const { data } = await apiClient.patch<StaffPageSettings>(
        "/api/staff-page-settings",
        input
      )
      return data
    },
    onSuccess: (data) => {
      setSettings(data)
      toast.success(t("staffPageSettings.success.updated"))
    },
    onError: (error: Error) => {
      toast.error(error.message || t("errors.internal_server_error"))
    },
  })
}
