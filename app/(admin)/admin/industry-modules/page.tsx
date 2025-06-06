"use client"

import { Badge } from "@/components/ui/badge"

import { useEffect } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Assuming you have this or similar
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Briefcase, PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

interface IndustryModule {
  id: string
  name: string
  description: string
  isActive: boolean
  kpis: string[] // Example: ['Policies Sold', 'Referral Rate']
}

// TODO: Fetch industry modules from Supabase
// const sampleModules: IndustryModule[] = []

export default function IndustryModulesPage() {
  // TODO: Initialize with real modules from Supabase
  const [modules, setModules] = useState<IndustryModule[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<IndustryModule | null>(null)
  const [formData, setFormData] = useState<Partial<IndustryModule>>({
    name: "",
    description: "",
    isActive: true,
    kpis: [],
  })
  const { actualTheme } = useTheme()

  const inputClasses =
    actualTheme === "dark" ? "input-theme bg-zinc-800/80 border-zinc-600" : "input-theme bg-white/90 border-gray-300"
  const textareaClasses =
    actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 min-h-[80px]"
      : "input-theme bg-white/90 border-gray-300 min-h-[80px]"
  const tableRowHoverClass = actualTheme === "dark" ? "hover:bg-zinc-700/30" : "hover:bg-gray-100/50"
  const borderColor = actualTheme === "dark" ? "border-zinc-700/50" : "border-gray-200/70"

  useEffect(() => {
    if (editingModule) {
      setFormData({ ...editingModule, kpis: editingModule.kpis ? [...editingModule.kpis] : [] })
    } else {
      setFormData({ name: "", description: "", isActive: true, kpis: [] })
    }
  }, [editingModule])

  const handleInputChange = (field: keyof Omit<IndustryModule, "kpis" | "isActive">, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleKpiChange = (index: number, value: string) => {
    const newKpis = [...(formData.kpis || [])]
    newKpis[index] = value
    setFormData((prev) => ({ ...prev, kpis: newKpis }))
  }

  const addKpiField = () => {
    setFormData((prev) => ({ ...prev, kpis: [...(prev.kpis || []), ""] }))
  }

  const removeKpiField = (index: number) => {
    const newKpis = [...(formData.kpis || [])]
    newKpis.splice(index, 1)
    setFormData((prev) => ({ ...prev, kpis: newKpis }))
  }

  const handleSaveModule = () => {
    if (!formData.name || !formData.description) {
      alert("Module Name and Description are required.")
      return
    }
    const moduleToSave: IndustryModule = {
      id: editingModule?.id || (Math.random() * 10000).toString(),
      name: formData.name!,
      description: formData.description!,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      kpis: formData.kpis || [],
    }

    if (editingModule) {
      setModules(modules.map((m) => (m.id === moduleToSave.id ? moduleToSave : m)))
    } else {
      setModules([...modules, moduleToSave])
    }
    setIsFormOpen(false)
    setEditingModule(null)
  }

  const openEditForm = (module: IndustryModule) => {
    setEditingModule(module)
    setIsFormOpen(true)
  }

  const openAddForm = () => {
    setEditingModule(null)
    setIsFormOpen(true)
  }

  const handleDeleteModule = (moduleId: string) => {
    setModules(modules.filter((m) => m.id !== moduleId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Briefcase className="h-7 w-7" /> Industry Modules
        </h1>
        <Button onClick={openAddForm} className="gradient-accent hover:opacity-90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Module
        </Button>
      </div>

      {isFormOpen && (
        <Card className="glass rounded-xl gradient-border mb-6">
          <CardHeader>
            <CardTitle className="text-theme-primary">{editingModule ? "Edit Module" : "Add New Module"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="moduleName" className="text-theme-secondary">
                Module Name
              </Label>
              <Input
                id="moduleName"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={inputClasses}
              />
            </div>
            <div>
              <Label htmlFor="moduleDescription" className="text-theme-secondary">
                Description
              </Label>
              <Textarea
                id="moduleDescription"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={textareaClasses}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-theme-secondary">Key Performance Indicators (KPIs)</Label>
              {formData.kpis?.map((kpi, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={kpi}
                    onChange={(e) => handleKpiChange(index, e.target.value)}
                    placeholder={`KPI ${index + 1}`}
                    className={inputClasses}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKpiField(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addKpiField}
                className={`text-sm ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add KPI
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="moduleIsActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="moduleIsActive" className="text-theme-secondary">
                Active
              </Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className={`glass ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveModule} className="gradient-primary hover:opacity-90">
                Save Module
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Available Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`border-b ${borderColor}`}>
                <TableHead className="text-theme-secondary">Name</TableHead>
                <TableHead className="text-theme-secondary">Description</TableHead>
                <TableHead className="text-theme-secondary">Status</TableHead>
                <TableHead className="text-theme-secondary">KPIs</TableHead>
                <TableHead className="text-theme-secondary text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id} className={`${tableRowHoverClass} border-b ${borderColor} transition-colors`}>
                  <TableCell className="font-medium text-theme-primary">{module.name}</TableCell>
                  <TableCell className="text-theme-secondary text-sm max-w-xs truncate">{module.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={module.isActive ? "default" : "outline"}
                      className={`${module.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/20"} text-xs`}
                    >
                      {module.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-secondary text-xs">{module.kpis.join(", ") || "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-theme-muted hover:text-theme-primary"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className={`glass ${actualTheme === "dark" ? "border-zinc-700" : "border-gray-200"}`}
                      >
                        <DropdownMenuItem
                          onClick={() => openEditForm(module)}
                          className="cursor-pointer hover:!bg-zinc-700/50"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-red-500 hover:!text-red-400 hover:!bg-red-500/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
