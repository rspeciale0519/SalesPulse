"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Send } from "lucide-react"
import { UserSelectorCombobox } from "./user-selector-combobox" // Import the new component
import type { AdminUser } from "@/types/admin" // Assuming AdminUser type is suitable

// TODO: Replace with actual data fetching from Supabase
// This will be implemented when the user management system is set up
const mockUsers: AdminUser[] = []

export function DirectMessageForm() {
  const [selectedRecipient, setSelectedRecipient] = useState<AdminUser | null>(null)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [allUsers, setAllUsers] = useState<AdminUser[]>([])

  // Simulate fetching users
  useEffect(() => {
    // In a real app, fetch users from your API
    // TODO: setAllUsers with users fetched from Supabase
    setAllUsers(allUsers)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRecipient) {
      alert("Please select a recipient.")
      return
    }
    // Logic to send direct message
    console.log("Direct Message Sent:", {
      recipientId: selectedRecipient.id,
      recipientName: selectedRecipient.name,
      subject,
      message,
    })
    alert(`Direct message for ${selectedRecipient.name} submitted (see console for data).`)
    setSelectedRecipient(null)
    setSubject("")
    setMessage("")
  }

  return (
    <Card className="glass rounded-xl gradient-border">
      <CardHeader>
        <CardTitle className="text-theme-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send Direct Message
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-theme-secondary">
              Recipient
            </Label>
            <UserSelectorCombobox
              users={allUsers}
              selectedUser={selectedRecipient}
              onSelectUser={setSelectedRecipient}
              placeholder="Select or search for a user..."
              searchPlaceholder="Search by name or email..."
              emptyStateMessage="No users found matching your search."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dmSubject" className="text-theme-secondary">
              Subject (Optional)
            </Label>
            <Input
              id="dmSubject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Regarding your recent activity..."
              className="glass"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dmContent" className="text-theme-secondary">
              Message
            </Label>
            <Textarea
              id="dmContent"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here."
              className="glass min-h-[120px]"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-accent hover:opacity-90 text-white"
            disabled={!selectedRecipient}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
