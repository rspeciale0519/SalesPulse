"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import type { CommissionRule } from "@/types/affiliate"
import { Badge } from "@/components/ui/badge"

interface CommissionRuleTableProps {
  rules: CommissionRule[]
  onEdit: (rule: CommissionRule) => void
  onDelete: (ruleId: string) => void
}

export function CommissionRuleTable({ rules, onEdit, onDelete }: CommissionRuleTableProps) {
  return (
    <div className="rounded-lg border glass overflow-hidden gradient-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-theme-primary">Rule Name</TableHead>
            <TableHead className="text-theme-primary">Type</TableHead>
            <TableHead className="text-theme-primary">Rate/Amount</TableHead>
            <TableHead className="text-theme-primary">Applies To</TableHead>
            <TableHead className="text-theme-primary">Status</TableHead>
            <TableHead className="text-theme-primary text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id} className="hover:bg-theme-hover">
              <TableCell className="font-medium text-theme-primary">{rule.name}</TableCell>
              <TableCell className="text-theme-secondary capitalize">{rule.type}</TableCell>
              <TableCell className="text-theme-secondary">
                {rule.type === "percentage" ? `${(rule.rate * 100).toFixed(0)}%` : `$${rule.fixedAmount?.toFixed(2)}`}
              </TableCell>
              <TableCell className="text-theme-secondary">{rule.appliesTo || "All Products/Plans"}</TableCell>
              <TableCell>
                <Badge variant={rule.isActive ? "success" : "outline"}>{rule.isActive ? "Active" : "Inactive"}</Badge>
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
                    <DropdownMenuItem onClick={() => onEdit(rule)} className="cursor-pointer hover:bg-theme-hover">
                      <Edit className="mr-2 h-4 w-4 text-blue-500" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(rule.id)}
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
      {rules.length === 0 && <p className="text-center text-theme-secondary py-4">No commission rules found.</p>}
    </div>
  )
}
