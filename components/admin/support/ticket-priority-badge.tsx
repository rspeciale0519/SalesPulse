import { Badge } from "@/components/ui/badge"
import type { TicketPriority } from "@/types/admin"

interface TicketPriorityBadgeProps {
  priority: TicketPriority
}

export function TicketPriorityBadge({ priority }: TicketPriorityBadgeProps) {
  const priorityStyles: Record<TicketPriority, string> = {
    Low: "bg-sky-500 hover:bg-sky-600 text-white",
    Medium: "bg-yellow-500 hover:bg-yellow-600 text-black",
    High: "bg-orange-500 hover:bg-orange-600 text-white",
    Urgent: "bg-red-600 hover:bg-red-700 text-white animate-pulse",
  }

  return <Badge className={`${priorityStyles[priority]} text-xs`}>{priority}</Badge>
}
