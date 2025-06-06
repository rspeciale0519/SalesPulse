"use client"

import type React from "react"
import { useTheme } from "@/components/theme-provider" // Corrected import
import { cn } from "@/lib/utils"

export function ThemeAwareMain({ children }: { children: React.ReactNode }) {
  let themeContext
  let themeStateMessage = "Theme context not yet initialized or error."
  let actualThemeForClass = "light" // Default to light if context is problematic

  try {
    themeContext = useTheme()
    themeStateMessage = themeContext
      ? `Theme: ${themeContext.theme}, Actual: ${themeContext.actualTheme}`
      : "useTheme() returned undefined context."
    actualThemeForClass = themeContext?.actualTheme || "light"
    if (!themeContext) {
      console.warn("[CLIENT] ThemeAwareMain: useTheme() returned undefined.")
    }
  } catch (e: any) {
    themeContext = undefined // Ensure themeContext is undefined in case of error
    themeStateMessage = `Error in useTheme within ThemeAwareMain: ${e.message}`
    console.error("[CLIENT] ThemeAwareMain: Error calling useTheme():", e)
  }

  console.log(`[CLIENT] ThemeAwareMain rendered. ${themeStateMessage}`)

  // Fallback if theme context is truly broken
  if (!themeContext) {
    return (
      <main className="flex-1 overflow-auto p-6 bg-gray-100 text-black">
        <p>ThemeAwareMain Fallback: Theme context error.</p>
        {children}
      </main>
    )
  }

  return (
    <main
      className={cn(
        "flex-1 overflow-auto p-6 transition-colors duration-300",
        actualThemeForClass === "dark" ? "bg-zinc-900 text-gray-100" : "bg-gray-50 text-gray-900",
      )}
    >
      {children}
    </main>
  )
}
