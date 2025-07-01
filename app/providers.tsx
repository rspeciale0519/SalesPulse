"use client"

import React from "react"
import { NavigationProvider } from "@/components/navigation-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NavigationProvider>
          {children}
          <Toaster position="top-right" richColors />
        </NavigationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
