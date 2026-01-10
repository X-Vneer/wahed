"use client"

import { Card, CardContent } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { handleFormErrors } from "@/lib/handle-form-errors"
import { createProjectSchema } from "@/lib/schemas/project"
import {
  ProjectFormProvider,
  useProjectForm,
  useProjectFormContext,
} from "./project-form-context"
import { useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { GeneralInfoSection } from "./general-info-section"
import { ImageUploadField } from "./image-upload-field"
import { ProjectDetailsSection } from "./project-details-section"
import { GoogleMapsAddressField } from "./google-maps-address-field"
import { InternallyRegisteredField } from "./internally-registered-field"
import { AttachmentsUploadField } from "./attachments-upload-field"
import { AdditionalFieldsSection } from "./additional-fields-section"
import { SubmitButton } from "./submit-button"
import apiClient from "@/services"
import { useRouter } from "@/lib/i18n/navigation"
import type { ProjectInclude } from "@/prisma/projects"
import { useEffect } from "react"

type EditProjectFormProps = {
  project: ProjectInclude
}

function ProjectFormContent({ projectId }: { projectId: string }) {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const router = useRouter()
  const form = useProjectFormContext()

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const submitData = {
        ...values,
        area: values.area ? parseFloat(String(values.area)) : undefined,
        numberOfFloors: values.numberOfFloors
          ? parseInt(String(values.numberOfFloors))
          : undefined,
        image: values.image || undefined,
        categoryIds: values.categoryIds,
        attachments: values.attachments || [],
        additionalFields: values.additionalFields || [],
      }

      await apiClient.put(`/api/projects/${projectId}`, submitData)

      // Success - refresh projects list and navigate back
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })

      toast.success(t("projects.success.updated"))
      router.push(`/projects/${projectId}`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)

        toast.error(rootError || t("errors.internal_server_error"))
        return
      }
      toast.error(t("errors.internal_server_error"))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <FieldGroup>
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex grow flex-col gap-4">
            <Card className="ring-none w-full shadow-none ring-0">
              <CardContent>
                <div className="flex flex-col gap-4">
                  <GeneralInfoSection />
                  <ImageUploadField />
                  <ProjectDetailsSection />
                  <GoogleMapsAddressField />
                  <InternallyRegisteredField />
                </div>
              </CardContent>
            </Card>
            <AttachmentsUploadField />
          </div>
          <div className="lg:w-sm">
            <Card className="ring-none shadow-none ring-0">
              <CardContent>
                <AdditionalFieldsSection />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="grow">
            <SubmitButton />
          </div>
          <div className="lg:w-sm"></div>
        </div>
      </FieldGroup>
    </form>
  )
}

export function EditProjectForm({ project }: EditProjectFormProps) {
  // Transform project data to form initial values
  const initialValues = {
    nameAr: project.nameAr || "",
    nameEn: project.nameEn || "",
    image: project.image || "",
    descriptionAr: project.descriptionAr || "",
    descriptionEn: project.descriptionEn || "",
    area: project.area || 0,
    numberOfFloors: project.numberOfFloors || 0,
    deedNumber: project.deedNumber || undefined,
    workDuration: project.workDuration || undefined,
    googleMapsAddress: project.googleMapsAddress || "",
    regionId: project.city?.regionId || "",
    cityId: project.cityId || "",
    categoryIds: project.categories?.map((cat) => cat.id) || [],
    status: project.status || undefined,
    isActive: project.isActive ?? true,
    attachments:
      project.attachments?.map((att) => ({
        id: att.id,
        fileUrl: att.fileUrl,
        fileName: att.fileName || undefined,
        fileType: att.fileType || undefined,
        fileSize: att.fileSize || undefined,
        additionalInfo: att.additionalInfo || undefined,
      })) || [],
    additionalFields:
      project.additionalData?.map((field) => ({
        id: field.id,
        type: field.type as
          | "date"
          | "number"
          | "text"
          | "textarea"
          | "time"
          | "singleChoice"
          | "multipleChoice",
        label: field.name,
        value: field.value,
        options: field.options ? (field.options as string[]) : undefined,
        min: field.min ?? undefined,
        max: field.max ?? undefined,
        minDate: field.minDate ? new Date(field.minDate) : undefined,
        maxDate: field.maxDate ? new Date(field.maxDate) : undefined,
        placeholder: field.placeholder ?? undefined,
        required: field.required ?? false,
      })) || [],
  }

  const form = useProjectForm({
    mode: "uncontrolled",
    initialValues,
    validate: zod4Resolver(createProjectSchema),
  })

  // Update form values when project data changes
  useEffect(() => {
    form.setValues(initialValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  return (
    <ProjectFormProvider form={form}>
      <ProjectFormContent projectId={project.id} />
    </ProjectFormProvider>
  )
}
