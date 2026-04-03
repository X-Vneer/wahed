/* eslint-disable @next/next/no-img-element -- CMS cover URLs are dynamic / arbitrary hosts */
"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Building2 } from "lucide-react"

export type WebsiteProjectCardVariant = "published" | "draft"

export type WebsiteProjectCardProps = {
  title: string
  description: string
  status: string
  variant: WebsiteProjectCardVariant
  /** Shown on the primary badge (on site / draft). */
  stateBadgeLabel: string
  /** Optional cover image URL; placeholder art is used when empty. */
  coverImage?: string
  className?: string
}

export function WebsiteProjectCard({
  title,
  description,
  status,
  variant,
  stateBadgeLabel,
  coverImage,
  className,
}: WebsiteProjectCardProps) {
  const isDraft = variant === "draft"

  return (
    <Card
      className={cn(
        "group overflow-hidden py-0 transition-[box-shadow,ring-color] duration-200",
        "hover:shadow-md hover:ring-foreground/15",
        isDraft &&
          "bg-muted/25 ring-muted-foreground/15 hover:ring-muted-foreground/25",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <div
          className={cn(
            "relative isolate h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-44 sm:min-h-38",
            isDraft
              ? "bg-linear-to-br from-muted via-muted/80 to-muted-foreground/15"
              : "bg-linear-to-br from-primary/15 via-primary/8 to-accent/20"
          )}
        >
          {coverImage ? (
            // CMS / upload URLs are not known at build time; avoid next/image remote config.
            <img
              src={coverImage}
              alt=""
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              aria-hidden
            >
              <div
                className={cn(
                  "flex size-16 items-center justify-center rounded-2xl shadow-sm ring-1 ring-inset",
                  isDraft
                    ? "bg-background/60 text-muted-foreground ring-foreground/10"
                    : "bg-background/70 text-primary ring-primary/15"
                )}
              >
                <Building2 className="size-8 opacity-90" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <h3 className="text-foreground text-lg leading-snug font-semibold tracking-tight sm:min-w-0 sm:flex-1">
              {title}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:max-w-[50%] sm:shrink-0 sm:justify-end">
              <Badge
                variant={isDraft ? "outline" : "default"}
                className="font-medium"
              >
                {stateBadgeLabel}
              </Badge>
              <Badge variant="secondary" className="font-normal">
                {status}
              </Badge>
            </div>
          </div>
          {description ? (
            <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}
