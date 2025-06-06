"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  Users,
  Briefcase,
  Tag,
  LifeBuoy,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  TrendingUp,
  HeartPulse,
  ToggleRight,
  History,
  Share2,
  Ticket,
  Mail,
  DollarSign,
  Settings,
  UsersRound,
  Building,
  CreditCard,
  Wrench,
  LinkIcon as LinkIconLucide,
  Percent,
  Activity,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useTheme } from "@/components/theme-provider"
import { useSidebarState } from "@/hooks/use-sidebar-state"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { NavItem } from "@/types/admin"

// Define adminNavItems here
const adminNavItems: NavItem[] = [
  { title: "Overview", href: "/admin", icon: LayoutGrid },
  {
    title: "Analytics",
    icon: TrendingUp,
    href: "/admin/analytics",
    defaultOpen: false,
    subItems: [
      { title: "User Analytics", href: "/admin/analytics/user-analytics", icon: Users },
      { title: "Financial Analytics", href: "/admin/analytics/financial-analytics", icon: DollarSign },
      { title: "Module Analytics", href: "/admin/analytics/module-analytics", icon: Briefcase },
    ],
  },
  { title: "User Management", href: "/admin/user-management", icon: UsersRound },
  { title: "User Support", href: "/admin/user-support", icon: LifeBuoy },
  {
    title: "Industry Modules", // Kept as a direct link as per previous structure, can be group if needed
    href: "/admin/industry-modules",
    icon: Building,
  },
  {
    title: "Pricing & Billing",
    icon: Tag,
    defaultOpen: false,
    subItems: [
      { title: "Pricing Plans", href: "/admin/pricing-management", icon: CreditCard },
      { title: "Coupons", href: "/admin/coupons", icon: Ticket },
    ],
  },
  {
    title: "Affiliate Program",
    href: "/admin/affiliate-program", // Main overview page
    icon: Share2,
    defaultOpen: false,
    subItems: [
      { title: "Manage Affiliates", href: "/admin/affiliate-program/affiliates", icon: Users },
      { title: "Commission Structures", href: "/admin/affiliate-program/commissions", icon: Percent },
      { title: "Payouts", href: "/admin/affiliate-program/payouts", icon: DollarSign },
      { title: "Referral Tracking", href: "/admin/affiliate-program/referrals", icon: LinkIconLucide },
      { title: "Program Analytics", href: "/admin/affiliate-program/analytics", icon: Activity },
      { title: "Program Settings", href: "/admin/affiliate-program/settings", icon: Settings },
    ],
  },
  {
    title: "Platform Settings", // Group title
    icon: Settings, // General settings icon for the group
    defaultOpen: false,
    subItems: [
      { title: "General Settings", href: "/admin/platform-settings", icon: Wrench },
      { title: "Email Management", href: "/admin/email-management", icon: Mail },
      { title: "Feature Flags", href: "/admin/feature-flags", icon: ToggleRight },
      { title: "Platform Health", href: "/admin/platform-health", icon: HeartPulse },
      { title: "Audit Logs", href: "/admin/audit-logs", icon: History },
    ],
  },
]

