"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plug, Zap, Users, BarChart3, MessageSquare, Calendar, Database, Mail, Globe } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  category: "crm" | "communication" | "analytics" | "automation" | "productivity"
  status: "available" | "connected" | "coming-soon"
  plan: "free" | "pro" | "enterprise"
}

// TODO: Fetch available integrations from Supabase based on user's plan
// const { data: integrations } = await getIntegrations(userId, organizationId)
const integrations: Integration[] = []

// Example structure for future implementation:
// [
//   {
//     id: "salesforce",
//     name: "Salesforce",
//     description: "Sync your goals with Salesforce opportunities and track deal progress",
//     icon: Database,
//     category: "crm",
//     status: "available",
//     plan: "pro",
//   },
//   ...
// ]

const categoryIcons = {
  crm: Database,
  communication: MessageSquare,
  analytics: BarChart3,
  automation: Zap,
  productivity: Calendar,
}

export default function IntegrationsPage() {
  const { actualTheme } = useTheme()

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>
      case "available":
        return <Badge variant="outline">Available</Badge>
      case "coming-soon":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Coming Soon</Badge>
        )
    }
  }

  const getPlanBadge = (plan: Integration["plan"]) => {
    const colors = {
      free: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      pro: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      enterprise: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    }
    return <Badge className={colors[plan]}>{plan.toUpperCase()}</Badge>
  }

  const filterByCategory = (category: string) => {
    if (category === "all") return integrations
    return integrations.filter((integration) => integration.category === category)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Plug className="h-7 w-7" /> Integrations
        </h1>
        <p className="text-theme-secondary mt-2">
          Connect SalesPulse with your favorite tools to streamline your workflow
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/integrations/api-keys">
              <Globe className="h-4 w-4 mr-2" />
              Manage API Keys
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/integrations/webhooks">
              <Zap className="h-4 w-4 mr-2" />
              Webhooks
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
        </TabsList>

        {["all", "crm", "communication", "analytics", "automation", "productivity"].map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterByCategory(category).map((integration) => {
                const IconComponent = integration.icon
                return (
                  <Card
                    key={integration.id}
                    className="glass rounded-xl gradient-border hover:shadow-lg transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-theme-primary">{integration.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              {getStatusBadge(integration.status)}
                              {getPlanBadge(integration.plan)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <CardDescription className="text-theme-secondary">{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        {integration.status === "connected" ? (
                          <>
                            <Button variant="outline" className="flex-1">
                              Configure
                            </Button>
                            <Button variant="outline" size="sm">
                              Disconnect
                            </Button>
                          </>
                        ) : integration.status === "available" ? (
                          <Button className="flex-1 gradient-primary" asChild>
                            <Link href={`/integrations/${integration.id}`}>Connect</Link>
                          </Button>
                        ) : (
                          <Button disabled className="flex-1">
                            Coming Soon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
