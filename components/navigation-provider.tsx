"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useNavigationState } from "@/hooks/use-navigation-state"

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { setLastVisitedPage } = useNavigationState()

  useEffect(() => {
    // Track page visits for better navigation UX
    setLastVisitedPage(pathname)
  }, [pathname, setLastVisitedPage])

  return <>{children}</>
}
