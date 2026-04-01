"use client"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Link, usePathname } from "@/lib/i18n/navigation"
import { cn } from "@/lib/utils"
import {
  CircleHelp,
  FolderKanban,
  Home,
  Menu,
  Palette,
  PhoneCall,
  Settings,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

const navItems = [
  { href: "/website", key: "nav.home", icon: Home },
  { href: "/website/projects", key: "nav.projects", icon: FolderKanban },
  { href: "/website/about", key: "nav.about", icon: CircleHelp },
  { href: "/website/contact", key: "nav.contact", icon: PhoneCall },
  { href: "/website/settings", key: "nav.settings", icon: Settings },
  { href: "/website/theme", key: "nav.theme", icon: Palette },
]

export function WebsiteDashboardNavbar() {
  const t = useTranslations("websiteCms")
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActivePath = (href: string) => {
    if (href === "/website") {
      return pathname === "/website"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const renderNavLinks = (onClick?: () => void) =>
    navItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        aria-current={isActivePath(item.href) ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 justify-start rounded-lg px-3 text-sm whitespace-nowrap transition-all duration-200",
          isActivePath(item.href)
            ? "bg-primary/10 text-primary ring-primary/20 hover:bg-primary/15 hover:text-primary ring-1"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <item.icon data-icon="inline-start" />
        {t(item.key)}
      </Link>
    ))

  return (
    <>
      <div className="lg:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "justify-start gap-2"
            )}
          >
            <Menu className="size-4" />
            {t("layout.title")}
          </SheetTrigger>
          <SheetContent className="w-full max-w-xs p-0">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle>{t("layout.title")}</SheetTitle>
            </SheetHeader>
            <div className="p-3">
              <nav className="flex flex-col gap-1.5">
                {renderNavLinks(() => setIsMobileMenuOpen(false))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-border/60 hidden h-[calc(100svh-2rem)] overflow-hidden py-0 lg:sticky lg:top-4 lg:block">
        <CardHeader className="space-y-1 px-4 pt-4">
          <CardTitle className="text-base">{t("layout.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-3 py-2">
          <nav className="flex flex-col gap-1.5">{renderNavLinks()}</nav>
        </CardContent>
      </Card>
    </>
  )
}
