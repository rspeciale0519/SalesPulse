# SalesPulse Development Roadmap

**Last Updated:** 2025-11-29
**Current Version:** v0.1.0 (Early MVP / Pre-Alpha)
**Phase 1 Completion:** ~25-30%

---

## 📊 Executive Summary

**Current Development Stage:** Early MVP / Pre-Alpha

| Area | Progress | Status |
|------|----------|--------|
| **Database Schema** | 100% | ✅ Complete |
| **UI/UX Components** | 80% | ✅ Strong foundation |
| **Authentication** | 70% | ⚠️ Core working, social login pending |
| **Infrastructure** | 60% | ⚠️ Good progress |
| **Business Logic** | 15% | ❌ Needs backend integration |
| **External Integrations** | 5% | ❌ Configured only |
| **Testing Coverage** | 5% | ❌ Critical gap |

**Estimated Time to Production-Ready MVP:** 8-12 weeks

---

## 🚨 Critical Blockers (Must Fix First)

1. **Backend API Integration** - Most UI components not connected to Supabase
2. **Dashboard Data Fetching** - All KPIs showing placeholder "0" values
3. **Activity Persistence** - Form exists but doesn't save to database
4. **Testing Suite** - Only 1 test file, need comprehensive coverage
5. **Stripe Integration** - Payment/billing not implemented
6. **Mailgun Integration** - Email system not implemented
7. **Admin Console** - All 11 admin pages are UI placeholders

---

## Phase 1: Core Platform

### 1.1 Project Setup & Environment Configuration
**Status:** 60% Complete

- [x] Initialize Supabase project (DB, Auth, Edge Functions)
- [x] Set up GitHub repo and CI integration
- [x] Configure TypeScript, ESLint, Prettier
- [x] Set up Next.js 15.2.4 with App Router
- [ ] **Set up Vercel project with domain and staging environment**
- [ ] **Add production environment variables (Supabase, Stripe, Mailgun)**
- [ ] **Configure Stripe dev account with product SKUs and test plans**
- [ ] **Configure Mailgun sandbox domain and test endpoints**
- [ ] **Set up comprehensive test deployment and seed accounts**

---

### 1.2 Database Schema & Security
**Status:** 100% Complete ✅

