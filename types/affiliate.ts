export interface Affiliate {
  id: string
  name: string
  email: string
  status: "Pending" | "Approved" | "Rejected" | "Suspended"
  referralCode: string
  referralLink: string
  commissionRate: number // e.g., 0.20 for 20%
  paymentDetails?: {
    paypalEmail?: string
    bankAccount?: string // Simplified
  }
  totalReferrals: number
  totalConversions: number
  totalEarnings: number
  unpaidEarnings: number
  joinedDate: string // ISO string
}
export type NewAffiliateApplication = Pick<Affiliate, "name" | "email"> // Or more fields

export interface Referral {
  id: string
  affiliateId: string
  timestamp: string // ISO string
  ipAddress?: string // For tracking, consider privacy
  converted: boolean
  conversionTimestamp?: string // ISO string
  conversionValue?: number // Value of the sale/signup
  commissionEarned?: number
}

export interface PayoutRequest {
  id: string
  affiliateId: string
  affiliateName: string // Denormalized for display
  amount: number
  status: "Pending" | "Processing" | "Paid" | "Rejected"
  requestedAt: string // ISO string
  processedAt?: string // ISO string
  paymentMethod: string // e.g., PayPal, Bank Transfer
  transactionId?: string
}

export interface CommissionRule {
  id: string
  name: string
  type: "percentage" | "fixed_amount"
  value: number // Percentage (e.g., 20 for 20%) or fixed amount
  appliesToPlanIds?: string[] // Optional: specific plans
  isActive: boolean
}
