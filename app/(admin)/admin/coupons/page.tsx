"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { CouponTable } from "@/components/admin/coupons/coupon-table"
import { CouponForm } from "@/components/admin/coupons/coupon-form"
import type { Coupon, NewCoupon } from "@/types/admin" // Assuming type definitions

const initialCoupons: Coupon[] = []

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const handleAddCoupon = () => {
    setEditingCoupon(null)
    setIsFormOpen(true)
  }

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setIsFormOpen(true)
  }

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId))
    // TODO: Call API to delete
  }

  const handleSubmitForm = (couponData: NewCoupon | Coupon) => {
    if ("id" in couponData && couponData.id) {
      // Editing
      setCoupons((prev) => prev.map((c) => (c.id === couponData.id ? (couponData as Coupon) : c)))
    } else {
      // Adding
      setCoupons((prev) => [...prev, { ...couponData, id: `coup${prev.length + Date.now()}` } as Coupon])
    }
    // TODO: Call API to create/update
    setIsFormOpen(false)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Coupon Management</h1>
        <Button onClick={handleAddCoupon} className="bg-primary/80 hover:bg-primary text-primary-foreground">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>
      <div className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg rounded-lg p-0 overflow-hidden">
        <CouponTable coupons={coupons} onEdit={handleEditCoupon} onDelete={handleDeleteCoupon} />
      </div>
      <CouponForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmitForm}
        initialData={editingCoupon}
        // pricingPlans={samplePricingPlans} // Pass actual pricing plans here
      />
    </div>
  )
}
