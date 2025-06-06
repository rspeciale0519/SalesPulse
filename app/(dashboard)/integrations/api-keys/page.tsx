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
import { Key, Plus, Copy, Eye, EyeOff, Trash2, Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"

interface ApiKey {
  id: string
  name: string
  key: string
  scopes: string[]
  createdAt: string
  lastUsed: string | null
  isActive: boolean
}

// TODO: Fetch API keys from Supabase
// const sampleApiKeys: ApiKey[] = []

export default function ApiKeysPage() {
  const { actualTheme } = useTheme()
  // TODO: Initialize with real API keys from Supabase
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [showKey, setShowKey] = useState<Record<string, boolean>>({})
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])

  const availableScopes = [
    { id: "goals:read", name: "Read Goals", description: "View your goals and progress" },
    { id: "goals:write", name: "Write Goals", description: "Create and update goals" },
    { id: "activity:read", name: "Read Activity", description: "View your activity logs" },
    { id: "activity:write", name: "Write Activity", description: "Log new activities" },
    { id: "profile:read", name: "Read Profile", description: "Access your profile information" },
    { id: "analytics:read", name: "Read Analytics", description: "View your performance analytics" },
  ]

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey((prev) => ({ ...prev, [keyId]: !prev[keyId] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const createApiKey = () => {
    if (!newKeyName.trim() || selectedScopes.length === 0) return

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sp_user_${Math.random().toString(36).substring(2, 34)}`,
      scopes: selectedScopes,
      createdAt: new Date().toISOString().split("T")[0],
      lastUsed: null,
      isActive: true,
    }

    setApiKeys((prev) => [...prev, newKey])
    setNewKeyName("")
    setSelectedScopes([])
    setIsCreateDialogOpen(false)
  }

  const deleteApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId))
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
          <Key className="h-7 w-7" /> API Keys
        </h1>
        <p className="text-theme-secondary mt-2">
          Generate and manage API keys to connect your SalesPulse data with external applications
        </p>
      </div>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-theme-primary">Your API Keys</CardTitle>
              <CardDescription>
                API keys allow external applications to access your SalesPulse data securely
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Generate a new API key with specific permissions for your integration
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keyName">API Key Name</Label>
                    <Input
                      id="keyName"
                      placeholder="e.g., Salesforce Integration"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      {availableScopes.map((scope) => (
                        <div key={scope.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={scope.id}
                            checked={selectedScopes.includes(scope.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedScopes((prev) => [...prev, scope.id])
                              } else {
                                setSelectedScopes((prev) => prev.filter((s) => s !== scope.id))
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <label htmlFor={scope.id} className="text-sm font-medium text-theme-primary">
                              {scope.name}
                            </label>
                            <p className="text-xs text-theme-muted">{scope.description}</p>
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
                  <Button onClick={createApiKey} disabled={!newKeyName.trim() || selectedScopes.length === 0}>
                    Create API Key
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-theme-muted mx-auto mb-4" />
              <p className="text-theme-secondary">No API keys created yet</p>
              <p className="text-sm text-theme-muted">
                Create your first API key to start integrating with external services
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">{apiKey.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {showKey[apiKey.id] ? apiKey.key : `${apiKey.key.substring(0, 12)}...`}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)}>
                          {showKey[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(apiKey.key)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {apiKey.scopes.map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(apiKey.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          apiKey.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }
                      >
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
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
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-theme-primary">Keep your API keys secure</p>
              <p className="text-xs text-theme-muted">
                Never share your API keys publicly or commit them to version control
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-theme-primary">Use minimal permissions</p>
              <p className="text-xs text-theme-muted">Only grant the scopes that your integration actually needs</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <div>
              <p className="text-sm font-medium text-theme-primary">Rotate keys regularly</p>
              <p className="text-xs text-theme-muted">
                Delete unused keys and create new ones periodically for better security
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
