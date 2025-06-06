"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme, actualTheme } = useTheme()

  const getThemeIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-5 w-5" />
    }
    return actualTheme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />
  }

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light"
      case "dark":
        return "Dark"
      case "system":
        return "System"
      default:
        return "Theme"
    }
  }

  const buttonColor = actualTheme === "dark" ? "text-gray-300 hover:text-white" : "text-black hover:text-gray-800"

  const dropdownBg = actualTheme === "dark" ? "glass border-zinc-700" : "bg-white border-gray-200 shadow-lg"

  const dropdownTextColor = actualTheme === "dark" ? "text-gray-400" : "text-gray-700"

  const menuItemColor =
    actualTheme === "dark"
      ? "text-gray-300 hover:text-white hover:bg-zinc-700/50"
      : "text-black hover:text-gray-800 hover:bg-gray-100"

  const activeItemBg = actualTheme === "dark" ? "bg-zinc-700/30 text-white" : "bg-gray-100 text-black"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`${buttonColor} glass-hover rounded-xl transition-all duration-300 relative group theme-toggle-button border-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none`}
        >
          <div className="transition-transform duration-300 group-hover:scale-110">{getThemeIcon()}</div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={`${dropdownBg} backdrop-blur-xl min-w-[140px]`}>
        <div className={`px-2 py-1.5 text-xs font-medium ${dropdownTextColor} border-b border-slate-700 mb-1`}>
          Current: {getThemeLabel()}
        </div>

        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`${menuItemColor} cursor-pointer transition-colors ${theme === "light" ? activeItemBg : ""}`}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
          {theme === "light" && <div className="ml-auto w-2 h-2 rounded-full bg-red-500"></div>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`${menuItemColor} cursor-pointer transition-colors ${theme === "dark" ? activeItemBg : ""}`}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && <div className="ml-auto w-2 h-2 rounded-full bg-red-500"></div>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`${menuItemColor} cursor-pointer transition-colors ${theme === "system" ? activeItemBg : ""}`}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
          {theme === "system" && <div className="ml-auto w-2 h-2 rounded-full bg-red-500"></div>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
