"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { AuditLogEntry } from "@/types/admin" // Assuming a type definition
import { format } from "date-fns"

interface AuditLogTableProps {
  logs: AuditLogEntry[]
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Timestamp</TableHead>
          <TableHead>Admin User</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Entity ID</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(log.timestamp), "MMM d, yyyy, h:mm:ss a")}
            </TableCell>
            <TableCell>
              {log.adminUserName} ({log.adminUserId})
            </TableCell>
            <TableCell>
              <Badge variant="secondary">{log.action}</Badge>
            </TableCell>
            <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{log.entityId || "N/A"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
