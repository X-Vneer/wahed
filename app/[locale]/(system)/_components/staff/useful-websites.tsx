"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import { useWebsites } from "@/hooks/use-websites"
import { ExternalLink } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

function WebsiteCard({ website }: { website: WebsiteWithLocale }) {
  return (
    <Card className="group h-full w-40 bg-transparent p-2 shadow-none lg:w-50">
      <CardContent className="flex items-center justify-center p-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center"
        >
          <Avatar className="size-32 border-0 transition-transform duration-300 ease-out group-hover:scale-105 lg:size-40">
            <AvatarImage src={website.image || ""} alt={website.name} />
            <AvatarFallback className="size-32 bg-white lg:size-40">
              {website.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 ease-out group-hover:opacity-100">
            <p className="text-primary mx-3 flex items-center gap-1 text-center text-xs font-semibold">
              {website.name}
              <ExternalLink className="size-4" />
            </p>
          </div>
        </a>
      </CardContent>
    </Card>
  )
}

function WebsiteCardSkeleton() {
  return <Skeleton className="size-32 rounded-full bg-white lg:size-40" />
}

export function UsefulWebsitesSlider() {
  const t = useTranslations()
  const { data, status } = useWebsites({ status: "active" })
  const locale = useLocale()
  if (status === "error") {
    return (
      <div>
        <p className="text-destructive text-sm">
          {t("something wrong happened")}
        </p>
      </div>
    )
  }

  if (data?.length === 0) return null

  return (
    <section className="mb-7 w-full select-none">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("websites.title")}</h2>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          direction: locale === "ar" ? "rtl" : "ltr",
        }}
      >
        <CarouselPrevious className="top-[unset] -bottom-10 left-[calc(50%-30px)] z-10 bg-white" />
        <CarouselNext className="top-[unset] right-[calc(50%-30px)] -bottom-10 z-10 bg-white" />
        <CarouselContent>
          {status === "success"
            ? data &&
              data.map((website) => (
                <CarouselItem className="max-w-fit pl-0" key={website.id}>
                  <WebsiteCard website={website} />
                </CarouselItem>
              ))
            : null}
          {status === "pending"
            ? Array.from({ length: 5 }).map((_, index) => (
                <CarouselItem className="max-w-fit" key={index}>
                  <WebsiteCardSkeleton />
                </CarouselItem>
              ))
            : null}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
