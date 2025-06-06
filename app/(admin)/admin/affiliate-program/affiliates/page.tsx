"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AffiliateTable } from "@/components/admin/affiliates/affiliate-table"
import { AffiliateForm } from "@/components/admin/affiliates/affiliate-form"
import type { Affiliate } from "@/types/affiliate"
import { PlusCircle } from "lucide-react"

// Initial Data
const sampleAffiliates: Affiliate[] = []

export default function ManageAffiliatesPage() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>(sampleAffiliates)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null)

  const handleAddAffiliate = () => {
    setEditingAffiliate(null)
    setIsFormOpen(true)
  }

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setEditingAffiliate(affiliate)
    setIsFormOpen(true)
  }

  const handleDeleteAffiliate = (affiliateId: string) => {
    if (window.confirm("Are you sure you want to delete this affiliate?")) {
      setAffiliates(affiliates.filter((aff) => aff.id !== affiliateId))
      // TODO: API call
    }
  }

  const handleApproveAffiliate = (affiliateId: string) => {
    setAffiliates((affs) => affs.map((aff) => (aff.id === affiliateId ? { ...aff, status: "active" } : aff)))
    // TODO: API call
  }

  const handleRejectAffiliate = (affiliateId: string) => {
    setAffiliates((affs) => affs.map((aff) => (aff.id === affiliateId ? { ...aff, status: "rejected" } : aff)))
    // TODO: API call
  }

  const handleFormSubmit = (
    formData: Omit<Affiliate, "id" | "joinedDate" | "referrals" | "totalEarnings" | "balance">,
  ) => {
    if (editingAffiliate) {
      setAffiliates(
        affiliates.map((aff) => (aff.id === editingAffiliate.id ? { ...editingAffiliate, ...formData } : aff)),
      )
      // TODO: API call for update
    } else {
      const newAffiliate: Affiliate = {
        ...formData,
        id: `aff${Date.now()}`, // simple unique id
        joinedDate: new Date().toISOString(),
        referrals: 0,
        totalEarnings: 0,
        balance: 0,
      }
      setAffiliates([...affiliates, newAffiliate])
      // TODO: API call for create
    }
    setIsFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-theme-primary">Manage Affiliates</h1>
        <Button onClick={handleAddAffiliate} className="bg-theme-accent hover:bg-theme-accent/90 text-white rounded-lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Affiliate
        </Button>
      </div>
      <AffiliateTable
        affiliates={affiliates}
        onEdit={handleEditAffiliate}
        onDelete={handleDeleteAffiliate}
        onApprove={handleApproveAffiliate}
        onReject={handleRejectAffiliate}
      />
      <AffiliateForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingAffiliate}
      />
    </div>
  )
}