export function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { actualTheme } = useTheme()
  const { isCollapsed } = useSidebarState()

  const sidebarBg =
    actualTheme === "dark"
      ? "bg-gradient-to-b from-zinc-900 to-black"
      : "bg-gradient-to-b from-gray-100 to-gray-200/80 backdrop-blur-md"
  const borderColor = actualTheme === "dark" ? "border-zinc-700/50" : "border-gray-300/70"

  const getMenuItemStyles = (isActive: boolean) => {
    const baseStyle = "rounded-xl transition-all duration-300 font-medium border"

    if (actualTheme === "dark") {
      // Dark theme styles
      return isActive
        ? `${baseStyle} bg-gradient-to-br from-red-500/95 via-red-600/90 to-red-700/95 border-red-300/50 text-white shadow-lg shadow-red-500/20 backdrop-blur-[12px] animate-subtle-pulse ring-1 ring-red-400/30`
        : `${baseStyle} text-gray-300 border-transparent hover:text-white hover:bg-gradient-to-r hover:from-red-600/30 hover:to-red-500/20 hover:border-red-400/20 hover:backdrop-blur-[4px] hover:shadow-md hover:shadow-red-500/10`
    } else {
      // Light theme styles
      return isActive
        ? `${baseStyle} bg-gradient-to-br from-red-500/95 via-red-600/90 to-red-700/95 border-red-300/60 text-white shadow-lg shadow-red-500/15 backdrop-blur-[12px] animate-subtle-pulse ring-1 ring-red-400/40`
        : `${baseStyle} text-gray-700 border-transparent hover:text-red-900 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-400/10 hover:border-red-400/20 hover:backdrop-blur-[4px] hover:shadow-sm hover:shadow-red-500/10`
    }
  }

  const MenuItemWithTooltip = ({
    item,
    isActive,
  }: { item: { title: string; href: string; icon: React.ElementType }; isActive: boolean }) => {
    const handleNavigation = (e: React.MouseEvent) => {
      e.preventDefault()
      router.push(item.href)
    }

    const commonButtonClasses = `h-12 justify-center ${getMenuItemStyles(isActive)}`
    const collapsedButtonClasses = `${commonButtonClasses} w-12 p-0 sidebar-collapsed-icon`
    const expandedButtonClasses = `${commonButtonClasses} px-3 justify-start`

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <SidebarMenuButton onClick={handleNavigation} className={collapsedButtonClasses}>
              <div className="flex items-center justify-center transition-all duration-300 w-full h-full">
                <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "drop-shadow-glow" : ""}`} />
              </div>
            </SidebarMenuButton>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className={`z-50 font-medium backdrop-blur-sm border shadow-lg ${
              actualTheme === "dark"
                ? "bg-zinc-900/95 border-zinc-700 text-white"
                : "bg-white/95 border-gray-200 text-black shadow-md"
            }`}
            sideOffset={16}
            align="center"
          >
            <span className="whitespace-nowrap">{item.title}</span>
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <SidebarMenuButton onClick={handleNavigation} className={expandedButtonClasses}>
        <div className="flex items-center gap-3 transition-all duration-300">
          <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "drop-shadow-glow" : ""}`} />
          <span className="transition-opacity duration-300 opacity-100">{item.title}</span>
        </div>
      </SidebarMenuButton>
    )
  }

  const [openCollapsibles, setOpenCollapsibles] = useState<Record<string, boolean>>(() => {
    const initialOpenState: Record<string, boolean> = {}
    adminNavItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0 && item.defaultOpen) {
        initialOpenState[item.title] = true
      } else if (item.subItems && item.subItems.length > 0) {
        initialOpenState[item.title] = false
      }
    })
    return initialOpenState
  })

  const toggleCollapsible = (title: string) => {
    setOpenCollapsibles((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <TooltipProvider>
      <style jsx global>{`
        @keyframes subtle-pulse {
          0%, 100% {
            box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.15), 0 4px 6px -2px rgba(239, 68, 68, 0.1);
          }
          50% {
            box-shadow: 0 15px 20px -3px rgba(239, 68, 68, 0.2), 0 6px 8px -2px rgba(239, 68, 68, 0.15);
          }
        }
        
        .animate-subtle-pulse {
          animation: subtle-pulse 3s ease-in-out infinite;
        }
        
        .drop-shadow-glow {
          filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.8));
        }
      `}</style>
      <Sidebar className={`border-r ${borderColor} transition-colors duration-300`} collapsible="icon">
        <SidebarContent className={`${sidebarBg} transition-all duration-300`}>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className={`space-y-2 transition-all duration-300 ${isCollapsed ? "p-2" : "p-4"}`}>
                {adminNavItems.map((item) => {
                  // Render as a group if it has subItems
                  if (item.subItems && item.subItems.length > 0) {
                    const isGroupActive =
                      item.subItems.some(
                        (subItem) => subItem.href && (pathname === subItem.href || pathname.startsWith(subItem.href)),
                      ) ||
                      (item.href && (pathname === item.href || pathname.startsWith(item.href)))

                    const handleGroupNavigation = (href: string) => (e: React.MouseEvent) => {
                      e.preventDefault()
                      router.push(href)
                    }

                    return (
                      <Collapsible
                        key={item.title}
                        open={isCollapsed ? false : openCollapsibles[item.title]}
                        onOpenChange={() => !isCollapsed && toggleCollapsible(item.title)}
                        className="w-full"
                      >
                        <SidebarMenuItem className={isCollapsed ? "flex justify-center" : ""}>
                          {isCollapsed ? (
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div
                                  className={`flex items-center justify-center w-12 h-12 p-0 ${getMenuItemStyles(isGroupActive)} sidebar-collapsed-icon`}
                                >
                                  <item.icon
                                    className={`h-5 w-5 flex-shrink-0 ${isGroupActive ? "drop-shadow-glow" : ""}`}
                                  />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent
                                side="right"
                                className={`z-50 font-medium backdrop-blur-sm border shadow-lg ${actualTheme === "dark" ? "bg-zinc-900/95 border-zinc-700 text-white" : "bg-white/95 border-gray-200 text-black shadow-md"}`}
                                sideOffset={16}
                                align="center"
                              >
                                <span className="whitespace-nowrap">{item.title}</span>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className={`h-12 justify-start px-3 w-full ${getMenuItemStyles(isGroupActive)}`}
                              >
                                <item.icon
                                  className={`h-5 w-5 flex-shrink-0 ${isGroupActive ? "drop-shadow-glow" : ""}`}
                                />
                                <span className="transition-opacity duration-300 opacity-100">{item.title}</span>
                                {openCollapsibles[item.title] ? (
                                  <ChevronDown className="ml-auto h-4 w-4" />
                                ) : (
                                  <ChevronRight className="ml-auto h-4 w-4" />
                                )}
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                          )}
                        </SidebarMenuItem>
                        {!isCollapsed && (
                          <CollapsibleContent className="ml-4 pl-3 border-l border-dashed border-slate-700/50 data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                            <SidebarMenu className="py-1 space-y-1">
                              {item.subItems.map((subItem) => {
                                if (!subItem.href) return null // Skip subitems without href
                                const isActive = pathname === subItem.href || pathname.startsWith(subItem.href)
                                return (
                                  <SidebarMenuItem key={subItem.title}>
                                    <SidebarMenuButton
                                      onClick={(e) => {
                                        e.preventDefault()
                                        if (subItem.href) router.push(subItem.href)
                                      }}
                                      className={`h-10 justify-start px-3 w-full ${getMenuItemStyles(isActive)}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <subItem.icon
                                          className={`h-4 w-4 flex-shrink-0 ${isActive ? "drop-shadow-glow" : ""}`}
                                        />
                                        <span>{subItem.title}</span>
                                      </div>
                                    </SidebarMenuButton>
                                  </SidebarMenuItem>
                                )
                              })}
                            </SidebarMenu>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    )
                  }
                  // Render as a direct link if it has an href and no subItems
                  else if (item.href) {
                    const isActive =
                      pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                    return (
                      <SidebarMenuItem key={item.title} className={isCollapsed ? "flex justify-center" : ""}>
                        <MenuItemWithTooltip
                          item={{ title: item.title, href: item.href, icon: item.icon }}
                          isActive={isActive}
                        />
                      </SidebarMenuItem>
                    )
                  }
                  return null
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  )
}
