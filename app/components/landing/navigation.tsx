"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

interface NavigationProps {
  onLoginClick: () => void
}

export function Navigation({ onLoginClick }: NavigationProps) {
  const { actualTheme } = useTheme()

  return (
    <nav
      className={`fixed top-0 w-full z-50 backdrop-blur-md transition-colors duration-300 ${
        actualTheme === "dark" ? "bg-black/80 border-b border-zinc-800" : "bg-white/80 border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <span className="text-xl font-bold text-theme-primary">SalesPulse</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-theme-secondary hover:text-theme-primary transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-theme-secondary hover:text-theme-primary transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-theme-secondary hover:text-theme-primary transition-colors">
              Reviews
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-theme-secondary hover:text-theme-primary"
              onClick={onLoginClick}
            >
              Login or Sign Up
            </Button>
            <Button className="gradient-primary hover:opacity-90">Start Free Trial</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
