"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import type { Coupon, NewCoupon } from "@/types/admin" // Assuming type definitions

interface CouponFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (coupon: NewCoupon | Coupon) => void
  initialData?: Coupon | null
  // pricingPlans: { id: string; name: string }[]; // To select applicable plans
}

export function CouponForm({ isOpen, onClose, onSubmit, initialData }: CouponFormProps) {
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [isActive, setIsActive] = useState(true)
  const [maxUses, setMaxUses] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined)
  // const [appliesToPlanIds, setAppliesToPlanIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setCode(initialData.code)
      setDiscountType(initialData.discountType)
      setDiscountValue(initialData.discountValue)
      setIsActive(initialData.isActive)
      setMaxUses(initialData.maxUses)
      setExpiresAt(initialData.expiresAt ? new Date(initialData.expiresAt) : undefined)
      // setAppliesToPlanIds(initialData.appliesToPlanIds || []);
    } else {
      setCode("")
      setDiscountType("percentage")
      setDiscountValue(0)
      setIsActive(true)
      setMaxUses(null)
      setExpiresAt(undefined)
      // setAppliesToPlanIds([]);
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const couponData = {
      code,
      discountType,
      discountValue,
      isActive,
      maxUses,
      expiresAt: expiresAt?.toISOString(),
      // appliesToPlanIds,
    }
    if (initialData) {
      onSubmit({ ...initialData, ...couponData, timesUsed: initialData.timesUsed }) // Ensure timesUsed is preserved
    } else {
      onSubmit({ ...couponData, timesUsed: 0 })
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/80 backdrop-blur-lg border-border/30">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Create"} Coupon</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-3">
          <div>
            <Label htmlFor="code">Coupon Code</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
          </div>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="discountValue">Value ({discountType === "percentage" ? "%" : "$"})</Label>
              <Input
                id="discountValue"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number.parseFloat(e.target.value))}
                required
                min={0}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="maxUses">Max Uses (leave blank for unlimited)</Label>
            <Input
              id="maxUses"
              type="number"
              value={maxUses === null ? "" : maxUses}
              onChange={(e) => setMaxUses(e.target.value ? Number.parseInt(e.target.value) : null)}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expires At</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !expiresAt && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={expiresAt} onSelect={setExpiresAt} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="isActive">Active</Label>
          </div>
          {/* TODO: Add multi-select for pricing plans */}
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit}>
            {initialData ? "Save Changes" : "Create Coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
