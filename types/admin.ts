import type { LucideIcon } from "lucide-react"

export interface User {
  id: string
  name: string
  email: string
  role: "Admin" | "Manager" | "User"
  status: "Active" | "Pending" | "Suspended"
  lastLogin: string
  avatar?: string // Optional: URL to user's avatar
  [key: string]: any // For additional dynamic properties
}

export interface SupportTicket {
  id: string
  ticketId: string
  user: Pick<User, "id" | "name" | "avatar"> // Or just userId/userName
  subject: string
  description: string
  status: "Open" | "In Progress" | "Resolved" | "Closed"
  priority: "Low" | "Medium" | "High" | "Urgent"
  category: "Billing" | "Technical" | "General Inquiry" | "Feature Request" | "Bug Report"
  assignedAdmin?: Pick<User, "id" | "name"> // Or just adminId/adminName
  createdAt: string
  updatedAt: string
  messages?: TicketMessage[]
}

export interface TicketMessage {
  id: string
  sender: Pick<User, "id" | "name" | "avatar"> // Or just senderId/senderName
  content: string
  timestamp: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  targetAudience: "All Users" | "Specific Segment" | User["id"][] // Can be an array of user IDs for specific segment
  sentAt: string
  author: Pick<User, "id" | "name">
}

export interface DirectMessage {
  id: string
  recipient: Pick<User, "id" | "name" | "avatar"> // Or just recipientId/recipientName
  sender: Pick<User, "id" | "name"> // Admin sending the message
  subject?: string
  content: string
  sentAt: string
  readAt?: string
}

export interface FinancialMetric {
  title: string
  value: string
  change?: string // e.g., "+5.2%"
  changeType?: "positive" | "negative" | "neutral"
  period?: string // e.g., "vs last month"
  icon?: LucideIcon
}

export interface FeatureFlag {
  id: string
  name: string
  description: string
  key: string // e.g., "new-dashboard-feature"
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  timestamp: string
  userId: string // ID of the user who performed the action
  userName: string // Name of the user
  action: string // e.g., "user_login", "updated_settings", "deleted_coupon"
  details: Record<string, any> // Object containing details about the action
  ipAddress?: string
}

export interface Coupon {
  id: string
  code: string
  discountType: "percentage" | "fixed_amount"
  discountValue: number
  description?: string
  isActive: boolean
  validFrom?: string
  validUntil?: string
  usageLimit?: number
  timesUsed?: number
  createdAt: string
  updatedAt: string
}

export interface NavItem {
  title: string
  icon: LucideIcon
  href?: string
  subItems?: NavItem[]
  defaultOpen?: boolean // For collapsible groups, true if it should be open by default
}

export interface Affiliate {
  id: string
  name: string
  email: string
  referralCode: string
  status: "Active" | "Pending" | "Suspended"
  totalReferrals: number
  totalEarnings: number
  commissionRate: number // Percentage or fixed amount based on structure
  joinedDate: string
  payoutMethod?: string // e.g., PayPal, Bank Transfer
  payoutEmail?: string
}

export interface CommissionRule {
  id: string
  name: string
  description?: string
  type: "percentage" | "fixed_amount_per_referral" | "tiered"
  rate?: number // For percentage or fixed amount
  tiers?: Array<{ threshold: number; rate: number }> // For tiered structure
  appliesTo: "all_products" | "specific_products" | "first_purchase_only"
  productIds?: string[] // If specific_products
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PayoutRequest {
  id: string
  affiliateId: string
  affiliateName: string
  amount: number
  status: "Pending" | "Processing" | "Paid" | "Rejected"
  requestDate: string
  processedDate?: string
  paymentMethod: string // e.g., PayPal, Bank Transfer
  transactionId?: string // After payment
  notes?: string
}

export interface ReferralLog {
  id: string
  affiliateId: string
  affiliateName: string
  referredUserId: string
  referredUserName: string
  referralDate: string
  conversionDate?: string // Date when referred user made a purchase/action
  commissionEarned?: number
  status: "Pending" | "Converted" | "Expired" // e.g., if there's a time limit for conversion
}

export interface AffiliateProgramSettings {
  cookieDurationDays: number // How long the referral cookie lasts
  defaultCommissionRate: number // Default percentage if no specific rule applies
  payoutThreshold: number // Minimum earnings before payout can be requested
  autoApproveAffiliates: boolean
  termsAndConditionsUrl?: string
}
