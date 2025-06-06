"use client"

// This was your original app/(dashboard)/layout.tsx
// It now acts as the "shell" inside the new dashboard-specific root layout.

import type React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { ThemeAwareMain } from "@/components/theme-aware-main"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/theme-provider"

function DashboardShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const themeContext = useTheme()
  let themeState = "Theme UNINITIALIZED"
  try {
    themeState = `Theme: ${themeContext.theme}, Actual: ${themeContext.actualTheme}`
  } catch (e: any) {
    themeState = `Error in useTheme: ${e.message}`
    console.error("Error calling useTheme in DashboardShellClient:", e)
  }

  console.log(`[CLIENT] DashboardShellClient rendering. Actual Path: ${pathname}. Theme State: ${themeState}`)

  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/goals") &&
    pathname !== "/goals" &&
    !pathname.startsWith("/goals")
  ) {
    console.error(
      `CRITICAL PATH MISMATCH (Shell): window.location.pathname is ${window.location.pathname}, but usePathname() returned: ${pathname}`,
    )
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <ThemeAwareMain>{children}</ThemeAwareMain>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  console.log(`[SERVER] DashboardShell invoked.`)
  return <DashboardShellClient>{children}</DashboardShellClient>
}
