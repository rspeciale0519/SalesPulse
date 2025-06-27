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
import { useEnhancedInput } from "@/hooks/use-enhanced-input"

const ActivityLog = () => {
  const { actualTheme } = useTheme()

  // Initialize focus preservation
  useEnhancedInput()

  // TODO: Fetch activities from Supabase
  // const { data: activities, loading } = useActivities(userId)
  // Will be replaced with actual data from the activities table
  const [activities] = useState([])

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

  const getCardClasses = useCallback(() => {
    return "glass glass-hover rounded-xl gradient-border"
  }, [])

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
        <FileText className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-theme-primary">Activity Log</h1>
      </div>

      {/* Entry Form */}
      <Card className={`${getCardClasses()} hover:shadow-lg transition-all duration-200`}>
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
                <SelectContent className={`${getCardClasses()}`}>
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
      <Card className={`${getCardClasses()} hover:shadow-lg transition-all duration-200`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-blue-500" />
            <Select>
              <SelectTrigger className={`w-40 ${getSelectClasses()}`}>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className={getCardClasses()}>
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
              <SelectContent className={getCardClasses()}>
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
      <div className="bg-white/5 backdrop-blur-sm rounded-lg shadow-xl">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-theme-primary">Activity History</h3>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-center text-theme-secondary py-8">
                No activities recorded yet. Add your first activity above.
              </p>
            ) : (
              activities.map((activity: any) => (
                <div key={activity.id} className="p-4 rounded-lg glass glass-hover transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="min-w-[100px] justify-center">
                        {activity.type}
                      </Badge>
                      <span className="text-theme-primary font-medium">{activity.count} logged</span>
                      <span className="text-theme-muted text-sm">{activity.date}</span>
                      {activity.source && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.source}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="hover:text-red-400">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {activity.notes && (
                    <p className="text-theme-secondary text-sm mt-2">{activity.notes}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActivityLog
