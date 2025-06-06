"use client"

import { Bell, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle" // Re-use existing
import { useTheme } from "@/components/theme-provider" // Re-use existing

export function AdminHeader() {
  const { actualTheme } = useTheme()

  const headerBg = actualTheme === "dark" ? "bg-zinc-900/80" : "bg-white/90"
  const borderColor = actualTheme === "dark" ? "border-zinc-700/50" : "border-gray-200"
  const textColor = actualTheme === "dark" ? "text-gray-300 hover:text-white" : "text-black hover:text-gray-800"
  const logoTextColor = actualTheme === "dark" ? "text-white" : "text-black"
  const dropdownBg = actualTheme === "dark" ? "glass border-zinc-700" : "bg-white border-gray-200 shadow-lg"
  const dropdownItemColor = actualTheme === "dark" ? "text-gray-300 hover:text-white" : "text-black hover:text-gray-800"

  return (
    <header className={`h-16 border-b ${borderColor} ${headerBg} backdrop-blur-sm transition-colors duration-300`}>
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className={`${textColor} transition-colors duration-300`} />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className={`text-xl font-bold ${logoTextColor} transition-colors duration-300`}>
              SalesPulse Admin
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className={`${textColor} glass-hover rounded-xl transition-colors duration-300`}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`${textColor} glass-hover rounded-xl relative transition-colors duration-300`}
          >
            <Bell className="h-5 w-5" />
            {/* Example notification badge */}
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/admin-user-interface.png" alt="Admin User" />
                  <AvatarFallback className="gradient-accent text-white">A</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={`w-56 ${dropdownBg}`} align="end">
              <DropdownMenuItem className={`${dropdownItemColor} transition-colors duration-300`}>
                <User className="mr-2 h-4 w-4" />
                Admin Profile
              </DropdownMenuItem>
              <DropdownMenuItem className={`${dropdownItemColor} transition-colors duration-300`}>
                Platform Settings
              </DropdownMenuItem>
              <DropdownMenuItem className={`${dropdownItemColor} transition-colors duration-300`}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
