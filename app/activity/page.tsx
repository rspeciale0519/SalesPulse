"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Edit, Trash2, Filter } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { BulletproofInput } from "@/components/bulletproof-input"
import { useFocusPreservation } from "@/hooks/use-focus-preservation"

const ActivityLog = () => {
  const { actualTheme } = useTheme()

  // Initialize focus preservation
  useFocusPreservation()

  const [activities] = useState([
    { id: 1, date: "2024-01-15", type: "Calls", count: 25, source: "Manual", notes: "Morning batch" },
    { id: 2, date: "2024-01-15", type: "Appointments", count: 3, source: "RingCentral", notes: "Follow-ups scheduled" },
    { id: 3, date: "2024-01-14", type: "Deals", count: 1, source: "Manual", notes: "Closed $2,500 deal" },
    { id: 4, date: "2024-01-14", type: "Calls", count: 30, source: "Twilio", notes: "Automated sync" },
  ])

  // Simple string state
  const [formData, setFormData] = useState({
    activityType: "",
    count: "",
    date: "",
    notes: "",
  })

  const updateFormData = useCallback((key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }, [])

  const getInputClasses = useCallback(() => {
    return actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 text-white focus:border-red-400"
      : "input-theme bg-white/90 border-gray-300 text-black focus:border-red-400"
  }, [actualTheme])

  const getSelectClasses = useCallback(() => {
    return actualTheme === "dark"
      ? "select-theme bg-zinc-800/80 border-zinc-600 text-white"
      : "select-theme bg-white/90 border-gray-300 text-black"
  }, [actualTheme])

  const handleSubmit = useCallback(() => {
    const countNum = Number.parseInt(formData.count) || 0
    if (formData.activityType && countNum > 0 && formData.date) {
      console.log("Adding activity:", {
        type: formData.activityType,
        count: countNum,
        date: formData.date,
        notes: formData.notes,
      })
      // Reset form
      setFormData({
        activityType: "",
        count: "",
        date: "",
        notes: "",
      })
    }
  }, [formData])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-red-400" />
        <h1 className="text-3xl font-bold text-theme-primary">Activity Log</h1>
      </div>

      {/* Entry Form */}
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Log New Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-theme-secondary">Activity Type</Label>
              <Select value={formData.activityType} onValueChange={(value) => updateFormData("activityType", value)}>
                <SelectTrigger className={getSelectClasses()}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className={`glass ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                  <SelectItem value="calls">Calls</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="deals">Deals</SelectItem>
                  <SelectItem value="referrals">Referrals</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-theme-secondary">Count</Label>
              <BulletproofInput
                id="activity-count"
                initialValue={formData.count}
                onValueChange={(value) => updateFormData("count", value)}
                className={getInputClasses()}
                placeholder="0"
                maxLength={4}
                max={9999}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-theme-secondary">Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData("date", e.target.value)}
                className={getInputClasses()}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-theme-secondary">Notes</Label>
              <Input
                type="text"
                placeholder="Optional notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                className={getInputClasses()}
                maxLength={100}
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button className="gradient-primary hover:opacity-90" onClick={handleSubmit}>
              <Plus className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="glass rounded-xl gradient-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-400" />
            <Select>
              <SelectTrigger className={`w-40 ${getSelectClasses()}`}>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className={`glass ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="calls">Calls</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="deals">Deals</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className={`w-40 ${getSelectClasses()}`}>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent className={`glass ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="ringcentral">RingCentral</SelectItem>
                <SelectItem value="twilio">Twilio</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto text-sm text-theme-muted">Last synced with Twilio: 5 minutes ago</div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Date</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Type</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Count</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Source</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Notes</th>
                  <th className="text-left text-sm font-medium text-theme-secondary pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className={`border-b glass-hover ${
                      actualTheme === "dark" ? "border-slate-700/50" : "border-gray-200/50"
                    }`}
                  >
                    <td className="py-4 text-sm text-theme-primary">{activity.date}</td>
                    <td className="py-4 text-sm text-theme-primary">{activity.type}</td>
                    <td className="py-4 text-sm text-theme-primary font-medium">{activity.count}</td>
                    <td className="py-4">
                      <Badge variant={activity.source === "Manual" ? "outline" : "secondary"} className="text-xs">
                        {activity.source}
                      </Badge>
                    </td>
                    <td className="py-4 text-sm text-theme-secondary">{activity.notes}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${
                            actualTheme === "dark"
                              ? "text-slate-400 hover:text-white"
                              : "text-gray-600 hover:text-black"
                          }`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`${
                            actualTheme === "dark"
                              ? "text-slate-400 hover:text-red-400"
                              : "text-gray-600 hover:text-red-600"
                          }`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ActivityLog
