"use client"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle, XCircle } from "lucide-react"
import type { Affiliate } from "@/types/affiliate"
import { Badge } from "@/components/ui/badge"

interface AffiliateTableProps {
  affiliates: Affiliate[]
  onEdit: (affiliate: Affiliate) => void
  onDelete: (affiliateId: string) => void
  onApprove: (affiliateId: string) => void
  onReject: (affiliateId: string) => void
}

export function AffiliateTable({ affiliates, onEdit, onDelete, onApprove, onReject }: AffiliateTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAffiliates = affiliates.filter(
    (affiliate) =>
      affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affiliate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (affiliate.referralCode && affiliate.referralCode.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusBadge = (status: Affiliate["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "pending":
        return <Badge variant="warning">Pending</Badge>
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">
            Rejected
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search affiliates..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm glass rounded-lg"
      />
      <div className="rounded-lg border glass overflow-hidden gradient-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-theme-primary">Name</TableHead>
              <TableHead className="text-theme-primary">Email</TableHead>
              <TableHead className="text-theme-primary">Referral Code</TableHead>
              <TableHead className="text-theme-primary">Status</TableHead>
              <TableHead className="text-theme-primary">Joined Date</TableHead>
              <TableHead className="text-theme-primary text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAffiliates.map((affiliate) => (
              <TableRow key={affiliate.id} className="hover:bg-theme-hover">
                <TableCell className="font-medium text-theme-primary">{affiliate.name}</TableCell>
                <TableCell className="text-theme-secondary">{affiliate.email}</TableCell>
                <TableCell className="text-theme-secondary">{affiliate.referralCode || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                <TableCell className="text-theme-secondary">
                  {new Date(affiliate.joinedDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4 text-theme-secondary" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass rounded-lg gradient-border">
                      {affiliate.status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onApprove(affiliate.id)}
                            className="cursor-pointer hover:bg-theme-hover"
                          >
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onReject(affiliate.id)}
                            className="cursor-pointer hover:bg-theme-hover"
                          >
                            <XCircle className="mr-2 h-4 w-4 text-red-500" /> Reject
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => onEdit(affiliate)}
                        className="cursor-pointer hover:bg-theme-hover"
                      >
                        <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => alert(`View details for ${affiliate.name}`)}
                        className="cursor-pointer hover:bg-theme-hover"
                      >
                        <Eye className="mr-2 h-4 w-4 text-gray-500" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(affiliate.id)}
                        className="cursor-pointer hover:bg-theme-hover text-red-600"
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
      </div>
      {filteredAffiliates.length === 0 && <p className="text-center text-theme-secondary py-4">No affiliates found.</p>}
    </div>
  )
}
