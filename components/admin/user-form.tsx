"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "./user-table" // Assuming User type is defined here
import { useTheme } from "@/components/theme-provider"

interface UserFormProps {
  user: User | null
  onSave: (user: User) => void
  onCancel: () => void
}

export function UserForm({ user, onSave, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({
    name: "",
    email: "",
    role: "User",
    status: "Active",
  })
  const { actualTheme } = useTheme()

  useEffect(() => {
    if (user) {
      setFormData(user)
    } else {
      setFormData({ name: "", email: "", role: "User", status: "Active" })
    }
  }, [user])

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: keyof User, value: "User" | "Admin" | "Active" | "Inactive") => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!formData.name || !formData.email) {
      alert("Name and Email are required.")
      return
    }
    onSave(formData as User) // Cast as User, assuming id and joinedDate are handled by parent
  }

  const inputClasses =
    actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 text-white focus:border-red-400"
      : "input-theme bg-white/90 border-gray-300 text-black focus:border-red-400"

  const selectClasses =
    actualTheme === "dark"
      ? "select-theme bg-zinc-800/80 border-zinc-600 text-white"
      : "select-theme bg-white/90 border-gray-300 text-black"

  return (
    <Card className="glass rounded-xl gradient-border mb-6">
      <CardHeader>
        <CardTitle className="text-theme-primary">{user ? "Edit User" : "Add New User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-theme-secondary">
              Full Name
            </Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="text-theme-secondary">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleChange("email", e.target.value)}
              className={inputClasses}
              required
            />
          </div>
          <div>
            <Label htmlFor="role" className="text-theme-secondary">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value: "User" | "Admin") => handleSelectChange("role", value)}
            >
              <SelectTrigger id="role" className={selectClasses}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className={`glass ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status" className="text-theme-secondary">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Active" | "Inactive") => handleSelectChange("status", value)}
            >
              <SelectTrigger id="status" className={selectClasses}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className={`glass ${actualTheme === "dark" ? "border-slate-700" : "border-gray-200"}`}>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {user && ( // Only show password field for new users or if explicitly changing
            <div>
              <Label htmlFor="password_new" className="text-theme-secondary">
                Password (leave blank to keep unchanged)
              </Label>
              <Input id="password_new" type="password" placeholder="New Password" className={inputClasses} />
            </div>
          )}
          {!user && (
            <div>
              <Label htmlFor="password_initial" className="text-theme-secondary">
                Password
              </Label>
              <Input
                id="password_initial"
                type="password"
                placeholder="Set Password"
                className={inputClasses}
                required
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={`glass ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
            >
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary hover:opacity-90">
              Save User
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
