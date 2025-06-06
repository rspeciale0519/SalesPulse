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
    console.log(`[CLIENT] Window location is: ${window.location.pathname}`)

    // Basic check for pathname mismatch
    if (window.location.pathname !== pathname) {
      console.error(
        `[CLIENT] CRITICAL PATH MISMATCH: window.location.pathname is ${window.location.pathname}, but usePathname() returned: ${pathname}`,
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
