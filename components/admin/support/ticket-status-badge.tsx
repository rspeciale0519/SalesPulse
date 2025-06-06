import { Badge } from "@/components/ui/badge"
import type { TicketStatus } from "@/types/admin"

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" = "default"
  switch (status) {
    case "Open":
      variant = "success"
      break
    case "In Progress":
      variant = "default" // Blueish by default in shadcn
      break
    case "Pending User":
      variant = "warning"
      break
    case "On Hold":
      variant = "secondary"
      break
    case "Resolved":
      variant = "outline" // Or a light green
      break
    case "Closed":
      variant = "destructive" // Or a greyed out one
      break
  }

  // Custom styling for specific statuses if Badge variants aren't enough
  const statusStyles: Record<TicketStatus, string> = {
    Open: "bg-green-500 hover:bg-green-600 text-white",
    "In Progress": "bg-blue-500 hover:bg-blue-600 text-white",
    "Pending User": "bg-yellow-500 hover:bg-yellow-600 text-black",
    "On Hold": "bg-gray-500 hover:bg-gray-600 text-white",
    Resolved: "bg-teal-500 hover:bg-teal-600 text-white",
    Closed: "bg-slate-700 hover:bg-slate-800 text-slate-300",
  }

  return <Badge className={`${statusStyles[status]} text-xs`}>{status}</Badge>
}
