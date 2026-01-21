"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { WebsitesTable } from "./_components/websites-table"
import { WebsiteDialog } from "./_components/website-dialog"
import type { WebsiteWithLocale } from "@/hooks/use-websites"

export default function WebsitesPage() {
  const t = useTranslations()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedWebsite, setSelectedWebsite] =
    useState<WebsiteWithLocale | null>(null)

  const handleAddNew = () => {
    setSelectedWebsite(null)
    setDialogOpen(true)
  }

  const handleEdit = (website: WebsiteWithLocale) => {
    setSelectedWebsite(website)
    setDialogOpen(true)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("websites.title")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("websites.title")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex grow justify-end gap-2">
          <Button type="button" onClick={handleAddNew}>
            <Plus className="size-4" />
            {t("websites.addNew")}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <WebsitesTable onEdit={handleEdit} />

      <WebsiteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedWebsite={selectedWebsite}
      />
    </div>
  )
}
