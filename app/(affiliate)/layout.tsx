import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar" // Assuming this can be reused or a similar one created
import { AffiliateSidebar } from "@/components/affiliate/affiliate-sidebar" // New component
import { AffiliateHeader } from "@/components/affiliate/affiliate-header" // New component
import { ThemeAwareMain } from "@/components/theme-aware-main" // Reusable

export default function AffiliateDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout assumes an affiliate user is authenticated.
  // Actual route protection would be handled by middleware.
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AffiliateSidebar />
        <div className="flex-1 flex flex-col">
          <AffiliateHeader />
          <ThemeAwareMain>{children}</ThemeAwareMain>
        </div>
      </div>
    </SidebarProvider>
  )
}
