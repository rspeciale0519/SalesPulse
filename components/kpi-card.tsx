"use client"

import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "./theme-provider"

interface KPICardProps {
  title: string
  value: string | number
  target?: string | number
  progress?: number
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  className?: string
}

export function KPICard({
  title,
  value,
  target,
  progress,
  icon: Icon,
  trend = "neutral",
  trendValue,
  className = "",
}: KPICardProps) {
  const { actualTheme } = useTheme()

  const trendColors = {
    up: actualTheme === "dark" ? "text-green-400" : "text-green-700",
    down: actualTheme === "dark" ? "text-red-400" : "text-red-700",
    neutral: actualTheme === "dark" ? "text-gray-400" : "text-gray-700",
  }

  const titleColor = actualTheme === "dark" ? "text-gray-300" : "text-gray-800"
  const valueColor = actualTheme === "dark" ? "text-white" : "text-black"
  const targetColor = actualTheme === "dark" ? "text-gray-400" : "text-gray-700"
  const progressBg = actualTheme === "dark" ? "bg-zinc-700" : "bg-gray-200"
  const progressTextColor = actualTheme === "dark" ? "text-gray-400" : "text-gray-700"

  return (
    <Card className={`glass glass-hover gradient-border rounded-xl ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg gradient-primary">
                <Icon className="h-5 w-5 text-white" />
              </div>
              <h3 className={`text-sm font-medium ${titleColor}`}>{title}</h3>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${valueColor}`}>{value}</span>
                {target && <span className={`text-sm ${targetColor}`}>/ {target}</span>}
              </div>

              {progress !== undefined && (
                <div className="space-y-2">
                  <Progress value={progress} className={`h-2 ${progressBg}`} />
                  <div className={`flex justify-between text-xs ${progressTextColor}`}>
                    <span>{progress}% complete</span>
                    {trendValue && (
                      <span className={trendColors[trend]}>
                        {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
