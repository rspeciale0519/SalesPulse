"use client"

import { useSidebar } from "@/components/ui/sidebar"

export function useSidebarState() {
  const { state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar } = useSidebar()

  const isCollapsed = state === "collapsed"
  const isExpanded = state === "expanded"

  return {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    isCollapsed,
    isExpanded,
  }
}
