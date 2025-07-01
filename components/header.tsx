"use client"

import { Bell, Search, User, SettingsIcon } from "lucide-react" // Renamed Settings to SettingsIcon
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "./theme-toggle"
import { useTheme } from "./theme-provider" // Corrected import
import Link from "next/link"
import { useEffect } from "react" // Added useEffect for logging
import { signOut } from "@/lib/actions/auth-actions"

export function Header() {
  const { actualTheme } = useTheme()

  useEffect(() => {
    console.log("[CLIENT] Header component mounted or theme changed:", actualTheme)
  }, [actualTheme])

  const headerBg = actualTheme === "dark" ? "bg-zinc-900/80" : "bg-white/90"
  const borderColor = actualTheme === "dark" ? "border-zinc-700/50" : "border-gray-200"
  const textColor = actualTheme === "dark" ? "text-gray-300 hover:text-white" : "text-black hover:text-gray-800"
  const logoTextColor = actualTheme === "dark" ? "text-white" : "text-black"
  const dropdownBg = actualTheme === "dark" ? "glass border-zinc-700" : "bg-white border-gray-200 shadow-lg"
  const dropdownItemColor =
    actualTheme === "dark"
      ? "text-gray-300 hover:text-white focus:bg-zinc-700"
      : "text-black hover:text-gray-800 focus:bg-gray-100"

  return (
    <header
      className={`sticky top-0 z-40 h-16 border-b ${borderColor} ${headerBg} backdrop-blur-sm transition-colors duration-300`}
    >
      {" "}
      {/* z-index adjusted */}
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className={`${textColor} transition-colors duration-300 lg:hidden`} />
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className={`text-xl font-bold ${logoTextColor} transition-colors duration-300`}>SalesPulse</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className={`${textColor} glass-hover rounded-xl transition-colors duration-300`}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${textColor} glass-hover rounded-xl relative transition-colors duration-300`}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-[var(--background)]"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full" aria-label="User Menu">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg?width=40&height=40" alt="User" />
                  <AvatarFallback className="gradient-primary text-white">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-56 ${dropdownBg}`} align="end">
              <DropdownMenuItem
                asChild
                className={`${dropdownItemColor} transition-colors duration-300 cursor-pointer`}
              >
                <Link href="/settings">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className={`${dropdownItemColor} transition-colors duration-300 cursor-pointer`}
              >
                <Link href="/settings">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className={actualTheme === "dark" ? "bg-zinc-700" : "bg-gray-200"} />
              <DropdownMenuItem 
                onClick={() => signOut()} 
                className={`${dropdownItemColor} transition-colors duration-300 cursor-pointer`}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
