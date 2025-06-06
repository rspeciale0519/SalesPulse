"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, DollarSign, Settings, BarChart3, LinkIcon } from "lucide-react"
import Link from "next/link"

const affiliateSections = [
  {
    title: "Manage Affiliates",
    description: "View, approve, and manage your affiliate partners.",
    icon: Users,
    href: "/admin/affiliate-program/affiliates",
  },
  {
    title: "Commission Structures",
    description: "Define and manage commission rates and rules.",
    icon: DollarSign,
    href: "/admin/affiliate-program/commissions",
  },
  {
    title: "Payouts",
    description: "Review and process affiliate commission payouts.",
    icon: DollarSign, // Could use a more specific payout icon
    href: "/admin/affiliate-program/payouts",
  },
  {
    title: "Referral Tracking",
    description: "Monitor referral link performance and attributions.",
    icon: LinkIcon,
    href: "/admin/affiliate-program/referrals",
  },
  {
    title: "Program Analytics",
    description: "Analyze the overall performance of your affiliate program.",
    icon: BarChart3,
    href: "/admin/affiliate-program/analytics",
  },
  {
    title: "Program Settings",
    description: "Configure general settings for the affiliate program.",
    icon: Settings,
    href: "/admin/affiliate-program/settings",
  },
]

export default function AffiliateProgramPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary">Affiliate Program Management</h1>
        {/* Maybe a button to "Create New Campaign" or similar */}
      </div>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Program Overview</CardTitle>
          <CardDescription className="text-theme-secondary">
            Key metrics and quick access to affiliate program sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Placeholder for key stats like Total Affiliates, Pending Payouts, Total Commissions Paid, etc. */}
          <StatCard title="Total Affiliates" value="0" icon={Users} />
          <StatCard title="Pending Payouts" value="$0.00" icon={DollarSign} />
          <StatCard title="Total Commissions Paid" value="$0.00" icon={DollarSign} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affiliateSections.map((section) => (
          <Link href={section.href} key={section.title} className="block">
            <Card className="glass glass-hover rounded-xl gradient-border h-full transition-all hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold text-theme-primary">{section.title}</CardTitle>
                <section.icon className="h-6 w-6 text-theme-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-theme-secondary">{section.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
  <Card className="glass rounded-lg">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-md bg-theme-accent/10">
          <Icon className="h-5 w-5 text-theme-accent" />
        </div>
        <div>
          <p className="text-xs text-theme-secondary">{title}</p>
          <p className="text-lg font-bold text-theme-primary">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)
