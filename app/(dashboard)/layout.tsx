"use client"

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { ThemeAwareMain } from "@/components/theme-aware-main"
import { usePathname } from "next/navigation"
import { useNavigationState } from "@/hooks/use-navigation-state"

// All in a single file for now to minimize complexity
function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { userExpandedItems } = useNavigationState()

  console.log(`[CLIENT] DashboardLayout rendering for pathname: ${pathname}`)

  // Window check for safety in SSR
  if (typeof window !== "undefined") {
    // Uncomment for debugging
    // console.log(`[CLIENT] Window location is: ${window.location.pathname}`)
    
    // Dashboard related paths can differ between window.location.pathname and usePathname()
    // due to Next.js routing and layout structure, but they're still valid routes
    // This suppresses unnecessary error messages for dashboard pages
    
    // List of valid dashboard page paths that might appear in usePathname()
    const validDashboardPages = [
      '/dashboard', '/goals', '/activity', '/contacts', '/settings', 
      '/reports', '/calendar', '/commissions', '/leads', '/tasks'
    ];
    
    // Prevent error messages for valid dashboard navigation
    // We don't need to log these discrepancies as they're expected with our routing structure
    const windowPath = window.location.pathname;
    const isDashboardNavigation = (
      // Either window or current path is in dashboard context
      (windowPath === '/dashboard' || windowPath.startsWith('/dashboard/')) ||
      validDashboardPages.some(page => pathname === page)
    );
    
    // Only log errors for true path mismatches outside of dashboard navigation
    if (windowPath !== pathname && !isDashboardNavigation) {
      console.error(
        `[CLIENT] PATH MISMATCH: window.location.pathname is ${windowPath}, but usePathname() returned: ${pathname}`,
      )
    }
  }

  return (
    <div className="w-full min-h-screen flex">
      {/* We're explicitly adding data attributes to help with debugging */}
      <aside data-testid="dashboard-sidebar" className="dashboard-sidebar">
        <AppSidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <header data-testid="dashboard-header" className="dashboard-header">
          <Header />
        </header>
        <ThemeAwareMain>{children}</ThemeAwareMain>
      </div>
    </div>
  )
}

// Server Component wrapper for potential future server-side logic
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log(`[SERVER] DashboardLayout invoked.`)
  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </SidebarProvider>
  )
}
