"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CommissionRuleTable } from "@/components/admin/affiliates/commission-rule-table"
import { CommissionRuleForm } from "@/components/admin/affiliates/commission-rule-form"
import type { CommissionRule } from "@/types/affiliate"
import { PlusCircle } from "lucide-react"

// TODO: Fetch commissions from Supabase
const sampleCommissionRules: CommissionRule[] = []

export default function CommissionStructuresPage() {
  // TODO: Initialize with real commissions from Supabase
  const [rules, setRules] = useState<CommissionRule[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)

  const handleAddRule = () => {
    setEditingRule(null)
    setIsFormOpen(true)
  }

  const handleEditRule = (rule: CommissionRule) => {
    setEditingRule(rule)
    setIsFormOpen(true)
  }

  const handleDeleteRule = (ruleId: string) => {
    if (window.confirm("Are you sure you want to delete this commission rule?")) {
      setRules(rules.filter((r) => r.id !== ruleId))
      // TODO: API call
    }
  }

  const handleFormSubmit = (formData: Omit<CommissionRule, "id">) => {
    if (editingRule) {
      setRules(rules.map((r) => (r.id === editingRule.id ? { ...editingRule, ...formData } : r)))
      // TODO: API call for update
    } else {
      const newRule: CommissionRule = {
        ...formData,
        id: `rule${Date.now()}`, // simple unique id
      }
      setRules([...rules, newRule])
      // TODO: API call for create
    }
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary">Commission Structures</h1>
        <Button onClick={handleAddRule} className="bg-theme-accent hover:bg-theme-accent/90 text-white rounded-lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Rule
        </Button>
      </div>
      <CommissionRuleTable rules={rules} onEdit={handleEditRule} onDelete={handleDeleteRule} />
      <CommissionRuleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingRule}
      />
    </div>
  )
}
