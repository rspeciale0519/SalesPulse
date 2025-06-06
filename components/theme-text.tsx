"use client"

import type React from "react"

import { useTheme } from "./theme-provider"

interface ThemeTextProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "muted"
  className?: string
  as?: keyof JSX.IntrinsicElements
}

export function ThemeText({ children, variant = "primary", className = "", as: Component = "span" }: ThemeTextProps) {
  const { actualTheme } = useTheme()

  const getTextColor = () => {
    if (actualTheme === "dark") {
      switch (variant) {
        case "primary":
          return "text-white"
        case "secondary":
          return "text-slate-300"
        case "muted":
          return "text-slate-400"
        default:
          return "text-white"
      }
    } else {
      switch (variant) {
        case "primary":
          return "text-slate-900" // High contrast for primary text
        case "secondary":
          return "text-slate-700" // Improved contrast for secondary text
        case "muted":
          return "text-slate-600" // Better contrast for muted text
        default:
          return "text-slate-900"
      }
    }
  }

  return <Component className={`${getTextColor()} transition-colors duration-300 ${className}`}>{children}</Component>
}
