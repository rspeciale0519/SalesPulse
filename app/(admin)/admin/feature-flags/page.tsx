"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { FeatureFlagTable } from "@/components/admin/feature-flags/feature-flag-table"
import { FeatureFlagForm } from "@/components/admin/feature-flags/feature-flag-form"
import type { FeatureFlag, NewFeatureFlag } from "@/types/admin" // Assuming type definitions

const initialFeatureFlags: FeatureFlag[] = []

export default function FeatureFlagsPage() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>(initialFeatureFlags)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)

  const handleAddFlag = () => {
    setEditingFlag(null)
    setIsFormOpen(true)
  }

  const handleEditFlag = (flag: FeatureFlag) => {
    setEditingFlag(flag)
    setIsFormOpen(true)
  }

  const handleDeleteFlag = (flagId: string) => {
    setFeatureFlags((flags) => flags.filter((f) => f.id !== flagId))
    // TODO: Call API to delete
  }

  const handleToggleFlag = (flagId: string, enabled: boolean) => {
    setFeatureFlags((flags) => flags.map((f) => (f.id === flagId ? { ...f, enabled } : f)))
    // TODO: Call API to update
  }

  const handleSubmitForm = (flagData: NewFeatureFlag | FeatureFlag) => {
    if ("id" in flagData && flagData.id) {
      // Editing existing flag
      setFeatureFlags((flags) => flags.map((f) => (f.id === flagData.id ? (flagData as FeatureFlag) : f)))
    } else {
      // Adding new flag
      setFeatureFlags((flags) => [...flags, { ...flagData, id: `ff${flags.length + Date.now()}` } as FeatureFlag])
    }
    // TODO: Call API to create/update
    setIsFormOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Feature Flags</h1>
        <Button onClick={handleAddFlag} className="bg-primary/80 hover:bg-primary text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Feature Flag
        </Button>
      </div>
      <div className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg rounded-lg p-0 overflow-hidden">
        <FeatureFlagTable
          featureFlags={featureFlags}
          onEdit={handleEditFlag}
          onDelete={handleDeleteFlag}
          onToggle={handleToggleFlag}
        />
      </div>
      <FeatureFlagForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingFlag}
      />
    </div>
  )
}
