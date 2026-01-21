"use client"

import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Spinner } from "@/components/ui/spinner"
import { useBanners } from "@/hooks/use-banners"
import type { BannerInclude } from "@/prisma/banners"
import { useLocale, useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import Autoplay from "embla-carousel-autoplay"

function getLocalizedFields(banner: BannerInclude, locale: string) {
  const isAr = locale === "ar"
  const title = isAr ? banner.titleAr : banner.titleEn
  const description = isAr ? banner.descriptionAr : banner.descriptionEn
  return {
    title: title || banner.titleEn || banner.titleAr || "",
    description: description || "",
  }
}

type BannersSliderProps = {
  className?: string
}

export function BannersSlider({ className }: BannersSliderProps) {
  const t = useTranslations()
  const locale = useLocale()
  const { data, isLoading, isError } = useBanners({ status: "active" })

  if (isLoading) {
    return (
      <div
        className={`bg-muted/40 flex h-48 items-center justify-center rounded-xl border ${className || ""}`}
      >
        <Spinner className="mr-2 size-4" />
        <span className="text-muted-foreground text-sm">
          {t("common.loading", { default: "Loading..." })}
        </span>
      </div>
    )
  }

  if (isError || !data?.length) {
    return (
      <div
        className={`bg-muted/40 flex h-48 items-center justify-center rounded-xl border ${className || ""}`}
      >
        <span className="text-muted-foreground text-sm">No banners found</span>
      </div>
    )
  }

  return (
    <section aria-label={t("banners.title")}>
      <Carousel
        className={cn(`relative overflow-hidden rounded-2xl`, className)}
        opts={{ loop: true, direction: locale === "ar" ? "rtl" : "ltr" }}
        plugins={[
          Autoplay({
            delay: 8000,
          }),
        ]}
      >
        <CarouselContent>
          {data.map((banner) => {
            const { title, description } = getLocalizedFields(banner, locale)
            const hasDownload = Boolean(banner.content)

            return (
              <CarouselItem key={banner.id}>
                <div className="relative overflow-hidden rounded-2xl">
                  {banner.image && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${banner.image})` }}
                      aria-hidden="true"
                    />
                  )}

                  {/* Dark overlay to keep text readable on top of the background image */}
                  <div
                    className="absolute inset-0 bg-linear-to-r from-black/60 via-black/40 to-black/20"
                    aria-hidden="true"
                  />

                  <div className="relative flex items-end justify-between gap-6 p-6 md:p-10">
                    <div className="flex h-full min-h-[120px] flex-col justify-between gap-3 md:col-span-2">
                      <h2 className="text-primary-foreground line-clamp-2 text-2xl leading-snug font-semibold text-balance md:text-3xl">
                        {title}
                      </h2>
                      {description && (
                        <p className="text-primary-foreground/90 line-clamp-3 text-sm text-balance md:text-base">
                          {description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {hasDownload && (
                        <Button
                          nativeButton={false}
                          render={
                            <a
                              href={banner.content || undefined}
                              target="_blank"
                              rel="noreferrer"
                              download
                            >
                              {t("banners.download")}
                            </a>
                          }
                          className="min-w-32"
                        ></Button>
                      )}
                    </div>
                  </div>
                </div>
              </CarouselItem>
            )
          })}
        </CarouselContent>

        {data.length > 1 && (
          <>
            <CarouselPrevious aria-label={t("common.previous")} />
            <CarouselNext aria-label={t("common.next")} />
          </>
        )}
      </Carousel>
    </section>
  )
}

export default BannersSlider
