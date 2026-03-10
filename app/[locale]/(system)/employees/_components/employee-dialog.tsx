"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { User } from "@/prisma/users/select"
import { useTranslations } from "next-intl"
import { UserForm } from "./user-form"

type EmployeeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedUser: User | null
}

export function EmployeeDialog({
  open,
  onOpenChange,
  selectedUser,
}: EmployeeDialogProps) {
  const t = useTranslations()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90svh] flex-col gap-0 bg-white p-0 sm:max-h-[min(640px,80vh)] sm:max-w-2xl [&>button:last-child]:hidden">
        <ScrollArea className="flex max-h-full flex-col overflow-hidden">
          <div className="p-6">
            <DialogHeader className="mb-2">
              <DialogTitle>
                {selectedUser
                  ? t("employees.editTitle")
                  : t("employees.createTitle")}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {selectedUser
                  ? t("employees.editTitle")
                  : t("employees.createTitle")}
              </DialogDescription>
            </DialogHeader>

            <UserForm
              selectedUser={selectedUser}
              onSuccess={() => onOpenChange(false)}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
