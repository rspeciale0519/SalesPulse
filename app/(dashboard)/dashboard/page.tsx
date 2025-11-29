"use client"

import { useEffect, useState } from "react"
import { Phone, Target, Calendar, DollarSign, TrendingUp, Users, Clock, Award } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface KPIData {
  callsToday: {
    actual: number
    target: number
    progress: number
  }
  dealsThisWeek: {
    actual: number
    target: number
    progress: number
  }
  incomeThisMonth: {
    actual: number
    target: number
    progress: number
  }
  appointmentsSet: {
    actual: number
    target: number
    progress: number
  }
  recentActivities: Array<{
    id: string
    date: string
    type: string
    quantity: number
    notes: string | null
  }>
}

export default function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true)
        const response = await fetch('/api/dashboard/kpis')

        if (!response.ok) {
          throw new Error('Failed to fetch KPI data')
        }

        const data = await response.json()
        setKpiData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching KPIs:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [])

  // Calculate if user needs catch-up based on progress
  const showCatchupAlert = kpiData && (
    kpiData.callsToday.progress < 80 ||
    kpiData.dealsThisWeek.progress < 80
  )

  // Helper to format activity type for display
  const formatActivityType = (type: string) => {
    const typeMap: Record<string, string> = {
      call: 'Calls',
      appointment: 'Appointments',
      deal: 'Deals',
      referral: 'Referrals',
    }
    return typeMap[type] || type
  }

  // Helper to get trend based on progress
  const getTrend = (progress: number): "up" | "down" | "neutral" => {
    if (progress >= 100) return "up"
    if (progress >= 80) return "neutral"
    return "down"
  }

  // Helper to get trend value text
  const getTrendValue = (actual: number, target: number) => {
    if (target === 0) return "No target set"
    const diff = actual - target
    if (diff > 0) return `+${diff} ahead`
    if (diff < 0) return `${Math.abs(diff)} behind`
    return "On target"
  }
  
  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-theme-secondary">Loading dashboard data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Alert Banner - Only show if user needs catch-up */}
      {showCatchupAlert && (
        <div className="rounded-xl p-4 gradient-primary animate-gradient shadow-lg animate-glow">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-white" />
            <div>
              <p className="text-white font-medium">Catch-up Required</p>
              <p className="text-white/80 text-sm">
                You're behind on your daily targets. Let's catch up!
              </p>
            </div>
            <Button variant="secondary" size="sm" className="ml-auto">
              View Plan
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Calls Made Today"
            value={kpiData.callsToday.actual}
            target={kpiData.callsToday.target}
            progress={kpiData.callsToday.progress}
            icon={Phone}
            trend={getTrend(kpiData.callsToday.progress)}
            trendValue={getTrendValue(kpiData.callsToday.actual, kpiData.callsToday.target)}
          />
          <KPICard
            title="Deals Closed This Week"
            value={kpiData.dealsThisWeek.actual}
            target={kpiData.dealsThisWeek.target}
            progress={kpiData.dealsThisWeek.progress}
            icon={Target}
            trend={getTrend(kpiData.dealsThisWeek.progress)}
            trendValue={getTrendValue(kpiData.dealsThisWeek.actual, kpiData.dealsThisWeek.target)}
          />
          <KPICard
            title="Income Earned This Month"
            value={`$${kpiData.incomeThisMonth.actual.toLocaleString()}`}
            target={`$${kpiData.incomeThisMonth.target.toLocaleString()}`}
            progress={kpiData.incomeThisMonth.progress}
            icon={DollarSign}
            trend={getTrend(kpiData.incomeThisMonth.progress)}
            trendValue={kpiData.incomeThisMonth.target > 0 ? getTrendValue(kpiData.incomeThisMonth.actual, kpiData.incomeThisMonth.target) : "No goal set"}
          />
          <KPICard
            title="Appointments Set"
            value={kpiData.appointmentsSet.actual}
            target={kpiData.appointmentsSet.target}
            progress={kpiData.appointmentsSet.progress}
            icon={Calendar}
            trend={getTrend(kpiData.appointmentsSet.progress)}
            trendValue={getTrendValue(kpiData.appointmentsSet.actual, kpiData.appointmentsSet.target)}
          />
        </div>
      )}

      {/* Charts and Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <Card className="glass glass-hover rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-slate-700">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chart visualization will display here</p>
                <p className="text-sm">Showing calls, appointments, and deals over time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mini Metrics */}
        <div className="space-y-6">
          <Card className="glass glass-hover rounded-xl gradient-border">
            <CardHeader>
              <CardTitle className="text-theme-primary text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* TODO: Replace with actual metrics */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-theme-secondary">Conversion Rate</span>
                </div>
                <span className="text-theme-primary font-medium">--%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-theme-secondary">Avg Call Duration</span>
                </div>
                <span className="text-theme-primary font-medium">-- min</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-theme-secondary">Weekly Rank</span>
                </div>
                <Badge variant="secondary">--</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="glass glass-hover rounded-xl gradient-border">
            <CardHeader>
              <CardTitle className="text-theme-primary text-sm">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {kpiData && kpiData.recentActivities.length > 0 ? (
                kpiData.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0">
                    <div>
                      <p className="text-sm text-theme-primary font-medium">
                        {formatActivityType(activity.type)}
                      </p>
                      <p className="text-xs text-theme-secondary">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">{activity.quantity}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-theme-secondary text-center py-4">
                  No recent activities
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="glass glass-hover rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Award className="h-5 w-5" />
              Team Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* TODO: Replace with actual leaderboard data */}
            <div className="space-y-3">
              <p className="text-sm text-theme-secondary text-center py-8">
                Leaderboard will display here when team data is available
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Table */}
      {kpiData && (
        <Card className="glass glass-hover rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {kpiData.recentActivities.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left text-sm font-medium text-theme-secondary pb-3">Date</th>
                      <th className="text-left text-sm font-medium text-theme-secondary pb-3">Activity</th>
                      <th className="text-left text-sm font-medium text-theme-secondary pb-3">Count</th>
                      <th className="text-left text-sm font-medium text-theme-secondary pb-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {kpiData.recentActivities.map((activity) => (
                      <tr key={activity.id} className="border-b border-slate-700/50">
                        <td className="py-3 text-sm text-theme-primary">
                          {new Date(activity.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm text-theme-primary">
                          {formatActivityType(activity.type)}
                        </td>
                        <td className="py-3 text-sm text-theme-primary">
                          {activity.quantity}
                        </td>
                        <td className="py-3 text-sm text-theme-secondary">
                          {activity.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-theme-secondary">No activities logged yet</p>
                  <p className="text-sm text-theme-muted mt-2">Start logging your activities to see them here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
