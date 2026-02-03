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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import UsersSelect from "@/components/users-select"
import { useTaskStatuses } from "@/hooks/use-task-status"
import { useTaskCategories } from "@/hooks/use-task-category"
import { handleFormErrors } from "@/lib/handle-form-errors"
import {
  createTaskSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/lib/schemas/task"
import type { Task } from "@/prisma/tasks"
import apiClient from "@/services"
import { useForm } from "@mantine/form"
import { zod4Resolver } from "mantine-form-zod-resolver"
import { useQueryClient } from "@tanstack/react-query"
import { useTranslations } from "next-intl"
import axios from "axios"
import { useEffect } from "react"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

type TaskDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  task?: Task | null
}

type SubTaskFormValue = {
  title: string
  description?: string
}

type TaskFormValues = Omit<CreateTaskInput, "subTasks" | "projectId"> & {
  projectId: string
  subTasks: SubTaskFormValue[]
}

const PRIORITY_OPTIONS: {
  value: CreateTaskInput["priority"]
  labelKey: string
}[] = [
  { value: "LOW", labelKey: "tasks.priority.low" },
  { value: "MEDIUM", labelKey: "tasks.priority.medium" },
  { value: "HIGH", labelKey: "tasks.priority.high" },
]

export function TaskDialog({
  open,
  onOpenChange,
  projectId,
  task: taskToEdit,
}: TaskDialogProps) {
  const isEditMode = !!taskToEdit
  const t = useTranslations()
  const queryClient = useQueryClient()

  const { data: statusRes } = useTaskStatuses()
  const { data: categoryRes } = useTaskCategories()

  const statuses = statusRes?.data?.data ?? []
  const categories = categoryRes?.data?.data ?? []

  const form = useForm<TaskFormValues>({
    mode: "controlled",
    initialValues: {
      title: "",
      description: "",
      projectId: projectId,
      statusId: "",
      categoryIds: [],
      estimatedWorkingDays: undefined,
      priority: "MEDIUM",
      assignedToIds: [],
      subTasks: [],
      saveAsTemplate: false,
    },
    validate: zod4Resolver(
      createTaskSchema.extend({
        projectId: createTaskSchema.shape.projectId,
        subTasks: createTaskSchema.shape.subTasks,
      })
    ),
  })

  useEffect(() => {
    if (!open) return
    if (taskToEdit) {
      form.setValues({
        title: taskToEdit.title,
        description: taskToEdit.description ?? "",
        projectId,
        statusId: taskToEdit.status.id,
        categoryIds: taskToEdit.category.map((c) => c.id),
        estimatedWorkingDays: taskToEdit.estimatedWorkingDays ?? undefined,
        priority: taskToEdit.priority ?? "MEDIUM",
        assignedToIds: taskToEdit.assignedTo?.map((u) => u.id) ?? [],
        subTasks:
          taskToEdit.subTasks?.map((s) => ({
            title: s.title,
            description: s.description ?? undefined,
          })) ?? [],
        saveAsTemplate: false,
      })
    } else {
      form.setValues({
        title: "",
        description: "",
        projectId,
        statusId: "",
        categoryIds: [],
        estimatedWorkingDays: undefined,
        priority: "MEDIUM",
        assignedToIds: [],
        subTasks: [],
        saveAsTemplate: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId, taskToEdit?.id])

  const handleSubmit = async (values: TaskFormValues) => {
    try {
      if (isEditMode && taskToEdit) {
        const payload: UpdateTaskInput = {
          title: values.title.trim(),
          description: values.description?.trim() || null,
          statusId: values.statusId || undefined,
          categoryIds: values.categoryIds ?? [],
          estimatedWorkingDays:
            values.estimatedWorkingDays != null
              ? Number(values.estimatedWorkingDays)
              : undefined,
          priority: values.priority ?? "MEDIUM",
          assignedToIds: values.assignedToIds ?? [],
        }

        await apiClient.patch(`/api/tasks/${taskToEdit.id}`, payload)

        queryClient.invalidateQueries({
          queryKey: ["project-tasks", values.projectId],
        })

        toast.success(
          t("tasks.success.updated", {
            default: "Task updated successfully",
          })
        )
        onOpenChange(false)
        return
      }

      const payload: CreateTaskInput = {
        title: values.title,
        description: values.description || undefined,
        projectId: values.projectId,
        statusId: values.statusId,
        categoryIds: values.categoryIds ?? [],
        estimatedWorkingDays:
          values.estimatedWorkingDays != null
            ? Number(values.estimatedWorkingDays)
            : undefined,
        priority: values.priority ?? "MEDIUM",
        assignedToIds: values.assignedToIds ?? [],
        subTasks:
          values.subTasks?.length > 0
            ? values.subTasks
                .filter((s) => s.title.trim() !== "")
                .map((s) => ({
                  title: s.title.trim(),
                  description: s.description?.trim() || undefined,
                }))
            : [],
        saveAsTemplate: values.saveAsTemplate ?? false,
      }

      await apiClient.post("/api/tasks", payload)

      queryClient.invalidateQueries({
        queryKey: ["project-tasks", values.projectId],
      })

      toast.success(
        t("tasks.success.created", {
          default: "Task created successfully",
        })
      )
      form.reset()
      onOpenChange(false)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const rootError = handleFormErrors(error, form)
        form.setFieldError(
          "root",
          rootError ?? t("errors.internal_server_error")
        )
        toast.error(rootError ?? t("errors.internal_server_error"))
        return
      }

      toast.error(t("errors.internal_server_error"))
      form.setFieldError(
        "root",
        (error as Error).message ?? t("errors.internal_server_error")
      )
    }
  }

  const addSubTask = () => {
    form.insertListItem("subTasks", { title: "", description: "" })
  }

  const removeSubTask = (index: number) => {
    const items = form.values.subTasks
    if (items.length === 0) return
    form.removeListItem("subTasks", index)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 bg-white p-0 sm:max-h-[min(640px,80vh)] sm:max-w-xl [&>button:last-child]:hidden">
        <DialogClose />
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <div className="p-4">
            <DialogHeader className="mb-2">
              <DialogTitle className="text-lg font-bold">
                {isEditMode
                  ? t("tasks.edit", { default: "Edit task" })
                  : t("sidebar.tasksAdd")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {isEditMode
                  ? t("tasks.edit", { default: "Edit task" })
                  : t("sidebar.tasksAdd")}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={form.onSubmit(handleSubmit)}
              className="flex flex-col gap-4"
            >
              <FieldGroup>
                <Field data-invalid={!!form.errors.title}>
                  <FieldLabel htmlFor="title">
                    {t("tasks.form.title", { default: "Task title" })}
                  </FieldLabel>
                  <Input
                    id="title"
                    {...form.getInputProps("title")}
                    placeholder={t("tasks.form.titlePlaceholder", {
                      default: "Enter task title",
                    })}
                    aria-invalid={!!form.errors.title}
                  />
                  {form.errors.title && (
                    <FieldError
                      errors={[{ message: String(form.errors.title) }]}
                    />
                  )}
                </Field>

                <Field data-invalid={!!form.errors.description}>
                  <FieldLabel htmlFor="description">
                    {t("tasks.form.description", { default: "Description" })}
                  </FieldLabel>
                  <Textarea
                    id="description"
                    {...form.getInputProps("description")}
                    placeholder={t("tasks.form.descriptionPlaceholder")}
                    className="min-h-20"
                    aria-invalid={!!form.errors.description}
                  />
                  {form.errors.description && (
                    <FieldError
                      errors={[{ message: String(form.errors.description) }]}
                    />
                  )}
                </Field>

                <Field data-invalid={!!form.errors.statusId}>
                  <FieldLabel htmlFor="statusId">
                    {t("tasks.form.status")}
                  </FieldLabel>
                  <Select
                    value={form.values.statusId}
                    onValueChange={(value) =>
                      form.setFieldValue("statusId", value ?? "")
                    }
                  >
                    <SelectTrigger className="w-full" id="statusId">
                      <SelectValue
                        placeholder={t("tasks.form.statusPlaceholder")}
                      >
                        {form.values.statusId
                          ? (() => {
                              const s = statuses.find(
                                (x) => x.id === form.values.statusId
                              )
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
                  {form.errors.statusId && (
                    <FieldError
                      errors={[{ message: String(form.errors.statusId) }]}
                    />
                  )}
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field data-invalid={!!form.errors.estimatedWorkingDays}>
                    <FieldLabel htmlFor="estimatedWorkingDays">
                      {t("tasks.form.estimatedWorkingDays")}
                    </FieldLabel>
                    <Input
                      id="estimatedWorkingDays"
                      type="number"
                      min={0}
                      {...form.getInputProps("estimatedWorkingDays")}
                      placeholder={t(
                        "tasks.form.estimatedWorkingDaysPlaceholder"
                      )}
                      aria-invalid={!!form.errors.estimatedWorkingDays}
                    />
                    {form.errors.estimatedWorkingDays && (
                      <FieldError
                        errors={[
                          {
                            message: String(form.errors.estimatedWorkingDays),
                          },
                        ]}
                      />
                    )}
                  </Field>

                  <Field data-invalid={!!form.errors.priority}>
                    <FieldLabel htmlFor="priority">
                      {t("tasks.form.priority.label")}
                    </FieldLabel>
                    <Select
                      value={form.values.priority ?? "MEDIUM"}
                      onValueChange={(value) =>
                        form.setFieldValue(
                          "priority",
                          value as CreateTaskInput["priority"]
                        )
                      }
                    >
                      <SelectTrigger className="w-full" id="priority">
                        <SelectValue
                          placeholder={t("tasks.form.priority.placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent alignItemWithTrigger={false}>
                        {PRIORITY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value ?? ""}>
                            {t(opt.labelKey)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.errors.priority && (
                      <FieldError
                        errors={[{ message: String(form.errors.priority) }]}
                      />
                    )}
                  </Field>
                </div>

                <Field data-invalid={!!form.errors.categoryIds}>
                  <FieldLabel htmlFor="categoryIds">
                    {t("tasks.form.categories")}
                  </FieldLabel>
                  <Select
                    multiple
                    value={form.values.categoryIds ?? []}
                    onValueChange={(value) =>
                      form.setFieldValue("categoryIds", value ?? [])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {form.values.categoryIds &&
                        form.values.categoryIds.length > 0
                          ? categories
                              .filter((c) =>
                                form.values.categoryIds?.includes(c.id)
                              )
                              .map((c) => c.name)
                              .join(", ")
                          : t("tasks.form.categoriesPlaceholder", {
                              default: "Select categories",
                            })}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.errors.categoryIds && (
                    <FieldError
                      errors={[
                        { message: String(form.errors.categoryIds as string) },
                      ]}
                    />
                  )}
                </Field>

                <UsersSelect<TaskFormValues>
                  form={form}
                  name="assignedToIds"
                  label={t("tasks.form.assignees")}
                  publicLabel={t("tasks.form.assigneesPublic")}
                  multiple
                  onValueChange={(value) =>
                    form.setFieldValue(
                      "assignedToIds",
                      Array.isArray(value) ? value : [value]
                    )
                  }
                />

                {!isEditMode && (
                  <Field>
                    <div className="flex items-center justify-between gap-2">
                      <FieldLabel htmlFor="saveAsTemplate">
                        {t("tasks.form.saveAsTemplate")}
                      </FieldLabel>
                      <Switch
                        id="saveAsTemplate"
                        checked={form.values.saveAsTemplate ?? false}
                        onCheckedChange={(checked) =>
                          form.setFieldValue("saveAsTemplate", checked)
                        }
                      />
                    </div>
                  </Field>
                )}
              </FieldGroup>

              {!isEditMode && (
                <>
                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <FieldLabel>{t("tasks.form.subTasks")}</FieldLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSubTask}
                      >
                        <Plus className="mr-1 size-4" />
                        {t("common.add")}
                      </Button>
                    </div>

                    {form.values.subTasks?.length > 0 && (
                  <div className="space-y-3">
                    {form.values.subTasks.map((_, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 space-y-2 rounded-lg border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground text-xs font-medium">
                            #{index + 1}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => removeSubTask(index)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>

                        <Field>
                          <FieldLabel className="text-xs">
                            {t("tasks.form.subTaskTitle")}
                          </FieldLabel>
                          <Input
                            {...form.getInputProps(`subTasks.${index}.title`)}
                            placeholder={t(
                              "tasks.form.subTaskTitlePlaceholder"
                            )}
                          />
                        </Field>

                        <Field>
                          <FieldLabel className="text-xs">
                            {t("tasks.form.subTaskDescription")}
                          </FieldLabel>
                          <Input
                            {...form.getInputProps(
                              `subTasks.${index}.description`
                            )}
                            placeholder={t(
                              "tasks.form.subTaskDescriptionPlaceholder"
                            )}
                          />
                        </Field>
                      </div>
                    ))}
                  </div>
                    )}
                  </div>
                </>
              )}

              {form.errors.root && (
                <div className="text-destructive text-sm font-medium">
                  {form.errors.root}
                </div>
              )}

              <div className="mt-4 flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="min-w-28 grow sm:grow-0"
                  onClick={() => onOpenChange(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  className="min-w-28 grow sm:grow-0"
                  type="submit"
                  disabled={form.submitting}
                >
                  {form.submitting && <Spinner className="mr-2 size-4" />}
                  {isEditMode
                    ? t("tasks.save", { default: "Save" })
                    : t("tasks.create")}
                </Button>
              </div>
            </form>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
