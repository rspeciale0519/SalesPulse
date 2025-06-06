"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Edit3, Eye, BarChartHorizontalBig } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Initial Data
const emailTemplates: { id: string; name: string; subject: string; lastUpdated: string }[] = []

export default function EmailManagementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
        <Mail className="h-7 w-7" /> Email Management
      </h1>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Transactional Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700/50">
                <TableHead className="text-theme-secondary">Template Name</TableHead>
                <TableHead className="text-theme-secondary">Subject Line</TableHead>
                <TableHead className="text-theme-secondary">Last Updated</TableHead>
                <TableHead className="text-right text-theme-secondary">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emailTemplates.map((template) => (
                <TableRow key={template.id} className="border-slate-700/50">
                  <TableCell className="font-medium text-theme-primary">{template.name}</TableCell>
                  <TableCell className="text-theme-secondary">{template.subject}</TableCell>
                  <TableCell className="text-theme-secondary">{template.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2 glass hover:border-blue-500 hover:text-blue-500"
                    >
                      <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="glass hover:border-green-500 hover:text-green-500">
                      <Eye className="mr-1 h-3.5 w-3.5" /> Preview
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <BarChartHorizontalBig className="h-5 w-5" /> Email Delivery Logs & Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-theme-secondary">
            Placeholder for email delivery statistics (sent, delivered, opened, bounced) and logs. This would typically
            integrate with an email service provider like SendGrid, Postmark, etc.
          </p>
          <div className="mt-4 p-8 border-2 border-dashed border-slate-700 rounded-lg text-center text-theme-muted">
            Email Analytics Dashboard - Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
