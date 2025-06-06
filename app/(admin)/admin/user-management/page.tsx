"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Users } from "lucide-react"
import { UserTable } from "@/components/admin/user-table"
import { UserForm, type UserFormData } from "@/components/admin/user-form" // Assuming UserForm takes UserFormData
import type { AdminUser } from "@/types/admin"

// Initial Users Data
// TODO: Fetch users from Supabase
// const sampleUsers: AdminUser[] = []

export default function UserManagementPage() {
  // TODO: Initialize with real users from Supabase
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)

  const handleAddUser = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: AdminUser) => {
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    // Add confirmation dialog here in a real app
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId))
  }

  const handleSaveUser = (formData: UserFormData) => {
    // Assuming UserFormData is the type from UserForm, convert/map to AdminUser
    const userToSave: Omit<AdminUser, "id" | "joinedDate"> & Partial<Pick<AdminUser, "id" | "joinedDate">> = {
      ...formData,
    }

    if (editingUser) {
      setUsers((prevUsers) => prevUsers.map((u) => (u.id === editingUser.id ? { ...editingUser, ...userToSave } : u)))
    } else {
      const newUser: AdminUser = {
        ...userToSave,
        id: (Math.random() * 10000).toString(),
        joinedDate: new Date().toISOString(),
        status: userToSave.status || "Active", // Ensure status is set
        role: userToSave.role || "User", // Ensure role is set
      } as AdminUser // Type assertion might be needed if UserFormData is very different
      setUsers((prevUsers) => [...prevUsers, newUser])
    }
    setIsFormOpen(false)
    setEditingUser(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Users className="h-7 w-7" /> User Management
        </h1>
        <Button onClick={handleAddUser} className="gradient-accent hover:opacity-90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onSave={handleSaveUser as (data: any) => void} // Adjust type if UserFormData matches AdminUser closely
          onCancel={() => {
            // Renamed from onCancel to onOpenChange(false) if it's a Dialog
            setIsFormOpen(false)
            setEditingUser(null)
          }}
        />
      )}

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserTable data={users} onEdit={handleEditUser} onDelete={handleDeleteUser} />
        </CardContent>
      </Card>
    </div>
  )
}
