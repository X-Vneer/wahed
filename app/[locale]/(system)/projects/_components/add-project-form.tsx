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
import { SubmitButton } from "./submit-button"

function ProjectFormContent() {
  const t = useTranslations()
  const queryClient = useQueryClient()
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
      }

      await axios.post("/api/projects", submitData, {
        withCredentials: true,
      })

      // Success - refresh projects list and reset form
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      form.reset()

      toast.success(t("projects.success.created"))
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
        <Card className="ring-none shadow-none ring-0">
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
        <SubmitButton />
      </FieldGroup>
    </form>
  )
}

export function AddProjectForm() {
  const form = useProjectForm({
    mode: "uncontrolled",
    initialValues: {
      nameAr: "",
      nameEn: "",
      image: "",
      descriptionAr: "",
      descriptionEn: "",
      area: 0,
      numberOfFloors: 0,
      deedNumber: undefined,
      workDuration: undefined,
      googleMapsAddress: "",
      regionId: "",
      cityId: "",
      categoryIds: [] as string[],
      isActive: true,
      attachments: [],
    },
    validate: zod4Resolver(createProjectSchema),
  })

  return (
    <ProjectFormProvider form={form}>
      <ProjectFormContent />
    </ProjectFormProvider>
  )
}
