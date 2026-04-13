"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/prisma/contacts"
import { useTranslations } from "next-intl"
import { format } from "date-fns"
import { useEffect } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/services"

type ContactDetailModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact: Contact | null
}

export function ContactDetailModal({
  open,
  onOpenChange,
  contact,
}: ContactDetailModalProps) {
  const t = useTranslations()
  const queryClient = useQueryClient()

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/api/contacts/${id}`, {
        isRead: true,
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })

  useEffect(() => {
    if (open && contact && !contact.isRead) {
      markAsReadMutation.mutate(contact.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contact?.id])

  if (!contact) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("contacts.detail.title")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{contact.fullName}</h3>
            <Badge variant={contact.isRead ? "secondary" : "default"}>
              {contact.isRead
                ? t("contacts.status.read")
                : t("contacts.status.unread")}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">
                {t("contacts.detail.firstName")}
              </p>
              <p className="font-medium">{contact.firstName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                {t("contacts.detail.lastName")}
              </p>
              <p className="font-medium">{contact.lastName}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                {t("contacts.detail.email")}
              </p>
              <p className="font-medium">{contact.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">
                {t("contacts.detail.phone")}
              </p>
              <p className="font-medium">{contact.phone}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">
                {t("contacts.detail.source")}
              </p>
              <Badge
                variant={
                  contact.source === "project" ? "outline" : "secondary"
                }
              >
                {contact.source === "project"
                  ? t("contacts.source.project")
                  : t("contacts.source.general")}
              </Badge>
            </div>
            {contact.projectSlug ? (
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("contacts.detail.projectSlug")}
                </p>
                <p className="font-medium">{contact.projectSlug}</p>
              </div>
            ) : null}
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-sm">
              {t("contacts.detail.message")}
            </p>
            <p className="bg-muted rounded-md p-3 whitespace-pre-wrap">
              {contact.message}
            </p>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">
              {t("contacts.detail.receivedAt")}
            </p>
            <p className="font-medium">
              {format(new Date(contact.createdAt), "MMM dd, yyyy HH:mm")}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
