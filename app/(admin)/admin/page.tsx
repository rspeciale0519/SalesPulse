"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Tag, DollarSign, Activity } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

// TODO: Fetch admin dashboard data from Supabase
// const { data: overviewData } = await getAdminOverviewData()
const overviewData = {
  totalUsers: 0,
  activeSubscriptions: 0,
  totalModules: 0,
  monthlyRecurringRevenue: 0,
}

// TODO: Fetch user growth data from Supabase
// const { data: userGrowthData } = await getUserGrowthData(timeRange)
const userGrowthData: Array<{ month: string; users: number }> = []

// TODO: Fetch revenue data from Supabase
// const { data: revenueData } = await getRevenueData(timeRange)
const revenueData: Array<{ month: string; revenue: number }> = []

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary">Admin Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={Users} title="Total Users" value={overviewData.totalUsers.toLocaleString()} />
        <MetricCard icon={Tag} title="Active Subscriptions" value={overviewData.activeSubscriptions.toLocaleString()} />
        <MetricCard icon={Briefcase} title="Industry Modules" value={overviewData.totalModules.toString()} />
        <MetricCard
          icon={DollarSign}
          title="Monthly Recurring Revenue"
          value={`$${overviewData.monthlyRecurringRevenue.toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth" icon={Users}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700/50" />
              <XAxis dataKey="month" className="text-xs fill-theme-secondary" />
              <YAxis className="text-xs fill-theme-secondary" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 30, 0.8)",
                  borderColor: "rgba(100,100,100,0.5)",
                  borderRadius: "0.5rem",
                }}
                labelClassName="font-bold text-white"
                itemStyle={{ color: "#e0e0e0" }}
              />
              <Bar dataKey="users" fill="var(--gradient-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Growth" icon={DollarSign}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-700/50" />
              <XAxis dataKey="month" className="text-xs fill-theme-secondary" />
              <YAxis className="text-xs fill-theme-secondary" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(30, 30, 30, 0.8)",
                  borderColor: "rgba(100,100,100,0.5)",
                  borderRadius: "0.5rem",
                }}
                labelClassName="font-bold text-white"
                itemStyle={{ color: "#e0e0e0" }}
              />
              <Line type="monotone" dataKey="revenue" stroke="url(#revenueGradient)" strokeWidth={2} />
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ed1c24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#b71c1c" stopOpacity={0.3} />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <Card className="glass rounded-xl border-2 border-red-500">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for recent activity feed */}
          <ul className="space-y-3">
            <li className="text-sm text-theme-secondary">User 'john.doe@example.com' signed up.</li>
            <li className="text-sm text-theme-secondary">New Industry Module 'Financial Services' added.</li>
            <li className="text-sm text-theme-secondary">Pricing Plan 'Pro' updated.</li>
            <li className="text-sm text-theme-secondary">Support ticket #1024 closed.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

const MetricCard = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) => (
  <Card className="glass glass-hover rounded-xl border-2 border-red-500">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg gradient-accent">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-theme-secondary">{title}</p>
          <p className="text-2xl font-bold text-theme-primary">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

const ChartCard = ({
  title,
  icon: Icon,
  children,
}: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <Card className="glass rounded-xl border-2 border-red-500">
    <CardHeader>
      <CardTitle className="text-theme-primary flex items-center gap-2">
        <Icon className="h-5 w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
)
