"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { AffiliateProgramSettings } from "@/types/affiliate"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface AffiliateProgramSettingsFormProps {
  initialSettings: AffiliateProgramSettings
  onSave: (settings: AffiliateProgramSettings) => void
}

export function AffiliateProgramSettingsForm({ initialSettings, onSave }: AffiliateProgramSettingsFormProps) {
  const [settings, setSettings] = useState<AffiliateProgramSettings>(initialSettings)

  useEffect(() => {
    setSettings(initialSettings)
  }, [initialSettings])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === "number" ? Number.parseInt(value, 10) : value
    setSettings((prev) => ({ ...prev, [name]: val }))
  }

  const handleSwitchChange = (name: keyof AffiliateProgramSettings, checked: boolean) => {
    setSettings((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(settings)
    alert("Settings saved successfully! (Simulated)")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">General Settings</CardTitle>
          <CardDescription className="text-theme-secondary">
            Basic configuration for the affiliate program.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="allowPublicSignup" className="text-theme-primary">
              Allow Public Affiliate Signup
            </Label>
            <div className="flex items-center space-x-2 mt-1">
              <Switch
                id="allowPublicSignup"
                checked={settings.allowPublicSignup}
                onCheckedChange={(c) => handleSwitchChange("allowPublicSignup", c)}
              />
              <span className="text-sm text-theme-secondary">
                {settings.allowPublicSignup ? "Enabled" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-theme-secondary mt-1">If disabled, admins must manually add affiliates.</p>
          </div>
          <div>
            <Label htmlFor="defaultCommissionRate" className="text-theme-primary">
              Default Commission Rate (e.g., 0.1 for 10%)
            </Label>
            <Input
              id="defaultCommissionRate"
              name="defaultCommissionRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={settings.defaultCommissionRate}
              onChange={handleChange}
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="cookieDurationDays" className="text-theme-primary">
              Referral Cookie Duration (Days)
            </Label>
            <Input
              id="cookieDurationDays"
              name="cookieDurationDays"
              type="number"
              min="1"
              value={settings.cookieDurationDays}
              onChange={handleChange}
              className="glass rounded-lg"
            />
            <p className="text-xs text-theme-secondary mt-1">How long a referral link click is tracked.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Payout Settings</CardTitle>
          <CardDescription className="text-theme-secondary">
            Configuration for affiliate commission payouts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="minimumPayoutAmount" className="text-theme-primary">
              Minimum Payout Amount ($)
            </Label>
            <Input
              id="minimumPayoutAmount"
              name="minimumPayoutAmount"
              type="number"
              step="0.01"
              min="0"
              value={settings.minimumPayoutAmount}
              onChange={handleChange}
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="payoutSchedule" className="text-theme-primary">
              Payout Schedule (e.g., "NET30", "First Monday of Month")
            </Label>
            <Input
              id="payoutSchedule"
              name="payoutSchedule"
              value={settings.payoutSchedule}
              onChange={handleChange}
              className="glass rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Affiliate Terms & Conditions</CardTitle>
          <CardDescription className="text-theme-secondary">Define the terms affiliates agree to.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="termsAndConditions"
            name="termsAndConditions"
            value={settings.termsAndConditions}
            onChange={handleChange}
            rows={10}
            className="glass rounded-lg"
            placeholder="Enter your affiliate program terms and conditions here..."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" className="bg-theme-accent hover:bg-theme-accent/90 text-white rounded-lg">
          Save Settings
        </Button>
      </div>
    </form>
  )
}
