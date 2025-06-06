"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { PayoutRequest } from "@/types/affiliate"
import { CheckCircle, XCircle, Clock } from "lucide-react"

interface PayoutRequestTableProps {
  requests: PayoutRequest[]
  onApprove: (requestId: string) => void
  onReject: (requestId: string) => void
}

export function PayoutRequestTable({ requests, onApprove, onReject }: PayoutRequestTableProps) {
  const getStatusBadge = (status: PayoutRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
      case "approved":
      case "paid": // Assuming approved leads to paid
        return (
          <Badge variant="success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
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
            <TableHead className="text-theme-primary">Affiliate Name</TableHead>
            <TableHead className="text-theme-primary">Amount</TableHead>
            <TableHead className="text-theme-primary">Requested Date</TableHead>
            <TableHead className="text-theme-primary">Payment Method</TableHead>
            <TableHead className="text-theme-primary">Status</TableHead>
            <TableHead className="text-theme-primary text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-theme-hover">
              <TableCell className="font-medium text-theme-primary">{request.affiliateName}</TableCell>
              <TableCell className="text-theme-secondary">${request.amount.toFixed(2)}</TableCell>
              <TableCell className="text-theme-secondary">
                {new Date(request.requestDate).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-theme-secondary capitalize">{request.paymentMethod}</TableCell>
              <TableCell>{getStatusBadge(request.status)}</TableCell>
              <TableCell className="text-right">
                {request.status === "pending" && (
                  <div className="space-x-2">
                    <Button size="sm" variant="success" onClick={() => onApprove(request.id)} className="rounded-lg">
                      <CheckCircle className="mr-1 h-4 w-4" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onReject(request.id)} className="rounded-lg">
                      <XCircle className="mr-1 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {requests.length === 0 && <p className="text-center text-theme-secondary py-4">No payout requests found.</p>}
    </div>
  )
}