- [x] Build all core tables (organizations, users, SIMs, goals, activities)
- [x] Build subscription tables (plans, subscriptions, usage_records)
- [x] Build admin tables (audit_logs, feature_flags)
- [x] Build messaging tables (messages, threads)
- [x] Build what-if scenario tables
- [x] Apply RLS (Row-Level Security) policies
- [x] Add feature flags table with global/org/user scope
- [x] Create 8 complete migrations
- [ ] **Seed initial SIMs from data/sims/*.yaml files**
- [ ] **Create seed data for testing (sample users, orgs, activities)**

---

### 1.3 Authentication System
**Status:** 70% Complete

- [x] Supabase Auth configuration
- [x] Email/password signup flow
- [x] Email/password login flow
- [x] Email verification with auto-redirect
- [x] Password reset functionality
- [x] Session management (HttpOnly cookies)
- [x] Middleware for route protection
- [x] Rate limiting and CAPTCHA support
- [ ] **Social login (Google, Facebook, Twitter) - Currently TODO**
- [ ] **Two-factor authentication (2FA) - Currently returns dummy success**
- [ ] **Complete user profile data fetching**
- [ ] **Session refresh logic**
- [ ] **Logout across all devices functionality**

---

### 1.4 Core User Modules
**Status:** 25% Complete

#### 1.4.1 Goal Calculator ✅
**Status:** 100% Complete

- [x] UI for income input and SIM-based modeling
- [x] Compute daily/weekly/monthly activity goals
- [x] Track changes to recalculate remaining effort
- [x] What-if scenario simulation engine
- [x] Referral impact multiplier calculations
- [ ] **Save goals to Supabase database**
- [ ] **Load historical goals from database**
- [ ] **Goal history and version tracking**

#### 1.4.2 Activity Tracker
**Status:** 30% Complete

- [x] UI to log calls, appointments, deals, referrals
- [x] Auto-fill daily targets in form
- [x] Form validation and client-side logic
- [ ] **Store entries in Supabase activities table**
- [ ] **Fetch and display user's activity history**
- [ ] **Handle retroactive edits and annotations**
- [ ] **Activity summary and statistics**
- [ ] **Activity sync across devices**

#### 1.4.3 What-If Mode
**Status:** 80% Complete

- [x] Toggle to activate sandbox view
- [x] Scenario simulation engine (reuses goal calculator)
- [x] UI for creating scenarios
- [ ] **Save scenarios to database**
- [ ] **Load and manage saved scenarios**
- [ ] **Compare multiple scenarios**

#### 1.4.4 Referral Impact
**Status:** 80% Complete

- [x] UI to define multiplier effects
- [x] Backend logic for deal value/quantity adjustments
- [x] Integration with goal calculator
- [ ] **Save referral configurations to database**
- [ ] **Track actual referral outcomes**
- [ ] **Referral ROI reporting**

---

### 1.5 KPI Dashboards
**Status:** 20% Complete

#### 1.5.1 Individual KPI Dashboard
- [x] UI layout and KPI cards
- [x] Chart components (using Recharts)
- [x] Responsive design
- [ ] **Fetch actual user data from Supabase (currently shows 0s)**
- [ ] **Calculate actual vs target performance**
- [ ] **Generate pacing alerts and notifications**
- [ ] **Real-time data updates**
- [ ] **Export KPI reports**

#### 1.5.2 Organization KPI Dashboard
- [x] UI layout with team aggregation
- [x] Access control for Team Manager/Enterprise roles
- [x] Drilldown UI components
- [ ] **Fetch team data from Supabase**
- [ ] **Aggregate team performance metrics**
- [ ] **Trendline analysis and forecasting**
- [ ] **Team comparison reports**
- [ ] **Export team reports**

#### 1.5.3 Team Leaderboard
- [x] UI skeleton
- [ ] **Fetch and rank team members by performance**
- [ ] **Real-time leaderboard updates**
- [ ] **Filterable by time period and metric**

---

### 1.6 Feature Flags & Access Control
**Status:** 40% Complete

- [x] Database table with global/org/user scope
- [x] RLS policies for feature flags
- [x] Admin UI for flag management
- [ ] **Implement client-side Zustand store**
- [ ] **Resolve flags per user/org/global on login**
- [ ] **Conditionally show/hide UI features**
- [ ] **Backend enforcement for gated features**
- [ ] **Audit logging for feature toggle actions**
- [ ] **Feature flag API endpoints**

---

### 1.7 Platform Admin Tools
**Status:** 10% Complete (UI Only)

All admin pages exist but show placeholder data with TODOs:

- [x] Admin dashboard UI layout
- [x] User management UI
- [x] Organization management UI
- [x] Feature flags admin UI
- [x] Audit logs viewer UI
- [x] Pricing management UI (7 pages)
- [x] Affiliate program pages (7 pages)
- [x] Coupon management UI
- [x] Email management UI
- [x] Platform health UI
- [x] Support UI
- [ ] **Fetch and display all users by org/role**
- [ ] **User impersonation for support (view-only)**
- [ ] **Create/edit/delete feature flags**
- [ ] **Create/suspend/delete organizations**
- [ ] **Reassign users and roles**
- [ ] **Export audit logs**
- [ ] **Manage SIM availability**
- [ ] **Pricing and plan management API**
- [ ] **Affiliate tracking and commissions**
- [ ] **Coupon code generation and validation**
- [ ] **Email template management**
- [ ] **System health monitoring**
- [ ] **Support ticket system**

---

### 1.8 In-App Messaging
**Status:** 0% Complete ❌

- [ ] **Design and build UI modal and thread view**
- [ ] **Implement role enforcement (same-org, manager → user)**
- [ ] **Send message functionality**
- [ ] **Read/unread status tracking**
- [ ] **Delete messages**
- [ ] **12-month message retention policy**
- [ ] **Alert notifications (toast, email, badge)**
- [ ] **Real-time message updates**
- [ ] **Message search and filtering**

---

### 1.9 Subscription & Billing (Stripe)
**Status:** 5% Complete (Configured Only)

- [x] Stripe dependencies installed
- [x] Environment variables configured
- [ ] **Create Stripe products matching plans.yml**
- [ ] **Create checkout sessions for plan selection**
- [ ] **Implement add-on purchases (Voice AI, extra users)**
- [ ] **Delayed capture flow for proofs**
- [ ] **Webhook handlers (invoice.paid, invoice.failed, etc.)**
- [ ] **Subscription upgrade/downgrade flow**
- [ ] **Plan enforcement logic (max users, SIMs)**
- [ ] **Usage-based billing for Voice AI**
- [ ] **Billing history and invoices page**
- [ ] **Payment method management**
- [ ] **Subscription cancellation flow**

---

### 1.10 Email System (Mailgun)
**Status:** 5% Complete (Configured Only)

- [x] Mailgun dependencies available
- [x] Environment variables configured
- [ ] **Configure Mailgun domain and API keys**
- [ ] **Create email templates (welcome, verification, password reset)**
- [ ] **Transactional email sending (signup, password reset)**
- [ ] **Notification emails (KPI alerts, messages)**
- [ ] **Email preferences and opt-out management**
- [ ] **Email delivery tracking and analytics**
- [ ] **Marketing email campaigns (future)**

---

### 1.11 UI & Styling
**Status:** 80% Complete ✅

- [x] Tailwind CSS configuration
- [x] Design system from UI_Guide_and_Design_System.md
- [x] 91 reusable components (Radix UI)
- [x] Mobile-first responsive design
- [x] Accessibility (ARIA labels, semantic HTML)
- [x] Dark mode support infrastructure
- [x] Component library (inputs, charts, modals, buttons)
- [ ] **Polish edge cases and loading states**
- [ ] **Consistent error messaging**
- [ ] **Animation and transition improvements**

---

### 1.12 API Routes & Backend Integration
**Status:** 10% Complete ❌ CRITICAL

- [x] `/auth/callback` - Email verification (124 lines, functional)
- [x] Profile initialization via RPC
- [ ] **Activity CRUD endpoints (create, read, update, delete)**
- [ ] **Goals CRUD endpoints**
- [ ] **Referrals CRUD endpoints**
- [ ] **What-if scenarios CRUD endpoints**
- [ ] **Dashboard data aggregation endpoints**
- [ ] **Team performance endpoints**
- [ ] **Feature flags API**
- [ ] **Admin operations API**
- [ ] **Messaging API**
- [ ] **Billing/Stripe webhook handlers**
- [ ] **File upload endpoints (if needed)**
- [ ] **Data export endpoints (CSV, PDF)**
- [ ] **Pagination, filtering, sorting logic**
- [ ] **Input validation and sanitization**
- [ ] **Error handling and logging**

---

### 1.13 Testing, QA, and CI/CD
**Status:** 15% Complete ❌ CRITICAL

- [x] Jest configuration
- [x] Cypress configuration
- [x] TypeScript strict mode checks
- [x] ESLint configuration
- [x] GitHub Actions CI workflow
- [x] 1 test file (login-form.test.tsx)
- [ ] **Unit tests for all utilities and hooks (80% coverage goal)**
- [ ] **Component tests for all major components**
- [ ] **API route tests**
- [ ] **E2E tests for critical flows:**
  - [ ] Signup and email verification
  - [ ] Login and logout
  - [ ] Goal calculator usage
  - [ ] Activity logging
  - [ ] Dashboard viewing
  - [ ] Feature flag toggling
  - [ ] Messaging flows
  - [ ] Billing and checkout
- [ ] **Integration tests for Supabase queries**
- [ ] **Performance tests**
- [ ] **Accessibility tests (axe-core)**
- [ ] **Visual regression tests**
- [ ] **Pre-deploy test automation on all branches**
- [ ] **Test data factories and fixtures**

---

### 1.14 Deployment & DevOps
**Status:** 20% Complete

- [x] GitHub repository
- [x] Basic CI workflow
- [ ] **Connect Vercel to production domain**
- [ ] **Set up staging environment**
- [ ] **Configure production Supabase instance**
- [ ] **Set up database backups**
- [ ] **Configure all environment variables in Vercel**
- [ ] **Run seed scripts (plans, SIMs, admin users)**
- [ ] **Set up monitoring (Vercel Analytics, Sentry)**
- [ ] **Configure CDN for static assets**
- [ ] **Set up error tracking and alerts**
- [ ] **Create deployment documentation**
- [ ] **Push to main and verify deployment**

---

### 1.15 Post-Launch Support & Monitoring
**Status:** 0% Complete

- [ ] **Set up uptime monitoring**
- [ ] **Configure log aggregation and analysis**
- [ ] **Monitor billing and auth errors**
- [ ] **Set up secret rotation schedule**
- [ ] **Usage analytics tracking**
- [ ] **User feedback collection system**
- [ ] **Support request workflow**
- [ ] **Performance monitoring and optimization**
- [ ] **Security vulnerability scanning**

---

## 🎯 Immediate Priorities (Next 2 Weeks)

### Week 1: Backend Integration
**Priority: CRITICAL**

1. [ ] Connect Dashboard to Supabase
   - [ ] Fetch user profile and organization data
   - [ ] Fetch actual KPI values (replace 0s)
   - [ ] Calculate actual vs target metrics
   - [ ] Display real activity data

2. [ ] Implement Activity API
   - [ ] POST /api/activities - Create activity
   - [ ] GET /api/activities - List user activities
   - [ ] PUT /api/activities/:id - Update activity
   - [ ] DELETE /api/activities/:id - Delete activity

3. [ ] Implement Goals API
   - [ ] POST /api/goals - Save goal configuration
   - [ ] GET /api/goals - Fetch user goals
   - [ ] GET /api/goals/history - Goal history

### Week 2: Testing & Stripe Foundation
**Priority: HIGH**

1. [ ] Build Comprehensive Test Suite
   - [ ] 20+ unit tests for utilities
   - [ ] 10+ component tests
   - [ ] 5 E2E tests for critical flows

2. [ ] Start Stripe Integration
   - [ ] Create Stripe products and prices
   - [ ] Build checkout session creation
   - [ ] Implement basic webhook handler

---

## 📅 Phase 1 Completion Timeline

### Months 1-2: Core Integration & Testing
- Backend API integration (all CRUD endpoints)
- Comprehensive test suite (80% coverage)
- Dashboard real data connection
- Activity tracking persistence

### Month 2-3: Billing & Admin
- Complete Stripe integration
- Complete Mailgun integration
- Functional admin console
- Feature flags fully operational

### Month 3: Polish & Launch Prep
- Bug fixes and edge cases
- Performance optimization
- Security audit
- Production deployment
- Beta user testing

**Target Production Launch:** 8-12 weeks from now

---

## Phase 2: Voice AI Add-On

*(Not started - begin only after Phase 1 is complete)*

### 2.1 Voice AI Data Model & RLS
- [ ] Define voice_personas, voice_scenarios, voice_sessions tables
- [ ] Add RLS policies for Voice AI
- [ ] Seed personas and scenarios

### 2.2 Voice AI Provider Integrations
- [ ] Integrate ElevenLabs (TTS)
- [ ] Integrate OpenAI (STT & GPT-4)
- [ ] Build provider failover logic

### 2.3 Voice AI Backend & APIs
- [ ] `/api/voice/start-session`
- [ ] `/api/voice/stream-audio` (WebRTC)
- [ ] `/api/voice/end-session`
- [ ] Usage tracking and cost calculation

### 2.4 Voice AI Billing
- [ ] Stripe SKUs for Voice AI add-ons
- [ ] Webhook handlers
- [ ] Billing UI updates

### 2.5 Voice AI Frontend
- [ ] Voice AI Lobby (persona/scenario selection)
- [ ] WebRTC Chat Window
- [ ] Session Summary screen

### 2.6 Voice AI Testing
- [ ] Unit tests for cost estimation
- [ ] Integration tests with provider mocks
- [ ] E2E tests for full Voice AI flow
- [ ] Load tests (50 concurrent sessions)

### 2.7 Voice AI Documentation
- [ ] Update all docs with Voice AI info
- [ ] RLS and data retention policies

### 2.8 Voice AI Launch
- [ ] Enable beta feature flag
- [ ] Closed beta testing
- [ ] Production launch

---

## 📝 Notes

- **Phase 1 must be 100% complete** before starting Phase 2
- **Testing is non-negotiable** - do not ship without comprehensive tests
- **All TODOs in codebase** should be tracked here and resolved
- Review and update this roadmap weekly

---

**For questions or updates:** rob@miodiollc.com

© 2025 SalesPulse
