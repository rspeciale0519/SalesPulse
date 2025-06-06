"use client"
import { useState } from "react"
import { ReferralLogTable } from "@/components/admin/affiliates/referral-log-table"
import type { Referral } from "@/types/affiliate"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/ui/date-range-picker" // Assuming this exists
import type { DateRange } from "react-day-picker"

// TODO: Fetch referrals from Supabase
// const sampleReferrals: Referral[] = []

export default function ReferralTrackingPage() {
  // TODO: Initialize with real referrals from Supabase
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  // Basic filtering for demonstration
  const filteredReferrals = referrals.filter((ref) => {
    const matchesSearch =
      ref.affiliateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ref.referredCustomerEmail && ref.referredCustomerEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesDate =
      dateRange?.from && dateRange?.to
        ? new Date(ref.referralDate) >= dateRange.from && new Date(ref.referralDate) <= dateRange.to
        : true

    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary">Referral Tracking Log</h1>
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by affiliate or customer email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm glass rounded-lg"
        />
        <DatePickerWithRange
          date={dateRange}
          onDateChange={setDateRange}
          className="glass rounded-lg" // Ensure DatePickerWithRange accepts className
        />
      </div>
      <ReferralLogTable referrals={filteredReferrals} />
    </div>
  )
}
