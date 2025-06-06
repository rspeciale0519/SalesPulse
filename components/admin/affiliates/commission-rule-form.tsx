"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommissionRule, CommissionType } from "@/types/affiliate"

interface CommissionRuleFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (rule: Omit<CommissionRule, "id">) => void
  initialData?: CommissionRule | null
}

const initialFormState: Omit<CommissionRule, "id"> = {
  name: "",
  type: "percentage",
  rate: 0.1,
  fixedAmount: 0,
  appliesTo: "", // e.g., specific plan ID or "all"
  isActive: true,
  description: "",
}

export function CommissionRuleForm({ isOpen, onClose, onSubmit, initialData }: CommissionRuleFormProps) {
  const [formData, setFormData] = useState<Omit<CommissionRule, "id">>(initialFormState)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData(initialFormState)
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const val = type === "number" ? Number.parseFloat(value) : value
    setFormData((prev) => ({ ...prev, [name]: val }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isActive: checked }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] glass rounded-xl gradient-border">
        <DialogHeader>
          <DialogTitle className="text-theme-primary">
            {initialData ? "Edit Commission Rule" : "Add New Commission Rule"}
          </DialogTitle>
          <DialogDescription className="text-theme-secondary">
            Define the terms for affiliate commissions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-theme-primary">
              Rule Name
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="type" className="text-theme-primary">
              Commission Type
            </Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) => handleSelectChange("type", value as CommissionType)}
            >
              <SelectTrigger className="w-full glass rounded-lg">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass rounded-lg gradient-border">
                <SelectItem value="percentage">Percentage of Sale</SelectItem>
                <SelectItem value="fixed">Fixed Amount per Referral/Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {formData.type === "percentage" && (
            <div>
              <Label htmlFor="rate" className="text-theme-primary">
                Percentage Rate (e.g., 0.1 for 10%)
              </Label>
              <Input
                id="rate"
                name="rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.rate}
                onChange={handleChange}
                className="glass rounded-lg"
              />
            </div>
          )}
          {formData.type === "fixed" && (
            <div>
              <Label htmlFor="fixedAmount" className="text-theme-primary">
                Fixed Amount ($)
              </Label>
              <Input
                id="fixedAmount"
                name="fixedAmount"
                type="number"
                step="0.01"
                min="0"
                value={formData.fixedAmount}
                onChange={handleChange}
                className="glass rounded-lg"
              />
            </div>
          )}
          <div>
            <Label htmlFor="appliesTo" className="text-theme-primary">
              Applies To (e.g., Plan ID, "all")
            </Label>
            <Input
              id="appliesTo"
              name="appliesTo"
              value={formData.appliesTo}
              onChange={handleChange}
              placeholder="Leave empty for all"
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="description" className="text-theme-primary">
              Description (optional)
            </Label>
            <Input
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              className="glass rounded-lg"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={formData.isActive} onCheckedChange={handleSwitchChange} />
            <Label htmlFor="isActive" className="text-theme-primary">
              Active
            </Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="glass rounded-lg">
              Cancel
            </Button>
            <Button type="submit" className="bg-theme-accent hover:bg-theme-accent/90 text-white rounded-lg">
              {initialData ? "Save Rule" : "Add Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
