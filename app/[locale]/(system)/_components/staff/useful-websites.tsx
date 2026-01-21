"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useWebsites } from "@/hooks/use-websites"
import type { WebsiteWithLocale } from "@/hooks/use-websites"
import { useTranslations } from "next-intl"
import { ExternalLink } from "lucide-react"

type UsefulWebsitesSliderProps = {
  className?: string
}

function WebsiteCard({ website }: { website: WebsiteWithLocale }) {
  return (
    <Card className="group h-full w-50 bg-transparent p-0 shadow-none">
      <CardContent className="flex items-center justify-center p-0">
        <a
          href={website.url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center"
        >
          <Avatar className="size-40 border-0 transition-transform duration-300 ease-out group-hover:scale-105">
            <AvatarImage src={website.image || ""} alt={website.name} />
            <AvatarFallback className="size-40 bg-white">
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
  return (
    <Card className="h-full">
      <Skeleton className="h-40 w-full" />
      <CardHeader>
        <Skeleton className="mb-2 h-4 w-2/3" />
        <Skeleton className="mb-1 h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-3/4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-20" />
      </CardFooter>
    </Card>
  )
}

export function UsefulWebsitesSlider({ className }: UsefulWebsitesSliderProps) {
  const t = useTranslations()
  const { data, isLoading, isError } = useWebsites({ status: "active" })

  if (isLoading) {
    return (
      <section className={className}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {t("websites.title", { default: "Websites" })}
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <WebsiteCardSkeleton />
          <WebsiteCardSkeleton />
          <WebsiteCardSkeleton />
        </div>
      </section>
    )
  }

  if (isError || !data || data.length === 0) {
    return null
  }

  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t("websites.title")}</h2>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {data.map((website) => (
            <CarouselItem key={website.id}>
              <WebsiteCard website={website} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  )
}
