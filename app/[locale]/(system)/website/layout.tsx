"use client"

import { WebsiteDashboardNavbar } from "./_components/website-dashboard-navbar"

type WebsiteDashboardLayoutProps = {
  children: React.ReactNode
}

export default function WebsiteDashboardLayout({
  children,
}: WebsiteDashboardLayoutProps) {
  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
      <WebsiteDashboardNavbar />

      <div className="min-h-[calc(100svh-5.5rem)]">{children}</div>
    </div>
  )
}
