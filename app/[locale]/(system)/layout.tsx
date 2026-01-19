/* eslint-disable @next/next/no-img-element */
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "./_components/app-sidebar"
import { LangSwitcher } from "./_components/lang-switcher"
import { LogoutButton } from "./_components/logout-button"

import { QueryClient } from "@tanstack/react-query"
import { getUserDataServerSide } from "@/lib/get-user-data-server-side"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { getAccessTokenPayload } from "@/lib/get-access-token"
import { redirect } from "@/lib/i18n/navigation"
import { getLocale } from "next-intl/server"
import { UserRole } from "@/lib/generated/prisma/enums"
import { logo } from "@/assets"
import StaffHeroSection from "./_components/staff/hero-section"

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const queryClient = new QueryClient()

  // Prefetch user data with permissions on the server
  // Errors are caught by React Query and won't crash the page
  try {
    await queryClient.prefetchQuery({
      queryKey: ["user", "me"],
      queryFn: getUserDataServerSide,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  } catch (error) {
    // Prefetch errors are handled by React Query, but we log them for debugging
    // The page will still render even if prefetch fails
    console.error("Failed to prefetch user data:", error)
  }

  const locale = await getLocale()
  const user = await getAccessTokenPayload()
  if (!user) {
    return redirect({
      href: "/auth/login",
      locale: locale,
    })
  }

  const isStaff = user.role === UserRole.STAFF

  if (isStaff) {
    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <SidebarProvider>
          <SidebarInset className="">
            <header className="flex h-15 shrink-0 items-center justify-between gap-2 bg-white px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div>
                <img
                  src={logo.src}
                  alt={"logo"}
                  className="h-10 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <LogoutButton />
                <LangSwitcher />
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <StaffHeroSection />
              <div className="container mx-auto">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </HydrationBoundary>
    )
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="">
          <header className="flex h-15 shrink-0 items-center justify-between gap-2 bg-white px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ms-1" />
            </div>
            <LangSwitcher />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </HydrationBoundary>
  )
}
