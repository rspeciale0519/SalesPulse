"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Database, ArrowLeft, CheckCircle, Settings, FolderSyncIcon as Sync, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

export default function SalesforceIntegrationPage() {
  const { actualTheme } = useTheme()
  const [isConnected, setIsConnected] = useState(false)
  const [syncSettings, setSyncSettings] = useState({
    syncGoals: true,
    syncActivities: true,
    syncOpportunities: false,
    autoSync: true,
  })

  const inputClasses = actualTheme === "dark" ? "bg-zinc-800/80 border-zinc-600" : "bg-white/90 border-gray-300"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/integrations">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Integrations
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Database className="h-7 w-7" /> Salesforce Integration
        </h1>
        <p className="text-theme-secondary mt-2">Connect your SalesPulse goals and activities with Salesforce CRM</p>
      </div>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-theme-primary flex items-center gap-2">
                Connection Status
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Connected</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected
                  ? "Your Salesforce account is successfully connected to SalesPulse"
                  : "Connect your Salesforce account to start syncing data"}
              </CardDescription>
            </div>
            {isConnected ? (
              <Button variant="outline" onClick={() => setIsConnected(false)}>
                Disconnect
              </Button>
            ) : (
              <Button className="gradient-primary" onClick={() => setIsConnected(true)}>
                Connect to Salesforce
              </Button>
            )}
          </div>
        </CardHeader>
        {!isConnected && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">What happens when you connect?</p>
                  <ul className="text-xs text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                    <li>• Your SalesPulse goals will sync with Salesforce opportunities</li>
                    <li>• Activity logs will be shared between both platforms</li>
                    <li>• Real-time updates will keep both systems in sync</li>
                    <li>• You can configure which data to sync in the settings below</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {isConnected && (
        <>
          <Card className="glass rounded-xl gradient-border">
            <CardHeader>
              <CardTitle className="text-theme-primary flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Sync Settings
              </CardTitle>
              <CardDescription>Configure what data to sync between SalesPulse and Salesforce</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-primary font-medium">Sync Goals with Opportunities</p>
                  <p className="text-sm text-theme-muted">
                    Automatically create Salesforce opportunities when you create goals
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncGoals}
                  onCheckedChange={(checked) => setSyncSettings((prev) => ({ ...prev, syncGoals: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-primary font-medium">Sync Activities</p>
                  <p className="text-sm text-theme-muted">Share activity logs between SalesPulse and Salesforce</p>
                </div>
                <Switch
                  checked={syncSettings.syncActivities}
                  onCheckedChange={(checked) => setSyncSettings((prev) => ({ ...prev, syncActivities: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-primary font-medium">Import Existing Opportunities</p>
                  <p className="text-sm text-theme-muted">
                    Create SalesPulse goals from existing Salesforce opportunities
                  </p>
                </div>
                <Switch
                  checked={syncSettings.syncOpportunities}
                  onCheckedChange={(checked) => setSyncSettings((prev) => ({ ...prev, syncOpportunities: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-primary font-medium">Automatic Sync</p>
                  <p className="text-sm text-theme-muted">Enable real-time synchronization between platforms</p>
                </div>
                <Switch
                  checked={syncSettings.autoSync}
                  onCheckedChange={(checked) => setSyncSettings((prev) => ({ ...prev, autoSync: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass rounded-xl gradient-border">
            <CardHeader>
              <CardTitle className="text-theme-primary flex items-center gap-2">
                <Sync className="h-5 w-5" />
                Manual Sync
              </CardTitle>
              <CardDescription>Manually trigger a sync between SalesPulse and Salesforce</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-theme-primary font-medium">Last Sync</p>
                  <p className="text-sm text-theme-muted">January 20, 2024 at 2:30 PM</p>
                </div>
                <Button variant="outline">
                  <Sync className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
