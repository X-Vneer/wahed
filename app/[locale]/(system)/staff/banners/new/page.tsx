"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { BannerFormContent } from "../_components/banner-form"
import { useTranslations } from "next-intl"
import { useRouter } from "@/lib/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"

export default function NewBannerPage() {
  const t = useTranslations()
  const router = useRouter()

  const handleSuccess = () => {
    router.push("/staff/banners")
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("banners.createTitle")}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">{t("sidebar.home")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="../..">{t("banners.title")}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("banners.createTitle")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent>
          <BannerFormContent selectedBanner={null} />
        </CardContent>
      </Card>
    </div>
  )
}
