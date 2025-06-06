"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BarChart3, Clock, Zap, TrendingUp, Users2, Filter } from "lucide-react"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
} from "recharts"
import { Button } from "@/components/ui/button"

// Initial Data
const dauMauData = { dau: 0, mau: 0, sessionDuration: "0m 0s", featureAdoption: "0%" }
const userGrowthData: { date: string; newUsers: number; activeUsers: number }[] = []
const featureUsageData: { name: string; usage: number }[] = []

const MetricSummaryCard = ({
  title,
  value,
  icon: Icon,
  trend,
  period,
}: { title: string; value: string | number; icon: React.ElementType; trend?: string; period?: string }) => (
  <Card className="glass glass-hover rounded-xl gradient-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-theme-secondary">{title}</CardTitle>
      <Icon className="h-4 w-4 text-theme-muted" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-theme-primary">{value}</div>
      {trend && (
        <p className="text-xs text-theme-muted">
          {trend} {period && `from ${period}`}
        </p>
      )}
    </CardContent>
  </Card>
)

export default function UserAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Users className="h-7 w-7" /> User Analytics
        </h1>
        {/* <DateRangePicker onRangeChange={(range) => console.log(range)} /> */}
        <Button variant="outline" className="glass">
          <Filter className="mr-2 h-4 w-4" /> Filter Data
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricSummaryCard
          title="Daily Active Users (DAU)"
          value={dauMauData.dau.toLocaleString()}
          icon={Users2}
          trend="+5.2%"
          period="last week"
        />
        <MetricSummaryCard
          title="Monthly Active Users (MAU)"
          value={dauMauData.mau.toLocaleString()}
          icon={Users}
          trend="+3.1%"
          period="last month"
        />
        <MetricSummaryCard
          title="Avg. Session Duration"
          value={dauMauData.sessionDuration}
          icon={Clock}
          trend="-1.5%"
          period="last week"
        />
        <MetricSummaryCard
          title="Core Feature Adoption"
          value={dauMauData.featureAdoption}
          icon={Zap}
          trend="+2.0%"
          period="last month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700/50" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,30,30,0.8)",
                    borderColor: "rgba(100,100,100,0.5)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="newUsers"
                  name="New Users"
                  stroke="var(--gradient-accent)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  name="Total Active Users"
                  stroke="var(--gradient-primary)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Feature Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={featureUsageData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700/50" />
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "rgba(30,30,30,0.8)",
                    borderColor: "rgba(100,100,100,0.5)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="usage" name="Usage %" fill="var(--gradient-accent)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Cohort Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-theme-secondary">Placeholder for cohort analysis table/chart.</p>
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Conversion Funnels</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-theme-secondary">Placeholder for conversion funnel visualization.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
