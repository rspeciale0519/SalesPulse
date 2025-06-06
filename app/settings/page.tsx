"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Zap, Bell, Shield } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { BulletproofInput } from "@/components/bulletproof-input"
import { useFocusPreservation } from "@/hooks/use-focus-preservation"

const SettingsPage = () => {
  const { actualTheme } = useTheme()

  // Initialize focus preservation
  useFocusPreservation()

  // Simple string state
  const [workSchedule, setWorkSchedule] = useState({
    daysPerWeek: "5",
    weeksPerYear: "50",
  })

  const updateWorkSchedule = useCallback((key: string, value: string) => {
    setWorkSchedule((prev) => ({ ...prev, [key]: value }))
  }, [])

  const getInputClasses = useCallback(() => {
    return actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 text-white focus:border-red-400"
      : "input-theme bg-white/90 border-gray-300 text-black focus:border-red-400"
  }, [actualTheme])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-red-400" />
        <h1 className="text-3xl font-bold text-theme-primary">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-theme-secondary">Full Name</Label>
              {/* TODO: Fetch user profile from Supabase */}
              <Input type="text" defaultValue="" placeholder="Enter your full name" className={getInputClasses()} maxLength={50} />
            </div>
            <div className="space-y-2">
              <Label className="text-theme-secondary">Email</Label>
              {/* TODO: Fetch user email from Supabase auth */}
              <Input type="email" defaultValue="" placeholder="your@email.com" className={getInputClasses()} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label className="text-theme-secondary">Phone</Label>
              {/* TODO: Fetch user phone from Supabase profile */}
              <Input type="tel" defaultValue="" placeholder="+1 (555) 123-4567" className={getInputClasses()} maxLength={20} />
            </div>
            <Button className="gradient-primary hover:opacity-90">Save Changes</Button>
          </CardContent>
        </Card>

        {/* Work Schedule */}
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary">Work Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-theme-secondary">Days per Week</Label>
                <BulletproofInput
                  id="settings-days-per-week"
                  initialValue={workSchedule.daysPerWeek}
                  onValueChange={(value) => updateWorkSchedule("daysPerWeek", value)}
                  className={getInputClasses()}
                  maxLength={1}
                  max={7}
                  placeholder="1-7"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-theme-secondary">Work Weeks/Year</Label>
                <BulletproofInput
                  id="settings-weeks-per-year"
                  initialValue={workSchedule.weeksPerYear}
                  onValueChange={(value) => updateWorkSchedule("weeksPerYear", value)}
                  className={getInputClasses()}
                  maxLength={2}
                  max={52}
                  placeholder="1-52"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-theme-secondary">Time Zone</Label>
              <Input type="text" defaultValue="EST (UTC-5)" className={getInputClasses()} maxLength={30} />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">RC</span>
                </div>
                <div>
                  <p className="text-theme-primary font-medium">RingCentral</p>
                  <p className="text-sm text-theme-muted">Call tracking & analytics</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Connected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className={`glass ${
                    actualTheme === "dark"
                      ? "border-slate-600 text-theme-primary"
                      : "border-gray-300 text-theme-primary"
                  }`}
                >
                  Configure
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">T</span>
                </div>
                <div>
                  <p className="text-theme-primary font-medium">Twilio</p>
                  <p className="text-sm text-theme-muted">SMS & communication</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Disconnected
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className={`glass ${
                    actualTheme === "dark"
                      ? "border-slate-600 text-theme-primary"
                      : "border-gray-300 text-theme-primary"
                  }`}
                >
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">Goal Reminders</p>
                <p className="text-sm text-theme-muted">Daily progress notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">Catch-up Alerts</p>
                <p className="text-sm text-theme-muted">When behind on targets</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">Weekly Reports</p>
                <p className="text-sm text-theme-muted">Performance summaries</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Industry Module */}
        <Card className="glass rounded-xl gradient-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Industry Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 glass rounded-lg gradient-border">
                <h3 className="text-theme-primary font-medium mb-2">Insurance</h3>
                <p className="text-sm text-theme-muted mb-4">Referral tracking, policy management</p>
                <Badge className="gradient-primary text-white">Active</Badge>
              </div>
              <div className="p-4 glass rounded-lg opacity-50">
                <h3 className="text-theme-primary font-medium mb-2">Real Estate</h3>
                <p className="text-sm text-theme-muted mb-4">Property listings, client management</p>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
              <div className="p-4 glass rounded-lg opacity-50">
                <h3 className="text-theme-primary font-medium mb-2">Solar</h3>
                <p className="text-sm text-theme-muted mb-4">Installation tracking, energy metrics</p>
                <Badge variant="outline" className="text-xs">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage
