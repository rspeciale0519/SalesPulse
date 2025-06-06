"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Affiliate, AffiliateStatus } from "@/types/affiliate"

interface AffiliateFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (affiliate: Omit<Affiliate, "id" | "joinedDate" | "referrals" | "totalEarnings" | "balance">) => void
  initialData?: Affiliate | null
}

const initialFormState = {
  name: "",
  email: "",
  referralCode: "",
  status: "pending" as AffiliateStatus,
  commissionRate: 0.1, // Default 10%
  paymentDetails: {
    paypalEmail: "",
    bankAccountInfo: "", // Simplified
  },
}

export function AffiliateForm({ isOpen, onClose, onSubmit, initialData }: AffiliateFormProps) {
  const [formData, setFormData] =
    useState<Omit<Affiliate, "id" | "joinedDate" | "referrals" | "totalEarnings" | "balance">>(initialFormState)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        referralCode: initialData.referralCode || "",
        status: initialData.status,
        commissionRate: initialData.commissionRate,
        paymentDetails: initialData.paymentDetails || { paypalEmail: "", bankAccountInfo: "" },
      })
    } else {
      setFormData(initialFormState)
    }
  }, [initialData, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePaymentDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      paymentDetails: {
        ...prev.paymentDetails,
        [name]: value,
      },
    }))
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
            {initialData ? "Edit Affiliate" : "Add New Affiliate"}
          </DialogTitle>
          <DialogDescription className="text-theme-secondary">
            {initialData ? "Update the affiliate's details." : "Fill in the details for the new affiliate."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-theme-primary">
              Name
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
            <Label htmlFor="email" className="text-theme-primary">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="referralCode" className="text-theme-primary">
              Referral Code (optional)
            </Label>
            <Input
              id="referralCode"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              className="glass rounded-lg"
            />
            <p className="text-xs text-theme-secondary mt-1">If empty, a unique code will be generated.</p>
          </div>
          <div>
            <Label htmlFor="status" className="text-theme-primary">
              Status
            </Label>
            <Select
              name="status"
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value as AffiliateStatus)}
            >
              <SelectTrigger className="w-full glass rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="glass rounded-lg gradient-border">
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="commissionRate" className="text-theme-primary">
              Commission Rate (e.g., 0.1 for 10%)
            </Label>
            <Input
              id="commissionRate"
              name="commissionRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.commissionRate}
              onChange={handleChange}
              required
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="paypalEmail" className="text-theme-primary">
              PayPal Email (for payouts)
            </Label>
            <Input
              id="paypalEmail"
              name="paypalEmail"
              type="email"
              value={formData.paymentDetails.paypalEmail}
              onChange={handlePaymentDetailsChange}
              className="glass rounded-lg"
            />
          </div>
          <div>
            <Label htmlFor="bankAccountInfo" className="text-theme-primary">
              Bank Account Info (for payouts, optional)
            </Label>
            <Input
              id="bankAccountInfo"
              name="bankAccountInfo"
              value={formData.paymentDetails.bankAccountInfo}
              onChange={handlePaymentDetailsChange}
              className="glass rounded-lg"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="glass rounded-lg">
              Cancel
            </Button>
            <Button type="submit" className="bg-theme-accent hover:bg-theme-accent/90 text-white rounded-lg">
              {initialData ? "Save Changes" : "Add Affiliate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
