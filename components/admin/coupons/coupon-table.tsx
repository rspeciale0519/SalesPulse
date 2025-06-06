"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Coupon } from "@/types/admin" // Assuming a type definition
import { format } from "date-fns"

interface CouponTableProps {
  coupons: Coupon[]
  onEdit: (coupon: Coupon) => void
  onDelete: (couponId: string) => void
}

export function CouponTable({ coupons, onEdit, onDelete }: CouponTableProps) {
  const getStatusBadge = (coupon: Coupon) => {
    const now = new Date()
    if (coupon.expiresAt && new Date(coupon.expiresAt) < now) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (!coupon.isActive) {
      return <Badge variant="outline">Inactive</Badge>
    }
    return (
      <Badge variant="default" className="bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30">
        Active
      </Badge>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Discount</TableHead>
          <TableHead>Applies To</TableHead>
          <TableHead>Usage</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Expires At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {coupons.map((coupon) => (
          <TableRow key={coupon.id}>
            <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
            <TableCell>
              {coupon.discountType === "percentage"
                ? `${coupon.discountValue}%`
                : `$${coupon.discountValue.toFixed(2)}`}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {coupon.appliesToPlanIds?.join(", ") || "All Plans"}
            </TableCell>
            <TableCell>
              {coupon.timesUsed} / {coupon.maxUses === null ? "∞" : coupon.maxUses}
            </TableCell>
            <TableCell>{getStatusBadge(coupon)}</TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {coupon.expiresAt ? format(new Date(coupon.expiresAt), "MMM d, yyyy") : "Never"}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(coupon)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(coupon.id)}
                    className="text-red-600 hover:!text-red-600 hover:!bg-red-100 dark:hover:!bg-red-700/50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
