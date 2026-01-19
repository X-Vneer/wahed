import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import db from "@/lib/db"
import { bannerInclude, type BannerInclude } from "@/prisma/banners"
import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { BannerFormContent } from "../../_components/banner-form"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "@/lib/i18n/navigation"

type EditBannerPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditBannerPage(props: EditBannerPageProps) {
  const params = await props.params
  const { locale, id } = params

  const t = await getTranslations({ locale })

  const banner = (await db.banner.findUnique({
    where: { id },
    include: bannerInclude,
  })) as BannerInclude | null

  if (!banner) {
    notFound()
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{t("banners.editTitle")}</h1>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}`}>
                {t("sidebar.home")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/${locale}/staff/banners`}>
                {t("banners.title")}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t("banners.editTitle")}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card>
        <CardContent>
          <BannerFormContent selectedBanner={banner} />
        </CardContent>
      </Card>
    </div>
  )
}
