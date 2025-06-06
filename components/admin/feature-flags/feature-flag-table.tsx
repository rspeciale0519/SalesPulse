"use client"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { FeatureFlag } from "@/types/admin" // Assuming a type definition

interface FeatureFlagTableProps {
  featureFlags: FeatureFlag[]
  onEdit: (flag: FeatureFlag) => void
  onDelete: (flagId: string) => void
  onToggle: (flagId: string, enabled: boolean) => void
}

export function FeatureFlagTable({ featureFlags, onEdit, onDelete, onToggle }: FeatureFlagTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Rollout (%)</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {featureFlags.map((flag) => (
          <TableRow key={flag.id}>
            <TableCell className="font-medium">{flag.name}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{flag.description}</TableCell>
            <TableCell>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={flag.enabled}
                  onCheckedChange={(checked) => onToggle(flag.id, checked)}
                  aria-label={`Toggle ${flag.name}`}
                />
                <Badge
                  variant={flag.enabled ? "default" : "outline"}
                  className={
                    flag.enabled
                      ? "bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30"
                      : "bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20"
                  }
                >
                  {flag.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </TableCell>
            <TableCell>{flag.rolloutPercentage}%</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(flag)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(flag.id)}
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
