"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ShieldCheck, Key, Palette, Bell } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function PlatformSettingsPage() {
  const { actualTheme } = useTheme()
  const inputClasses =
    actualTheme === "dark" ? "input-theme bg-zinc-800/80 border-zinc-600" : "input-theme bg-white/90 border-gray-300"

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
        <ShieldCheck className="h-7 w-7" /> Platform Settings
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Key className="h-5 w-5" /> API & Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="apiKey" className="text-theme-secondary">
                Master API Key
              </Label>
              <div className="flex items-center gap-2">
                <Input id="apiKey" type="password" value="************************" readOnly className={inputClasses} />
                <Button
                  variant="outline"
                  className={`glass ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
                >
                  Reveal
                </Button>
                <Button
                  variant="outline"
                  className={`glass ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
                >
                  Regenerate
                </Button>
              </div>
              <p className="text-xs text-theme-muted mt-1">Used for server-to-server integrations.</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-theme-muted">Require 2FA for all admin accounts.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div>
              <Label htmlFor="sessionTimeout" className="text-theme-secondary">
                Admin Session Timeout (minutes)
              </Label>
              <Input id="sessionTimeout" type="number" defaultValue="60" className={inputClasses} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl gradient-border">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Palette className="h-5 w-5" /> Branding & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="appName" className="text-theme-secondary">
                Application Name
              </Label>
              <Input id="appName" defaultValue="SalesPulse" className={inputClasses} />
            </div>
            <div>
              <Label htmlFor="logoUrl" className="text-theme-secondary">
                Logo URL (Light Mode)
              </Label>
              <Input id="logoUrl" placeholder="https://example.com/logo-light.png" className={inputClasses} />
            </div>
            <div>
              <Label htmlFor="logoDarkUrl" className="text-theme-secondary">
                Logo URL (Dark Mode)
              </Label>
              <Input id="logoDarkUrl" placeholder="https://example.com/logo-dark.png" className={inputClasses} />
            </div>
            <div>
              <Label htmlFor="faviconUrl" className="text-theme-secondary">
                Favicon URL
              </Label>
              <Input id="faviconUrl" placeholder="https://example.com/favicon.ico" className={inputClasses} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl gradient-border md:col-span-2">
          <CardHeader>
            <CardTitle className="text-theme-primary flex items-center gap-2">
              <Bell className="h-5 w-5" /> System Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="adminEmail" className="text-theme-secondary">
                Admin Notification Email
              </Label>
              <Input id="adminEmail" type="email" placeholder="admin@salespulse.com" className={inputClasses} />
              <p className="text-xs text-theme-muted mt-1">Critical system alerts will be sent to this address.</p>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">New User Sign-up Notifications</p>
                <p className="text-sm text-theme-muted">Receive an email when a new user registers.</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-theme-primary font-medium">Subscription Change Notifications</p>
                <p className="text-sm text-theme-muted">Get notified of plan upgrades, downgrades, or cancellations.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-end pt-4">
        <Button className="gradient-primary hover:opacity-90">Save Platform Settings</Button>
      </div>
    </div>
  )
}
