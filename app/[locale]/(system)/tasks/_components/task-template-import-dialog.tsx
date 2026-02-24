"use client"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useQueryClient } from "@tanstack/react-query"
import { useTaskStatuses } from "@/hooks/use-task-status"
import type { TaskTemplate } from "@/prisma/task-templates"
import apiClient from "@/services"
import axios from "axios"
import { toast } from "sonner"

type TaskTemplateImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string | null
}

export function TaskTemplateImportDialog({
  open,
  onOpenChange,
  projectId,
}: TaskTemplateImportDialogProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [statusId, setStatusId] = useState<string>("")
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rootError, setRootError] = useState<string | null>(null)

  const { data: statusRes } = useTaskStatuses()
  const statuses = statusRes?.data?.data ?? []

  useEffect(() => {
    if (!open) return

    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true)
        setRootError(null)
        const response = await apiClient.get("/api/tasks/templates", {
          params: {
            status: "active",
            per_page: 100,
          },
        })

        const resData = response.data as {
          data: TaskTemplate[]
        }

        setTemplates(resData.data ?? [])
      } catch (error) {
        console.error("Error fetching task templates", error)
        setRootError(t("errors.internal_server_error"))
      } finally {
        setLoadingTemplates(false)
      }
    }

    // reset selection every time dialog is opened
    setSelectedTemplateIds([])
    setStatusId("")
    fetchTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggleTemplateSelection = (id: string, checked: boolean | string) => {
    const isChecked = checked === true
    setSelectedTemplateIds((prev) =>
      isChecked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setRootError(null)

      if (selectedTemplateIds.length === 0) {
        setRootError(t("tasks.errors.templates_required", { default: "" }))
        setSubmitting(false)
        return
      }

      const payload = {
        projectId: projectId ?? null,
        templateIds: selectedTemplateIds,
        statusId: statusId || undefined,
      }

      await apiClient.post("/api/tasks/import-from-templates", payload)

      if (projectId) {
        await queryClient.invalidateQueries({
          queryKey: ["project-tasks", projectId],
        })
      } else {
        await queryClient.invalidateQueries({
          queryKey: ["general-tasks"],
        })
      }

      toast.success(
        t("tasks.success.importedFromTemplates", {
          default: "Tasks imported from templates successfully",
        })
      )

      onOpenChange(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { error?: string })?.error ??
          t("errors.internal_server_error")
        setRootError(message)
        toast.error(message)
        setSubmitting(false)
        return
      }

      console.error("Error importing tasks from templates", error)
      const message = t("errors.internal_server_error")
      setRootError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 bg-white p-0 sm:max-h-[min(640px,80vh)] sm:max-w-xl [&>button:last-child]:hidden">
        <DialogClose />
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <div className="p-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-bold">
                {t("tasks.addFromSystem")}
              </DialogTitle>
              <DialogDescription>
                {t("tasks.importFromTemplatesDescription", {
                  default:
                    "Select one or more templates to create tasks in this project.",
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <FieldGroup>
                <Field data-invalid={!!rootError && !statusId}>
                  <FieldLabel>{t("tasks.form.status")}</FieldLabel>
                  <Select
                    value={statusId}
                    onValueChange={(value) => setStatusId(value ?? "")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("tasks.form.statusPlaceholder")}
                      >
                        {statusId
                          ? (() => {
                              const s = statuses.find((x) => x.id === statusId)
                              return s ? (
                                <span className="flex items-center gap-2">
                                  <span
                                    className="inline-block size-3 shrink-0 rounded-full"
                                    style={
                                      s.color
                                        ? { backgroundColor: s.color }
                                        : undefined
                                    }
                                  />
                                  {s.name}
                                </span>
                              ) : null
                            })()
                          : null}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {statuses.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className="inline-block size-3 shrink-0 rounded-full"
                              style={
                                s.color
                                  ? { backgroundColor: s.color }
                                  : undefined
                              }
                            />
                            {s.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field
                  data-invalid={!!rootError && selectedTemplateIds.length === 0}
                >
                  <FieldLabel>{t("tasks.addFromSystem")}</FieldLabel>
                  <div className="mt-1 max-h-64 space-y-2 overflow-auto rounded-md border p-2">
                    {loadingTemplates && (
                      <div className="flex items-center justify-center py-4">
                        <Spinner className="me-2 size-4" />
                        <span className="text-muted-foreground text-sm">
                          {t("common.loading")}
                        </span>
                      </div>
                    )}

                    {!loadingTemplates && templates.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        {t("taskTemplate.emptyMessage", {
                          default: "No templates found.",
                        })}
                      </p>
                    )}

                    {!loadingTemplates &&
                      templates.map((template) => {
                        const checked = selectedTemplateIds.includes(
                          template.id
                        )
                        return (
                          <label
                            key={template.id}
                            className="hover:bg-muted flex cursor-pointer items-start gap-2 rounded-md p-2 transition-colors"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleTemplateSelection(template.id, value)
                              }
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-sm font-medium">
                                  {template.title}
                                </span>
                              </div>
                              {template.description && (
                                <p className="text-muted-foreground text-xs">
                                  {template.description}
                                </p>
                              )}
                            </div>
                          </label>
                        )
                      })}
                  </div>
                </Field>
              </FieldGroup>

              {rootError && (
                <FieldError
                  errors={[
                    {
                      message: rootError,
                    },
                  ]}
                />
              )}

              <div className="mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-28 grow sm:grow-0"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="min-w-28 grow sm:grow-0"
                  type="button"
                  disabled={submitting || selectedTemplateIds.length === 0}
                  onClick={handleSubmit}
                >
                  {submitting && <Spinner className="mr-2 size-4" />}
                  {t("tasks.addFromSystem")}
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
