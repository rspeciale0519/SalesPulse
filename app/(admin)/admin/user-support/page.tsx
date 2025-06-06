"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LifeBuoy, MessageSquare, ListChecks } from "lucide-react"
import { TicketTable } from "@/components/admin/support/ticket-table"
import { AnnouncementForm } from "@/components/admin/support/announcement-form"
import { DirectMessageForm } from "@/components/admin/support/direct-message-form"

export default function UserSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <LifeBuoy className="h-7 w-7" /> User Support Center
        </h1>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 lg:w-1/3 glass rounded-lg mb-6">
          <TabsTrigger
            value="tickets"
            className="data-[state=active]:gradient-accent data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <ListChecks className="h-4 w-4 mr-2" /> Support Tickets
          </TabsTrigger>
          <TabsTrigger
            value="communication"
            className="data-[state=active]:gradient-accent data-[state=active]:text-white data-[state=active]:shadow-md"
          >
            <MessageSquare className="h-4 w-4 mr-2" /> Communication Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <TicketTable />
        </TabsContent>

        <TabsContent value="communication">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnnouncementForm />
            <DirectMessageForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
