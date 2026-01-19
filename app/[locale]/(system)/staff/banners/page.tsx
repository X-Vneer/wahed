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
import { Link } from "@/lib/i18n/navigation"
import { Plus } from "lucide-react"
import { useTranslations } from "next-intl"
import { BannersTable } from "./_components/banners-table"

export default function BannersPage() {
  const t = useTranslations()

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Header */}

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{t("banners.title")}</h1>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("banners.title")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex grow justify-end gap-2">
          <Button
            nativeButton={false}
            render={
              <Link href="/staff/banners/new">
                <Plus className="size-4" />
                {t("banners.addNew")}
              </Link>
            }
          />
        </div>
      </div>

      {/* Main Content */}
      <BannersTable />
    </div>
  )
}
