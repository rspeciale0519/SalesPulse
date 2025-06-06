"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AdminUser, NewSupportTicket, SupportTicket, TicketPriority, TicketStatus } from "@/types/admin"
import { UserSelectorCombobox } from "./user-selector-combobox" // Assuming this is available

// TODO: Replace with actual user data fetched from Supabase
// Example query:
// const { data: users, error } = await supabase
//   .from('users')
//   .select('id, name, email, role, status, created_at')
//   .eq('organization_id', orgId)
//   .eq('role', 'Support')
//   .order('name')
const mockUsers: AdminUser[] = []

// TODO: Replace with actual admin data fetched from Supabase
// Example query:
// const { data: admins, error } = await supabase
//   .from('users')
//   .select('id, name, email, role, status, created_at')
//   .eq('organization_id', orgId)
//   .in('role', ['Admin', 'Manager'])
//   .order('name')
const mockAdmins: AdminUser[] = []

interface CreateTicketFormProps {
  onSubmit: (newTicket: SupportTicket) => void
  onCancel: () => void
}

export function CreateTicketForm({ onSubmit, onCancel }: CreateTicketFormProps) {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TicketPriority>("Medium")
  const [category, setCategory] = useState("")
  const [assignedToAdminId, setAssignedToAdminId] = useState<string | undefined>(undefined)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser || !subject.trim() || !description.trim()) {
      // Basic validation, can be enhanced
      alert("Please fill in all required fields: User, Subject, and Description.")
      return
    }

    const newTicketData: NewSupportTicket = {
      subject,
      description,
      userId: selectedUser.id,
      userName: selectedUser.name,
      userEmail: selectedUser.email,
      status: "Open" as TicketStatus, // Default status
      priority,
      category: category.trim() || undefined,
      assignedToAdminId: assignedToAdminId || undefined,
      assignedToAdminName: assignedToAdminId ? mockAdmins.find((a) => a.id === assignedToAdminId)?.name : undefined,
      // tags, resolution, closedAt will be set later
    }

    // Construct the full SupportTicket object for local state update
    const fullNewTicket: SupportTicket = {
      ...newTicketData,
      id: `TICKET${Date.now()}`,
      ticketNumber: `#SP-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        // Initial message from the description
        {
          id: `MSG${Date.now()}`,
          ticketId: `TICKET${Date.now()}`, // Placeholder, will match above id
          senderId: selectedUser.id,
          senderName: selectedUser.name,
          senderType: "user",
          content: description,
          createdAt: new Date().toISOString(),
        },
      ],
    }
    // The messages ticketId will be slightly off due to Date.now(), fix it
    fullNewTicket.messages[0].ticketId = fullNewTicket.id

    onSubmit(fullNewTicket)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-theme-primary">
      <div>
        <Label htmlFor="user">User *</Label>
        <UserSelectorCombobox
          users={mockUsers}
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
          placeholder="Select user reporting the issue"
          searchPlaceholder="Search by name or email..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="A brief summary of the issue"
          required
          className="mt-1 glass"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the issue"
          required
          className="mt-1 glass min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value: TicketPriority) => setPriority(value)}>
            <SelectTrigger id="priority" className="mt-1 glass">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="glass border-slate-700">
              {(["Low", "Medium", "High", "Urgent"] as TicketPriority[]).map((p) => (
                <SelectItem key={p} value={p} className="hover:!bg-slate-700/50">
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Billing, Technical"
            className="mt-1 glass"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="assignToAdmin">Assign to Admin (Optional)</Label>
        <Select
          value={assignedToAdminId}
          onValueChange={(selectedValue: string) => {
            if (selectedValue === "##NONE##") {
              setAssignedToAdminId(undefined)
            } else {
              setAssignedToAdminId(selectedValue)
            }
          }}
        >
          <SelectTrigger id="assignToAdmin" className="mt-1 glass">
            <SelectValue placeholder="Select admin to assign" />
          </SelectTrigger>
          <SelectContent className="glass border-slate-700">
            <SelectItem value="##NONE##" className="hover:!bg-slate-700/50">
              Unassigned
            </SelectItem>
            {mockAdmins.map((admin) => (
              <SelectItem key={admin.id} value={admin.id} className="hover:!bg-slate-700/50">
                {admin.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="glass glass-hover">
          Cancel
        </Button>
        <Button type="submit" className="gradient-accent hover:opacity-90 text-white">
          Create Ticket
        </Button>
      </div>
    </form>
  )
}
