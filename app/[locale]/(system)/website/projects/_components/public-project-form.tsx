"use client"

import { Button } from "@/components/ui/button"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { Link, useRouter } from "@/lib/i18n/navigation"
import {
  PUBLIC_PROJECT_FORM_STEP_COUNT,
  publicProjectFormSchema,
  publicProjectFormStepSchemas,
} from "@/lib/schemas/public-project"
import { usePublicProjectPrefill } from "@/hooks/use-public-project-prefill"
import type { PublicProjectPrefillResponse } from "@/lib/types/public-project-prefill"
import type { PublicProjectEditData } from "@/prisma/public-projects"
import apiClient from "@/services"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  getPublicProjectFormInitialValues,
  PublicProjectFormProvider,
  usePublicProjectForm,
  type PublicProjectFormValues,
} from "./public-project-form-context"
import { PublicProjectFormStepper } from "./public-project-form-stepper"
import { PublicProjectFormStepBasics } from "./steps/public-project-form-step-basics"
import { PublicProjectFormStepLocationDetails } from "./steps/public-project-form-step-location-details"
import { PublicProjectFormStepMedia } from "./steps/public-project-form-step-media"
import { PublicProjectFormStepPublish } from "./steps/public-project-form-step-publish"

type PublicProjectFormProps = {
  mode: "create" | "edit"
  linkedProjectId?: string | null
  /** Existing project data for edit mode */
  initialData?: PublicProjectEditData | null
}

function editDataToFormValues(
  data: PublicProjectEditData
): PublicProjectFormValues {
  return {
    regionId: data.regionId,
    titleAr: data.titleAr,
    titleEn: data.titleEn,
    slug: data.slug,
    descriptionAr: data.descriptionAr,
    descriptionEn: data.descriptionEn,
    shortDescriptionAr: data.shortDescriptionAr,
    shortDescriptionEn: data.shortDescriptionEn,
    images: data.images,
    isActive: data.isActive,
    projectId: data.projectId,
    locationAr: data.locationAr,
    locationEn: data.locationEn,
    area: data.area,
    deedNumber: data.deedNumber,
    googleMapsAddress: data.googleMapsAddress,
    status: data.status as PublicProjectFormValues["status"],
    cityId: data.cityId,
    categoryIds: data.categoryIds,
    badges: data.badges,
    features: data.features,
    startingPrice: data.startingPrice,
    endingPrice: data.endingPrice,
    attachments: data.attachments.map((a) => ({
      fileUrl: a.fileUrl,
      fileName: a.fileName ?? a.fileUrl,
      fileType: a.fileType,
      fileSize: a.fileSize,
      additionalInfo: a.additionalInfo,
    })),
    linkedAttachmentCandidates: [],
    selectedLinkedFileUrls: [],
  }
}

