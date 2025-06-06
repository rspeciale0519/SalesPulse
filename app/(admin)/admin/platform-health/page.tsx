"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartPulse, CheckCircle, XCircle, AlertTriangle, Server, Clock } from "lucide-react"

const ApiStatusIndicator = ({
  name,
  status,
  lastChecked,
}: { name: string; status: "operational" | "degraded" | "outage"; lastChecked: string }) => {
  const statusConfig = {
    operational: { icon: CheckCircle, color: "text-green-500", label: "Operational" },
    degraded: { icon: AlertTriangle, color: "text-yellow-500", label: "Degraded Performance" },
    outage: { icon: XCircle, color: "text-red-500", label: "Outage" },
  }
  const CurrentIcon = statusConfig[status].icon

  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-700/50 last:border-b-0">
      <div className="flex items-center gap-3">
        <CurrentIcon className={`h-6 w-6 ${statusConfig[status].color}`} />
        <span className="text-theme-primary font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-semibold ${statusConfig[status].color}`}>{statusConfig[status].label}</span>
        <span className="text-xs text-theme-muted">(Last checked: {lastChecked})</span>
      </div>
    </div>
  )
}

export default function PlatformHealthPage() {
  // Initial data
  const apiStatuses: { name: string; status: "operational" | "degraded" | "outage"; lastChecked: string }[] = []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
        <HeartPulse className="h-7 w-7" /> Platform Health
      </h1>
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Server className="h-5 w-5" />
            API & Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {apiStatuses.map((api) => (
            <ApiStatusIndicator key={api.name} {...api} />
          ))}
        </CardContent>
      </Card>
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Application Error Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-theme-secondary">Placeholder for centralized error log feed (e.g., Sentry integration).</p>
        </CardContent>
      </Card>
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Background Job Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-theme-secondary">Placeholder for monitoring cron jobs, data syncs, etc.</p>
        </CardContent>
      </Card>
    </div>
  )
}
