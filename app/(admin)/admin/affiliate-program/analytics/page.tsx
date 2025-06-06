"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, DollarSign, LinkIcon, TrendingUp, UserCheck, Percent } from "lucide-react"
// Placeholder for actual chart components
const PlaceholderChart = ({ title }: { title: string }) => (
  <div className="h-64 w-full border glass rounded-lg flex items-center justify-center text-theme-secondary">
    {title} (Chart Placeholder)
  </div>
)

export default function AffiliateAnalyticsPage() {
  // Initial data
  const totalAffiliates = 0
  const activeAffiliates = 0
  const totalReferrals = 0
  const totalConversions = 0
  const conversionRate = 0 // Or calculate: totalReferrals > 0 ? (totalConversions / totalReferrals) * 100 : 0;
  const totalCommissionPaid = 0.0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary">Affiliate Program Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard icon={Users} title="Total Affiliates" value={totalAffiliates.toString()} />
        <MetricCard icon={UserCheck} title="Active Affiliates" value={activeAffiliates.toString()} />
        <MetricCard icon={LinkIcon} title="Total Referrals (Clicks)" value={totalReferrals.toString()} />
        <MetricCard icon={TrendingUp} title="Total Conversions (Signups/Sales)" value={totalConversions.toString()} />
        <MetricCard icon={Percent} title="Overall Conversion Rate" value={`${conversionRate.toFixed(2)}%`} />
        <MetricCard icon={DollarSign} title="Total Commissions Paid" value={`$${totalCommissionPaid.toFixed(2)}`} />
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Referrals Over Time</CardTitle>
            <CardDescription className="text-theme-secondary">Monthly referral clicks and conversions.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlaceholderChart title="Referrals & Conversions Line Chart" />
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Top Performing Affiliates</CardTitle>
            <CardDescription className="text-theme-secondary">By conversions or commissions earned.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlaceholderChart title="Top Affiliates Bar Chart" />
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Commission Payouts Over Time</CardTitle>
            <CardDescription className="text-theme-secondary">Monthly commission payouts.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlaceholderChart title="Commission Payouts Line Chart" />
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Conversion Funnel</CardTitle>
            <CardDescription className="text-theme-secondary">From click to signup to sale.</CardDescription>
          </CardHeader>
          <CardContent>
            <PlaceholderChart title="Affiliate Conversion Funnel" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const MetricCard = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: string }) => (
  <Card className="glass rounded-xl gradient-border">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-theme-secondary">{title}</CardTitle>
      <Icon className="h-5 w-5 text-theme-accent" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-theme-primary">{value}</div>
    </CardContent>
  </Card>
)
