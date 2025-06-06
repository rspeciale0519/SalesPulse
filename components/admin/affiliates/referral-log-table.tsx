"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { Referral } from "@/types/affiliate"
import { CheckCircle, XCircle, Clock, ShoppingCart, UserPlus } from "lucide-react"

interface ReferralLogTableProps {
  referrals: Referral[]
}

export function ReferralLogTable({ referrals }: ReferralLogTableProps) {
  const getStatusBadge = (status: Referral["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "converted":
        return (
          <Badge variant="success">
            <UserPlus className="mr-1 h-3 w-3" />
            Converted (Sign-up)
          </Badge>
        )
      case "sale_completed":
        return (
          <Badge variant="purple">
            <ShoppingCart className="mr-1 h-3 w-3" />
            Sale Completed
          </Badge>
        ) // Assuming a purple variant exists or can be added
      case "commission_paid":
        return (
          <Badge variant="cyan">
            <CheckCircle className="mr-1 h-3 w-3" />
            Commission Paid
          </Badge>
        ) // Assuming a cyan variant
      case "invalid":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Invalid
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="rounded-lg border glass overflow-hidden gradient-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-theme-primary">Date</TableHead>
            <TableHead className="text-theme-primary">Affiliate Name</TableHead>
            <TableHead className="text-theme-primary">Customer Info</TableHead>
            <TableHead className="text-theme-primary">Type</TableHead>
            <TableHead className="text-theme-primary">Commission Value</TableHead>
            <TableHead className="text-theme-primary">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id} className="hover:bg-theme-hover">
              <TableCell className="text-theme-secondary">{new Date(referral.referralDate).toLocaleString()}</TableCell>
              <TableCell className="font-medium text-theme-primary">{referral.affiliateName}</TableCell>
              <TableCell className="text-theme-secondary">
                {referral.referredCustomerEmail || referral.referredCustomerId || "N/A"}
              </TableCell>
              <TableCell className="text-theme-secondary capitalize">{referral.type}</TableCell>
              <TableCell className="text-theme-secondary">
                {referral.commissionValue ? `$${referral.commissionValue.toFixed(2)}` : "N/A"}
              </TableCell>
              <TableCell>{getStatusBadge(referral.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {referrals.length === 0 && <p className="text-center text-theme-secondary py-4">No referrals found.</p>}
    </div>
  )
}
