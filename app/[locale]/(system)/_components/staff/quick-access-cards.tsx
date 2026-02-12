"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card"
import { Link, useRouter } from "@/lib/i18n/navigation"
import {
  Calculator,
  ChevronRight,
  Folder,
  LogInIcon,
  LucideIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

interface QuickAccessCardData {
  icon: LucideIcon
  titleKey: string
  href: string
  linkTextKey: string
}

interface QuickAccessCardProps {
  icon: LucideIcon
  title: string
  href: string
  linkText: string
}

function QuickAccessCard({
  icon: Icon,
  title,
  href,
  linkText,
}: QuickAccessCardProps) {
  const router = useRouter()
  return (
    <Card className="cursor-pointer gap-0 p-0">
      <CardContent
        onClick={() => router.push(href)}
        className="flex h-full flex-col items-center justify-center space-y-2 py-6 lg:py-10"
      >
        <Icon className="text-foreground size-6 stroke-1 md:size-9" />
        <div className="text-center">
          <CardTitle className="text-xs font-medium md:text-base">
            {title}
          </CardTitle>
        </div>
      </CardContent>
      <CardFooter className="hidden p-1 md:block">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between py-2 text-xs font-normal text-[#949495]"
          nativeButton={false}
          render={
            <Link href={href} className="flex items-center">
              {linkText}
              <ChevronRight className="ms-1 size-3 rtl:rotate-180" />
            </Link>
          }
        />
      </CardFooter>
    </Card>
  )
}

export function QuickAccessCards() {
  const t = useTranslations("welcome.staff.home")

  const cards: QuickAccessCardData[] = [
    {
      icon: Folder,
      titleKey: "quickAccess.fileManager",
      href: "/files",
      linkTextKey: "quickAccess.goToFiles",
    },
    {
      icon: LogInIcon,
      titleKey: "quickAccess.attendance",
      href: "/attendance",
      linkTextKey: "quickAccess.goToAttendance",
    },
    {
      icon: Calculator,
      titleKey: "quickAccess.accounting",
      href: "/accounting",
      linkTextKey: "quickAccess.goToAccounting",
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <QuickAccessCard
          key={card.href}
          icon={card.icon}
          title={t(card.titleKey)}
          href={card.href}
          linkText={t(card.linkTextKey)}
        />
      ))}
    </div>
  )
}
