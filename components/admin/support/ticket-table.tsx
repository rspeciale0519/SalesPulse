"use client"

import type React from "react"
import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, Filter, Eye, Edit3, UserPlus, XCircle, PlusCircle } from "lucide-react"
import type { SupportTicket } from "@/types/admin"
import { TicketStatusBadge } from "./ticket-status-badge"
import { TicketPriorityBadge } from "./ticket-priority-badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { CreateTicketForm } from "./create-ticket-form" // Import the new form

// TODO: Replace with actual ticket data fetched from Supabase
// Example query:
// const { data: tickets, error } = await supabase
//   .from('support_tickets')
//   .select(`
//     *,
//     user:users!support_tickets_user_id_fkey(id, name, email),
//     assigned_admin:users!support_tickets_assigned_to_fkey(id, name),
//     messages:support_messages(*)
//   `)
//   .eq('organization_id', orgId)
//   .order('created_at', { ascending: false })
const sampleTickets: SupportTicket[] = []

interface TicketMessage {
  id: string
  ticketId: string
  senderId: string
  senderName: string
  senderType: "user" | "admin"
  content: string
  createdAt: string
  isInternalNote?: boolean
}

export function TicketTable() {
  const [tickets, setTickets] = useState<SupportTicket[]>(sampleTickets)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false) // State for create modal

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsDetailModalOpen(true)
  }

  const handleUpdateTicket = (updatedTicket: SupportTicket) => {
    setTickets((prevTickets) => prevTickets.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)))
    // In a real app, you'd also make an API call here
  }

  const handleCreateTicket = (newTicket: SupportTicket) => {
    setTickets((prevTickets) => [newTicket, ...prevTickets]) // Add to the beginning of the list
    setIsCreateModalOpen(false) // Close the modal
    // In a real app, you'd also make an API call here
  }

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 glass"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="glass glass-hover">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gradient-accent hover:opacity-90 text-white">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create New Ticket
          </Button>
        </div>
      </div>
      <Card className="glass rounded-xl gradient-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-700/50">
              <TableHead className="text-theme-primary">Ticket ID</TableHead>
              <TableHead className="text-theme-primary">Subject</TableHead>
              <TableHead className="text-theme-primary">User</TableHead>
              <TableHead className="text-theme-primary">Status</TableHead>
              <TableHead className="text-theme-primary">Priority</TableHead>
              <TableHead className="text-theme-primary">Last Updated</TableHead>
              <TableHead className="text-theme-primary">Assigned To</TableHead>
              <TableHead className="text-theme-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.map((ticket) => (
              <TableRow key={ticket.id} className="border-slate-700/30 hover:bg-slate-800/30">
                <TableCell className="font-medium text-theme-secondary py-3">{ticket.ticketNumber}</TableCell>
                <TableCell className="text-theme-secondary py-3 max-w-xs truncate" title={ticket.subject}>
                  {ticket.subject}
                </TableCell>
                <TableCell className="text-theme-secondary py-3">
                  <div>{ticket.userName}</div>
                  <div className="text-xs text-theme-muted">{ticket.userEmail}</div>
                </TableCell>
                <TableCell className="py-3">
                  <TicketStatusBadge status={ticket.status} />
                </TableCell>
                <TableCell className="py-3">
                  <TicketPriorityBadge priority={ticket.priority} />
                </TableCell>
                <TableCell className="text-theme-secondary py-3">
                  {format(new Date(ticket.updatedAt), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell className="text-theme-secondary py-3">
                  {ticket.assignedToAdminName || "Unassigned"}
                </TableCell>
                <TableCell className="text-right py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-theme-muted hover:text-theme-primary">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass border-slate-700">
                      <DropdownMenuItem
                        onClick={() => handleViewTicket(ticket)}
                        className="text-theme-secondary hover:!bg-slate-700/50"
                      >
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-theme-secondary hover:!bg-slate-700/50">
                        <Edit3 className="mr-2 h-4 w-4" /> Quick Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700/50" />
                      <DropdownMenuItem className="text-theme-secondary hover:!bg-slate-700/50">
                        <UserPlus className="mr-2 h-4 w-4" /> Assign
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:!text-red-400 hover:!bg-red-800/30">
                        <XCircle className="mr-2 h-4 w-4" /> Close Ticket
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {filteredTickets.length === 0 && <p className="text-center text-theme-muted py-8">No tickets found.</p>}

      {selectedTicket && (
        <TicketDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          ticket={selectedTicket}
          onUpdateTicket={handleUpdateTicket}
        />
      )}

      {/* Create Ticket Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-lg glass rounded-xl gradient-border text-theme-primary">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
            <DialogDescription className="text-theme-muted">
              Fill in the details below to create a new support ticket.
            </DialogDescription>
          </DialogHeader>
          <CreateTicketForm onSubmit={handleCreateTicket} onCancel={() => setIsCreateModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Basic Ticket Detail Modal (can be expanded significantly)
interface TicketDetailModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: SupportTicket
  onUpdateTicket: (updatedTicket: SupportTicket) => void
}

function TicketDetailModal({ isOpen, onClose, ticket, onUpdateTicket }: TicketDetailModalProps) {
  const [replyContent, setReplyContent] = useState("")
  const [internalNote, setInternalNote] = useState("")
  const [currentStatus, setCurrentStatus] = useState<SupportTicket["status"]>(ticket.status)
  const [currentPriority, setCurrentPriority] = useState<SupportTicket["priority"]>(ticket.priority)
  // In a real app, adminUsers would be fetched
  const adminUsers = [
    { id: "ADMIN001", name: "Admin Bob" },
    { id: "ADMIN002", name: "Admin Charlie" },
    { id: "ADMIN003", name: "Admin Eve" },
  ]
  const [assignedAdmin, setAssignedAdmin] = useState<string | undefined>(ticket.assignedToAdminId)

  const handleAddReply = () => {
    if (!replyContent.trim()) return
    const newMessage: TicketMessage = {
      id: `MSG${Date.now()}`,
      ticketId: ticket.id,
      senderId: "CURRENT_ADMIN_ID", // Replace with actual admin ID
      senderName: "Current Admin", // Replace with actual admin name
      senderType: "admin",
      content: replyContent,
      createdAt: new Date().toISOString(),
    }
    const updatedTicket = { ...ticket, messages: [...ticket.messages, newMessage], updatedAt: new Date().toISOString() }
    onUpdateTicket(updatedTicket)
    setReplyContent("")
  }

  const handleSaveChanges = () => {
    const updatedTicket = {
      ...ticket,
      status: currentStatus,
      priority: currentPriority,
      assignedToAdminId: assignedAdmin,
      assignedToAdminName: adminUsers.find((u) => u.id === assignedAdmin)?.name,
      updatedAt: new Date().toISOString(),
    }
    // Add internal note if present
    if (internalNote.trim()) {
      const noteMessage: TicketMessage = {
        id: `NOTE${Date.now()}`,
        ticketId: ticket.id,
        senderId: "CURRENT_ADMIN_ID",
        senderName: "Current Admin",
        senderType: "admin",
        content: internalNote,
        createdAt: new Date().toISOString(),
        isInternalNote: true,
      }
      updatedTicket.messages = [...updatedTicket.messages, noteMessage]
    }
    onUpdateTicket(updatedTicket)
    setInternalNote("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl glass rounded-xl gradient-border text-theme-primary">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              Ticket: {ticket.ticketNumber} - {ticket.subject}
            </span>
            <div className="flex gap-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </DialogTitle>
          <DialogDescription className="text-theme-muted">
            Opened by {ticket.userName} ({ticket.userEmail}) on{" "}
            {format(new Date(ticket.createdAt), "MMM d, yyyy HH:mm")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-[60vh] overflow-y-auto pr-2 styled-scrollbar">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-lg text-theme-primary">Conversation History</h3>
            <div className="space-y-3">
              {ticket.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${msg.senderType === "user" ? "bg-slate-700/50" : "bg-sky-800/50"} ${msg.isInternalNote ? "border-l-4 border-yellow-500" : ""}`}
                >
                  <p className="text-sm text-theme-secondary">{msg.content}</p>
                  <p className="text-xs text-theme-muted mt-1">
                    {msg.senderName} ({msg.senderType}) - {format(new Date(msg.createdAt), "MMM d, HH:mm")}
                    {msg.isInternalNote && <span className="ml-2 font-semibold text-yellow-400">(Internal Note)</span>}
                  </p>
                </div>
              ))}
              {ticket.messages.length === 0 && <p className="text-theme-muted">No messages yet.</p>}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-700/50">
              <Label htmlFor="replyContent" className="text-theme-primary">
                Add Reply to User
              </Label>
              <Textarea
                id="replyContent"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your reply to the user..."
                className="glass min-h-[80px]"
              />
              <Button
                onClick={handleAddReply}
                className="gradient-primary hover:opacity-90 text-white"
                disabled={!replyContent.trim()}
              >
                Send Reply
              </Button>
            </div>
            <div className="space-y-2 pt-4 border-t border-slate-700/50">
              <Label htmlFor="internalNote" className="text-theme-primary">
                Add Internal Note
              </Label>
              <Textarea
                id="internalNote"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                placeholder="Type an internal note (visible to admins only)..."
                className="glass min-h-[80px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-theme-primary">Ticket Details</h3>
            <div className="space-y-2">
              <Label htmlFor="ticketStatus" className="text-theme-primary">
                Status
              </Label>
              <Select value={currentStatus} onValueChange={(value: SupportTicket["status"]) => setCurrentStatus(value)}>
                <SelectTrigger className="w-full glass">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="glass border-slate-700">
                  {(
                    [
                      "Open",
                      "In Progress",
                      "Pending User",
                      "On Hold",
                      "Resolved",
                      "Closed",
                    ] as SupportTicket["status"][]
                  ).map((s) => (
                    <SelectItem key={s} value={s} className="hover:!bg-slate-700/50">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticketPriority" className="text-theme-primary">
                Priority
              </Label>
              <Select
                value={currentPriority}
                onValueChange={(value: SupportTicket["priority"]) => setCurrentPriority(value)}
              >
                <SelectTrigger className="w-full glass">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="glass border-slate-700">
                  {(["Low", "Medium", "High", "Urgent"] as SupportTicket["priority"][]).map((p) => (
                    <SelectItem key={p} value={p} className="hover:!bg-slate-700/50">
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignAdmin" className="text-theme-primary">
                Assign To
              </Label>
              <Select
                value={assignedAdmin}
                onValueChange={(selectedValue: string) => {
                  if (selectedValue === "##NONE##") {
                    setAssignedAdmin(undefined)
                  } else {
                    setAssignedAdmin(selectedValue)
                  }
                }}
              >
                <SelectTrigger className="w-full glass">
                  <SelectValue placeholder="Assign to admin" />
                </SelectTrigger>
                <SelectContent className="glass border-slate-700">
                  <SelectItem value="##NONE##" className="hover:!bg-slate-700/50">
                    Unassigned
                  </SelectItem>
                  {adminUsers.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id} className="hover:!bg-slate-700/50">
                      {admin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm space-y-1">
              <p>
                <strong className="text-theme-secondary">Category:</strong> {ticket.category || "N/A"}
              </p>
              <p>
                <strong className="text-theme-secondary">User ID:</strong> {ticket.userId}
              </p>
              {ticket.resolution && (
                <p>
                  <strong className="text-theme-secondary">Resolution:</strong> {ticket.resolution}
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="glass glass-hover">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} className="gradient-accent hover:opacity-90 text-white">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Dummy Card component if not globally available or for specific styling
const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`bg-opacity-50 backdrop-blur-md ${className}`}>{children}</div>
)
