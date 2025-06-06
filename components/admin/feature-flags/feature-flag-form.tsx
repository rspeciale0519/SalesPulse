"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import type { FeatureFlag, NewFeatureFlag } from "@/types/admin"

interface FeatureFlagFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (flag: NewFeatureFlag | FeatureFlag) => void
  initialData?: FeatureFlag | null
}

export function FeatureFlagForm({ isOpen, onClose, onSubmit, initialData }: FeatureFlagFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [enabled, setEnabled] = useState(false)
  const [rolloutPercentage, setRolloutPercentage] = useState(0)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setEnabled(initialData.enabled)
      setRolloutPercentage(initialData.rolloutPercentage)
    } else {
      setName("")
      setDescription("")
      setEnabled(false)
      setRolloutPercentage(0)
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const flagData = { name, description, enabled, rolloutPercentage }
    if (initialData) {
      onSubmit({ ...initialData, ...flagData })
    } else {
      onSubmit(flagData)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-card/80 backdrop-blur-lg border-border/30">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Create"} Feature Flag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="enabled" className="text-right">
                Enabled
              </Label>
              <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollout" className="text-right">
                Rollout (%)
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Slider
                  id="rollout"
                  min={0}
                  max={100}
                  step={1}
                  value={[rolloutPercentage]}
                  onValueChange={(value) => setRolloutPercentage(value[0])}
                  className="flex-grow"
                />
                <span className="w-10 text-sm text-muted-foreground">{rolloutPercentage}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">{initialData ? "Save Changes" : "Create Flag"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
