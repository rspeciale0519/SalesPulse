"use client"

import { Phone, Target, Calendar, DollarSign, TrendingUp, Users, Clock, Award } from "lucide-react"
import { KPICard } from "@/components/kpi-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  // TODO: Fetch user data and KPIs from Supabase
  // const { data: user } = await getCurrentUser()
  // const { data: kpis } = await getUserKPIs(user.id)
  // const { data: catchupStatus } = await getCatchupStatus(user.id)

  // Temporary placeholder data - will be replaced with actual data
  const showCatchupAlert = false // Will be calculated based on actual performance
  
  return (
    <div className="space-y-6">
      {/* Alert Banner - Only show if user needs catch-up */}
      {showCatchupAlert && (
        <div className="rounded-xl p-4 gradient-primary animate-gradient shadow-lg animate-glow">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-white" />
            <div>
              <p className="text-white font-medium">Catch-up Required</p>
              <p className="text-white/80 text-sm">
                {/* Dynamic message based on actual performance */}
                Performance alert will appear here when needed
              </p>
            </div>
            <Button variant="secondary" size="sm" className="ml-auto">
              View Plan
            </Button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TODO: Map over actual KPI data */}
        <KPICard
          title="Calls Made Today"
          value={0}
          target={0}
          progress={0}
          icon={Phone}
          trend="neutral"
          trendValue="Loading..."
        />
        <KPICard
          title="Deals Closed This Week"
          value={0}
          target={0}
          progress={0}
          icon={Target}
          trend="neutral"
          trendValue="Loading..."
        />
        <KPICard
          title="Income Earned This Month"
          value="$0"
          target="$0"
          progress={0}
          icon={DollarSign}
          trend="neutral"
          trendValue="Loading..."
        />
        <KPICard
          title="Appointments Set"
          value={0}
          target={0}
          progress={0}
          icon={Calendar}
          trend="neutral"
          trendValue="Loading..."
        />
      </div>

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
              {/* TODO: Replace with actual recent activities */}
              <p className="text-sm text-theme-secondary text-center py-4">
                Recent activities will appear here
              </p>
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
      <Card className="glass glass-hover rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Date</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Activity</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Count</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Source</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {/* TODO: Replace with actual activity data */}
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 text-sm text-theme-primary">Today</td>
                  <td className="py-3 text-sm text-theme-primary">Calls Made</td>
                  <td className="py-3 text-sm text-theme-primary">25</td>
                  <td className="py-3">
                    <Badge variant="outline" className="text-xs">
                      Manual
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" className="text-theme-muted hover:text-white">
                      Edit
                    </Button>
                  </td>
                </tr>
                <tr className="border-b border-slate-700/50">
                  <td className="py-3 text-sm text-theme-primary">Yesterday</td>
                  <td className="py-3 text-sm text-theme-primary">Appointments Set</td>
                  <td className="py-3 text-sm text-theme-primary">4</td>
                  <td className="py-3">
                    <Badge variant="secondary" className="text-xs">
                      RingCentral
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm" className="text-theme-muted hover:text-white">
                      View
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