export function PublicProjectForm({
  mode,
  linkedProjectId,
  initialData,
}: PublicProjectFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEdit = mode === "edit"

  const form = usePublicProjectForm({
    mode: "uncontrolled",
    initialValues:
      isEdit && initialData
        ? editDataToFormValues(initialData)
        : getPublicProjectFormInitialValues(linkedProjectId),
    validate: zod4Resolver(publicProjectFormSchema),
  })

  const { data: linkedPrefill } = usePublicProjectPrefill(
    linkedProjectId,
    Boolean(linkedProjectId) && !isEdit
  )
  const appliedPrefillFor = useRef<string | null>(null)
  const [manualPrefillLoading, setManualPrefillLoading] = useState(false)
  const [step, setStep] = useState(0)
  const stepperRef = useRef<HTMLDivElement | null>(null)

  const stepLabels = [
    t("websiteCms.projects.publicProjectForm.steps.basics"),
    t("websiteCms.projects.publicProjectForm.steps.media"),
    t("websiteCms.projects.publicProjectForm.steps.locationAndDetails"),
    t("websiteCms.projects.publicProjectForm.steps.publish"),
  ] as const

  useEffect(() => {
    stepperRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [step])

  const mergePrefillIntoForm = (p: PublicProjectPrefillResponse) => {
    form.setValues((prev) => ({
      ...prev,
      titleAr: p.titleAr,
      titleEn: p.titleEn,
      descriptionAr: p.descriptionAr ?? "",
      descriptionEn: p.descriptionEn ?? "",
      shortDescriptionAr: p.shortDescriptionAr ?? "",
      shortDescriptionEn: p.shortDescriptionEn ?? "",
      cityId: p.cityId,
      regionId: p.regionId,
      area: p.area ?? "",
      deedNumber: p.deedNumber ?? "",
      googleMapsAddress: p.googleMapsAddress ?? "",
      status: p.status,
      categoryIds: [...p.categoryIds],
      images: p.images.length > 0 ? p.images : prev.images,
      linkedAttachmentCandidates:
        p.attachments.length > 0
          ? p.attachments.map((a) => ({
              fileUrl: a.fileUrl,
              fileName: a.fileName ?? a.fileUrl,
              fileType: a.fileType ?? undefined,
              fileSize: a.fileSize ?? undefined,
            }))
          : [],
      selectedLinkedFileUrls:
        p.attachments.length > 0 ? p.attachments.map((a) => a.fileUrl) : [],
      attachments: prev.attachments,
      projectId: prev.projectId?.trim() ? prev.projectId : p.projectId,
      slug: prev.slug?.trim() ? prev.slug : p.suggestedSlug,
    }))
  }

  useEffect(() => {
    if (isEdit) return
    form.setFieldValue("projectId", linkedProjectId ?? "")
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync linked internal project id only
  }, [linkedProjectId])

  useEffect(() => {
    if (isEdit) return
    if (!linkedProjectId) {
      appliedPrefillFor.current = null
      return
    }
    if (!linkedPrefill) return
    if (appliedPrefillFor.current === linkedProjectId) return
    appliedPrefillFor.current = linkedProjectId
    mergePrefillIntoForm(linkedPrefill)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apply server prefill once per linked id
  }, [linkedProjectId, linkedPrefill])

  const handleLoadFromInternalProject = async () => {
    const id = form.values.projectId.trim()
    if (!id) {
      toast.error(
        t("websiteCms.projects.publicProjectForm.errors.prefillNeedProjectId")
      )
      return
    }
    setManualPrefillLoading(true)
    try {
      const res = await apiClient.get<PublicProjectPrefillResponse>(
        `/api/website/public-projects/prefill/${id}`
      )
      mergePrefillIntoForm(res.data)
      appliedPrefillFor.current = id
      toast.success(
        t("websiteCms.projects.publicProjectForm.success.prefillLoaded")
      )
    } catch {
      toast.error(
        t("websiteCms.projects.publicProjectForm.errors.prefillFailed")
      )
    } finally {
      setManualPrefillLoading(false)
    }
  }

  const validateStep = (stepIndex: number) => {
    const schema = publicProjectFormStepSchemas[stepIndex]
    const result = schema.safeParse(form.values)
    if (result.success) {
      for (const key of Object.keys(schema.shape)) {
        form.clearFieldError(key as keyof PublicProjectFormValues)
      }
      return true
    }
    for (const issue of result.error.issues) {
      const path = issue.path[0]
      if (typeof path === "string") {
        form.setFieldError(path as keyof PublicProjectFormValues, issue.message)
      }
    }
    return false
  }

  const goNext = () => {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, PUBLIC_PROJECT_FORM_STEP_COUNT - 1))
  }

  const goToStep = (index: number) => {
    setStep(index)
  }

  const handleSubmit = async (values: PublicProjectFormValues) => {
    try {
      const {
        regionId,
        linkedAttachmentCandidates,
        selectedLinkedFileUrls,
        attachments: newAttachments,
        ...rest
      } = values
      void regionId
      const fromLinked = linkedAttachmentCandidates.filter((a) =>
        selectedLinkedFileUrls.includes(a.fileUrl)
      )
      const payload = {
        ...rest,
        attachments: [...fromLinked, ...newAttachments],
        status: values.status || undefined,
        projectId: values.projectId?.trim() || undefined,
      }

      if (isEdit && initialData) {
        await apiClient.put(
          `/api/website/public-projects/${initialData.id}`,
          payload
        )
        toast.success(
          t("websiteCms.projects.publicProjectForm.success.updated")
        )
      } else {
        await apiClient.post("/api/website/public-projects", payload)
        toast.success(
          t("websiteCms.projects.publicProjectForm.success.created")
        )
      }

      queryClient.invalidateQueries({
        queryKey: ["website-content", "projects"],
      })
      queryClient.invalidateQueries({ queryKey: ["public-projects"] })
      queryClient.invalidateQueries({
        queryKey: ["website", "public-projects"],
      })
      router.push("/website/projects")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const root = handleFormErrors(error, form)
        toast.error(root || t("errors.internal_server_error"))
        return
      }
      toast.error(t("errors.internal_server_error"))
    }
  }

  const lastStep = PUBLIC_PROJECT_FORM_STEP_COUNT - 1

  return (
    <PublicProjectFormProvider form={form}>
      <form
        className="space-y-8"
        onSubmit={(e) => {
          if (step !== lastStep) {
            e.preventDefault()
            return
          }
          form.onSubmit(handleSubmit)(e)
        }}
      >
        <div ref={stepperRef} className="space-y-3">
          <p className="text-muted-foreground text-sm">
            {t("websiteCms.projects.publicProjectForm.steps.progress", {
              current: step + 1,
              total: PUBLIC_PROJECT_FORM_STEP_COUNT,
            })}
          </p>
          <PublicProjectFormStepper
            steps={stepLabels}
            currentStep={step}
            onStepSelect={goToStep}
            navAriaLabel={t(
              "websiteCms.projects.publicProjectForm.steps.navAria"
            )}
          />
        </div>

        {step === 0 ? (
          <PublicProjectFormStepBasics
            manualPrefillLoading={manualPrefillLoading}
            onLoadFromInternalProject={handleLoadFromInternalProject}
          />
        ) : null}
        {step === 1 ? <PublicProjectFormStepMedia /> : null}
        {step === 2 ? <PublicProjectFormStepLocationDetails /> : null}
        {step === 3 ? <PublicProjectFormStepPublish /> : null}

        <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                disabled={form.submitting}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
              >
                {t("websiteCms.projects.publicProjectForm.steps.back")}
              </Button>
            ) : null}
            {step < lastStep ? (
              <Button
                type="button"
                disabled={form.submitting}
                onClick={() => void goNext()}
              >
                {t("websiteCms.projects.publicProjectForm.steps.next")}
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={form.submitting}
              nativeButton={false}
              render={<Link href="/website/projects" />}
            >
              {t("common.cancel")}
            </Button>
            {step === lastStep ? (
              <Button type="submit" disabled={form.submitting}>
                {form.submitting
                  ? t("websiteCms.projects.publicProjectForm.actions.saving")
                  : isEdit
                    ? t(
                        "websiteCms.projects.publicProjectForm.actions.update"
                      )
                    : t(
                        "websiteCms.projects.publicProjectForm.actions.save"
                      )}
              </Button>
            ) : null}
          </div>
        </div>
      </form>
    </PublicProjectFormProvider>
  )
}
