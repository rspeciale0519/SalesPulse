"use client"
import { useState } from "react"
import { PayoutRequestTable } from "@/components/admin/affiliates/payout-request-table"
import type { PayoutRequest } from "@/types/affiliate"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, AlertTriangle } from "lucide-react"

// TODO: Fetch payouts from Supabase
const samplePayoutRequests: PayoutRequest[] = []

export default function PayoutsManagementPage() {
  // TODO: Initialize with real payouts from Supabase
  const [requests, setRequests] = useState<PayoutRequest[]>(samplePayoutRequests)

  const handleApproveRequest = (requestId: string) => {
    if (window.confirm("Are you sure you want to approve this payout? This action cannot be undone easily.")) {
      setRequests(
        requests.map(
          (req) => (req.id === requestId ? { ...req, status: "paid", processedDate: new Date().toISOString() } : req), // Simplified: approve -> paid
        ),
      )
      // TODO: API call to process payment and update status
      alert(`Payout ${requestId} approved and marked as paid. (Simulated)`)
    }
  }

  const handleRejectRequest = (requestId: string) => {
    const reason = prompt("Enter reason for rejection (optional):")
    setRequests(
      requests.map((req) =>
        req.id === requestId
          ? { ...req, status: "rejected", processedDate: new Date().toISOString(), adminNotes: reason || undefined }
          : req,
      ),
    )
    // TODO: API call to update status
  }

  const totalPending = requests.filter((r) => r.status === "pending").reduce((sum, r) => sum + r.amount, 0)
  const totalPaidLast30Days = requests
    .filter((r) => r.status === "paid" && new Date(r.processedDate!) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary">Payout Management</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass rounded-xl gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-secondary">Total Pending Payouts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-primary">${totalPending.toFixed(2)}</div>
            <p className="text-xs text-theme-secondary">
              Across {requests.filter((r) => r.status === "pending").length} requests
            </p>
          </CardContent>
        </Card>
        <Card className="glass rounded-xl gradient-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-secondary">Paid (Last 30 Days)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-primary">${totalPaidLast30Days.toFixed(2)}</div>
            <p className="text-xs text-theme-secondary">
              To{" "}
              {
                new Set(
                  requests
                    .filter(
                      (r) =>
                        r.status === "paid" &&
                        new Date(r.processedDate!) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    )
                    .map((r) => r.affiliateId),
                ).size
              }{" "}
              affiliates
            </p>
          </CardContent>
        </Card>
      </div>

      <PayoutRequestTable requests={requests} onApprove={handleApproveRequest} onReject={handleRejectRequest} />
    </div>
  )
}
