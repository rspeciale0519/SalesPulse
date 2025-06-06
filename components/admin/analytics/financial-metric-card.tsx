import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface FinancialMetricCardProps {
  title: string
  value: string
  description?: string
  IconComponent?: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function FinancialMetricCard({ title, value, description, IconComponent }: FinancialMetricCardProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {IconComponent && <IconComponent className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}
