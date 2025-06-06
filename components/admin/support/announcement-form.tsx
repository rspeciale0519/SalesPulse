"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, RadioTower } from "lucide-react"

export function AnnouncementForm() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [targetAudience, setTargetAudience] = useState<"all_users" | "specific_segments" | "specific_users">(
    "all_users",
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Logic to send announcement
    console.log("Announcement:", { title, content, targetAudience })
    alert("Announcement submitted (see console for data).")
    setTitle("")
    setContent("")
    setTargetAudience("all_users")
  }

  return (
    <Card className="glass rounded-xl gradient-border">
      <CardHeader>
        <CardTitle className="text-theme-primary flex items-center gap-2">
          <RadioTower className="h-5 w-5" />
          Create New Announcement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="announcementTitle" className="text-theme-secondary">
              Title
            </Label>
            <Input
              id="announcementTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Important Update!"
              className="glass"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcementContent" className="text-theme-secondary">
              Content
            </Label>
            <Textarea
              id="announcementContent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your announcement message here. Markdown/HTML could be supported."
              className="glass min-h-[150px]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience" className="text-theme-secondary">
              Target Audience
            </Label>
            <Select
              value={targetAudience}
              onValueChange={(value: "all_users" | "specific_segments" | "specific_users") => setTargetAudience(value)}
            >
              <SelectTrigger className="w-full glass">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent className="glass border-slate-700">
                <SelectItem value="all_users" className="hover:!bg-slate-700/50">
                  All Users
                </SelectItem>
                <SelectItem value="specific_segments" disabled className="hover:!bg-slate-700/50">
                  Specific Segments (Coming Soon)
                </SelectItem>
                <SelectItem value="specific_users" disabled className="hover:!bg-slate-700/50">
                  Specific Users (Coming Soon)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full gradient-accent hover:opacity-90 text-white">
            <Send className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
