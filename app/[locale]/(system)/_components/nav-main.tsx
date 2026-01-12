"use client"

import { ChevronRight } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Link, usePathname } from "@/lib/i18n/navigation"
import { useTranslations } from "next-intl"

type IconDefinition = React.ElementType

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: IconDefinition
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}) {
  const t = useTranslations("sidebar")
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{t("system")}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.items && item.items.length > 0) {
            // Check if any sub-item is active
            const hasActiveSubItem = item.items.some(
              (subItem) => pathname === subItem.url
            )
            const isOpen = item.isActive || hasActiveSubItem

            return (
              <SidebarMenuItem key={item.title}>
                <Collapsible defaultOpen={isOpen} className="group/collapsible">
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        tooltip={item.title}
                        isActive={item.isActive || hasActiveSubItem}
                      >
                        {item.icon && <item.icon className="size-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ms-auto size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90! rtl:rotate-180" />
                      </SidebarMenuButton>
                    }
                  />
                  <CollapsibleContent className={"py-2"}>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubItemActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              className="text-muted-foreground text-sm"
                              size="md"
                              isActive={isSubItemActive}
                              render={
                                <Link
                                  href={subItem.url}
                                  onClick={handleLinkClick}
                                >
                                  {subItem.title}
                                </Link>
                              }
                            />
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            )
          } else {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={
                    <Link href={item.url} onClick={handleLinkClick}>
                      {item.icon && <item.icon className="size-4" />}

                      {item.title}
                    </Link>
                  }
                  isActive={item.isActive}
                ></SidebarMenuButton>
              </SidebarMenuItem>
            )
          }
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
