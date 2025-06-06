"use client"
import { useState } from "react"
import { AffiliateProgramSettingsForm } from "@/components/admin/affiliates/affiliate-program-settings-form"
import type { AffiliateProgramSettings } from "@/types/affiliate"

const initialSettingsData: AffiliateProgramSettings = {
  allowPublicSignup: true,
  defaultCommissionRate: 0.15, // 15%
  cookieDurationDays: 30,
  minimumPayoutAmount: 50, // $50
  payoutSchedule: "NET30", // Payout 30 days after month end
  termsAndConditions: "Sample terms and conditions for the affiliate program...",
  // Add other settings as needed
}

export default function AffiliateProgramSettingsPage() {
  const [settings, setSettings] = useState<AffiliateProgramSettings>(initialSettingsData)

  const handleSaveSettings = (updatedSettings: AffiliateProgramSettings) => {
    setSettings(updatedSettings)
    // TODO: API call to save settings to the database
    console.log("Affiliate Program Settings saved:", updatedSettings)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary">Affiliate Program Settings</h1>
      <AffiliateProgramSettingsForm initialSettings={settings} onSave={handleSaveSettings} />
    </div>
  )
}
