import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/admin-sidebar" // New component
import { AdminHeader } from "@/components/admin/admin-header" // New component
import { ThemeAwareMain } from "@/components/theme-aware-main"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This layout assumes an admin user is authenticated.
  // Actual route protection would be handled by middleware.
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <ThemeAwareMain>{children}</ThemeAwareMain>
        </div>
      </div>
    </SidebarProvider>
  )
}
