"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Webhook, Plus, Trash2, ArrowLeft, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

interface WebhookEndpoint {
  id: string
  name: string
  url: string
  events: string[]
  status: "active" | "inactive" | "error"
  createdAt: string
  lastTriggered: string | null
}

// TODO: Fetch webhooks from Supabase
// const sampleWebhooks: WebhookEndpoint[] = []
  {
    id: "1",
    name: "Slack Notifications",
    url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    events: ["goal.completed", "goal.created"],
    status: "active",
    createdAt: "2024-01-15",
    lastTriggered: "2024-01-20",
  },
  {
    id: "2",
    name: "CRM Sync",
    url: "https://api.mycrm.com/webhooks/salespulse",
    events: ["activity.logged", "goal.updated"],
    status: "error",
    createdAt: "2024-01-10",
    lastTriggered: "2024-01-18",
  },
]

const availableEvents = [
  { id: "goal.created", name: "Goal Created", description: "When a new goal is created" },
  { id: "goal.updated", name: "Goal Updated", description: "When a goal is modified" },
  { id: "goal.completed", name: "Goal Completed", description: "When a goal is marked as complete" },
  { id: "activity.logged", name: "Activity Logged", description: "When new activity is recorded" },
  { id: "milestone.reached", name: "Milestone Reached", description: "When a goal milestone is achieved" },
]

export default function WebhooksPage() {
  const { actualTheme } = useTheme()
  // TODO: Initialize with real webhooks from Supabase
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newWebhook, setNewWebhook] = useState({
    name: "",
    url: "",
    events: [] as string[],
  })

  const createWebhook = () => {
    if (!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0) return

    const webhook: WebhookEndpoint = {
      id: Date.now().toString(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
      lastTriggered: null,
    }

    setWebhooks((prev) => [...prev, webhook])
    setNewWebhook({ name: "", url: "", events: [] })
    setIsCreateDialogOpen(false)
  }

  const deleteWebhook = (webhookId: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== webhookId))
  }

  const getStatusIcon = (status: WebhookEndpoint["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusBadge = (status: WebhookEndpoint["status"]) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    }
    return <Badge className={colors[status]}>{status}</Badge>
  }

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
          <Webhook className="h-7 w-7" /> Webhooks
        </h1>
        <p className="text-theme-secondary mt-2">
          Configure webhooks to receive real-time notifications when events occur in your SalesPulse account
        </p>
      </div>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-theme-primary">Webhook Endpoints</CardTitle>
              <CardDescription>Manage your webhook endpoints and the events they listen to</CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>Create New Webhook</DialogTitle>
                  <DialogDescription>Add a new webhook endpoint to receive event notifications</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="webhookName">Webhook Name</Label>
                    <Input
                      id="webhookName"
                      placeholder="e.g., Slack Notifications"
                      value={newWebhook.name}
                      onChange={(e) => setNewWebhook((prev) => ({ ...prev, name: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhookUrl">Endpoint URL</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://your-app.com/webhooks/salespulse"
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook((prev) => ({ ...prev, url: e.target.value }))}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label>Events to Listen For</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availableEvents.map((event) => (
                        <div key={event.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={event.id}
                            checked={newWebhook.events.includes(event.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewWebhook((prev) => ({ ...prev, events: [...prev.events, event.id] }))
                              } else {
                                setNewWebhook((prev) => ({
                                  ...prev,
                                  events: prev.events.filter((e) => e !== event.id),
                                }))
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <label htmlFor={event.id} className="text-sm font-medium text-theme-primary">
                              {event.name}
                            </label>
                            <p className="text-xs text-theme-muted">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createWebhook}
                    disabled={!newWebhook.name.trim() || !newWebhook.url.trim() || newWebhook.events.length === 0}
                  >
                    Create Webhook
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8">
              <Webhook className="h-12 w-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-secondary">No webhooks configured yet</p>
              <p className="text-sm text-theme-muted">
                Create your first webhook to start receiving real-time notifications
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Events</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Triggered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => (
                  <TableRow key={webhook.id}>
                    <TableCell className="font-medium">{webhook.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {webhook.url.length > 40 ? `${webhook.url.substring(0, 40)}...` : webhook.url}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(webhook.status)}
                        {getStatusBadge(webhook.status)}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(webhook.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {webhook.lastTriggered ? new Date(webhook.lastTriggered).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Webhook Payload Example</CardTitle>
          <CardDescription>Here's an example of what your webhook endpoint will receive</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            {`{
  "event": "goal.completed",
  "timestamp": "2024-01-20T10:30:00Z",
  "user_id": "user_123",
  "data": {
    "goal_id": "goal_456",
    "goal_name": "Q1 Sales Target",
    "target_value": 100000,
    "actual_value": 105000,
    "completion_date": "2024-01-20T10:30:00Z"
  }
}`}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
