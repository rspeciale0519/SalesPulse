"use client"

import { Badge } from "@/components/ui/badge"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tag, PlusCircle, Edit, Trash2, MoreHorizontal, Percent } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

interface PricingPlan {
  id: string
  name: string
  price: number
  period: "month" | "year"
  description: string
  features: string[]
  isPopular: boolean
  isActive: boolean
}

// TODO: Fetch pricing plans from Supabase

export default function PricingManagementPage() {
  // TODO: Initialize with real pricing plans from Supabase
  const [pricing, setPricing] = useState<PricingPlan[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [formData, setFormData] = useState<Partial<PricingPlan>>({
    name: "",
    price: 0,
    period: "month",
    description: "",
    features: [],
    isPopular: false,
    isActive: true,
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
    if (editingPlan) {
      setFormData({ ...editingPlan, features: [...editingPlan.features] })
    } else {
      setFormData({
        name: "",
        price: 0,
        period: "month",
        description: "",
        features: [],
        isPopular: false,
        isActive: true,
      })
    }
  }, [editingPlan])

  const handleInputChange = (
    field: keyof Omit<PricingPlan, "features" | "isPopular" | "isActive" | "price">,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePriceChange = (value: string) => {
    setFormData((prev) => ({ ...prev, price: Number(value) || 0 }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])]
    newFeatures[index] = value
    setFormData((prev) => ({ ...prev, features: newFeatures }))
  }

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...(prev.features || []), ""] }))
  }

  const removeFeatureField = (index: number) => {
    const newFeatures = [...(formData.features || [])]
    newFeatures.splice(index, 1)
    setFormData((prev) => ({ ...prev, features: newFeatures }))
  }

  const handleSavePlan = () => {
    if (!formData.name || formData.price === undefined || !formData.description) {
      alert("Plan Name, Price, and Description are required.")
      return
    }
    const planToSave: PricingPlan = {
      id: editingPlan?.id || (Math.random() * 10000).toString(),
      name: formData.name!,
      price: formData.price!,
      period: formData.period || "month",
      description: formData.description!,
      features: formData.features || [],
      isPopular: formData.isPopular || false,
      isActive: formData.isActive !== undefined ? formData.isActive : true,
    }

    if (editingPlan) {
      setPlans(plans.map((p) => (p.id === planToSave.id ? planToSave : p)))
    } else {
      setPlans([...plans, planToSave])
    }
    setIsFormOpen(false)
    setEditingPlan(null)
  }

  const openEditForm = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setIsFormOpen(true)
  }

  const openAddForm = () => {
    setEditingPlan(null)
    setIsFormOpen(true)
  }

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter((p) => p.id !== planId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary flex items-center gap-2">
          <Tag className="h-7 w-7" /> Pricing Plan Management
        </h1>
        <Button onClick={openAddForm} className="gradient-accent hover:opacity-90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      {isFormOpen && (
        <Card className="glass rounded-xl gradient-border mb-6">
          <CardHeader>
            <CardTitle className="text-theme-primary">{editingPlan ? "Edit Plan" : "Add New Plan"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="planName" className="text-theme-secondary">
                  Plan Name
                </Label>
                <Input
                  id="planName"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <Label htmlFor="planPrice" className="text-theme-secondary">
                  Price
                </Label>
                <Input
                  id="planPrice"
                  type="number"
                  value={formData.price || ""}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <Label htmlFor="planPeriod" className="text-theme-secondary">
                  Period
                </Label>
                <select
                  id="planPeriod"
                  value={formData.period || "month"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value as "month" | "year" }))}
                  className={`${inputClasses} w-full`}
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="planDescription" className="text-theme-secondary">
                Description
              </Label>
              <Textarea
                id="planDescription"
                value={formData.description || ""}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className={textareaClasses}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-theme-secondary">Features</Label>
              {formData.features?.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`Feature ${index + 1}`}
                    className={inputClasses}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeatureField(index)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addFeatureField}
                className={`text-sm ${actualTheme === "dark" ? "border-slate-600 text-white hover:bg-slate-700" : "border-gray-300 text-black hover:bg-gray-100"}`}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Feature
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="planIsPopular"
                checked={formData.isPopular}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPopular: checked }))}
              />
              <Label htmlFor="planIsPopular" className="text-theme-secondary">
                Mark as Popular
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="planIsActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="planIsActive" className="text-theme-secondary">
                Active Plan
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
              <Button onClick={handleSavePlan} className="gradient-primary hover:opacity-90">
                Save Plan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary">Current Pricing Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className={`border-b ${borderColor}`}>
                <TableHead className="text-theme-secondary">Name</TableHead>
                <TableHead className="text-theme-secondary">Price</TableHead>
                <TableHead className="text-theme-secondary">Status</TableHead>
                <TableHead className="text-theme-secondary">Popular</TableHead>
                <TableHead className="text-theme-secondary text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className={`${tableRowHoverClass} border-b ${borderColor} transition-colors`}>
                  <TableCell className="font-medium text-theme-primary">{plan.name}</TableCell>
                  <TableCell className="text-theme-secondary">
                    ${plan.price}/{plan.period}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={plan.isActive ? "default" : "outline"}
                      className={`${plan.isActive ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/10 text-red-400 border-red-500/20"} text-xs`}
                    >
                      {plan.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {plan.isPopular && <Badge className="gradient-accent text-white text-xs">Popular</Badge>}
                  </TableCell>
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
                          onClick={() => openEditForm(plan)}
                          className="cursor-pointer hover:!bg-zinc-700/50"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeletePlan(plan.id)}
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

      <Card className="glass rounded-xl gradient-border">
        <CardHeader>
          <CardTitle className="text-theme-primary flex items-center gap-2">
            <Percent className="h-5 w-5" /> Promotions & Discounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-theme-secondary">Manage promotional codes and discount strategies here.</p>
          <div className="mt-4 p-8 border-2 border-dashed border-slate-700 rounded-lg text-center text-theme-muted">
            Promotions Management - Coming Soon
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
