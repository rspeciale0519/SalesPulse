# Functional Requirements (v2.1)

This document specifies the detailed functional requirements for the SalesPulse platform. Requirements are divided into Phase 1 (Core Platform) and Phase 2 (Voice AI Add-On). All Voice AI requirements are tagged with **Phase 2**.

---

## 1\. User Management & Authentication

### 1.1 User Roles & Permissions

* **Roles:**  
    
  * `admin`: Full access to all features across all organizations; can manage orgs, users, feature flags.  
  * `manager`: Can manage users within their organization, view/edit all data for that org, but not global settings.  
  * `rep`: Sales representative; can view/edit their own data, goals, activities, and access SIMs.


* **Functional Requirements:**  
    
  1. Admin can create, read, update, and deactivate organizations.  
  2. Admin can assign or change user roles.  
  3. Manager can invite new reps to their organization via email.  
  4. Rep can view their profile, update name, and change password.

### 1.2 Authentication

* **Method:** Email/password via Supabase Auth.  
    
* **Requirements:**  
    
  1. User signs up with email and password; receives verification email.  
  2. Password reset flow triggers email with reset link.  
  3. On login, JWT is issued and stored in HttpOnly cookie.  
  4. Middleware (`middleware.ts`) verifies JWT on protected routes.

---

## 2\. Core Features (Phase 1\)

### 2.1 Goal Calculator

* **Functional Requirements:**  
    
  1. Rep enters annual income target and selects one or multiple SIMs.  
  2. System calculates required daily/weekly/monthly activities (calls, appointments, deals) based on SIM-specific ratios.  
  3. User can edit any activity type’s weight or conversion rates (for Pro+ plans).  
  4. Display a summary: total calls needed, deals needed, referrals impact required.  
  5. Persist goal records; allow edits until `end_date`.

### 2.2 Activity Tracking

* **Functional Requirements:**  
    
  1. Rep logs daily activities: calls, appointments, closed deals, referrals.  
  2. Each activity entry ties to a date; cannot log future dates.  
  3. System validates entries against daily limits (e.g., max 200 calls).  
  4. Users can edit activity entries within 24 hours; managers can edit any within org.

### 2.3 Referral Impact Modeling

* **Functional Requirements:**  
    
  1. Rep defines a referral’s dollar or percentage impact toward deal flow.  
  2. System adjusts required metrics dynamically (reduce calls/deals if referrals exceed threshold).  
  3. Display referral-adjusted targets in dashboard.

### 2.4 What-If Mode

* **Functional Requirements:**  
    
  1. Rep toggles into What-If mode to simulate different inputs (e.g., increased conversion rates).  
  2. Sandbox view shows projected results without affecting actual data.  
  3. Rep can save What-If scenarios for future reference.

### 2.5 KPI Dashboards

#### 2.5.1 Individual KPI Dashboard

* **Functional Requirements:**  
    
  1. Show rep’s daily, weekly, monthly progress vs targets.  
  2. Display charts: calls over time, appointments scheduled, deals closed.  
  3. Alert if user is below pacing (e.g., 50% of daily target by midday).

#### 2.5.2 Organization KPI Dashboard

* **Functional Requirements:**  
    
  1. Manager can view aggregated metrics for all reps in org.  
  2. Drill-down to individual rep metrics.  
  3. Display trend analysis (over last 30 days).  
  4. Export to CSV.

### 2.6 SIM Management

* **Functional Requirements:**  
    
  1. Display list of available SIMs (Real Estate, Insurance, etc.).  
  2. Rep can purchase or attach SIMs (price per plan).  
  3. Display usage count per SIM; enforce limits per plan.  
  4. Manager can assign SIMs to reps in org (Team/Enterprise).

### 2.7 In-App Messaging

* **Functional Requirements:**  
    
  1. Rep can start a message thread with their Manager.  
  2. Manager can message individual reps or broadcast to entire team.  
  3. Store messages and threads; retain history for 12 months.  
  4. Indicate read/unread status; optional email notifications on new message.

### 2.8 Subscription & Billing

* **Functional Requirements:**  
    
  1. Rep can select and purchase plan via Stripe checkout.  
  2. Payment intent uses `capture_method='manual'` until proofs are approved (if applicable).  
  3. System creates `subscriptions` record and tracks status (`active`,`past_due`,`canceled`).  
  4. On plan upgrade/downgrade, prorate charges accordingly.  
  5. Enforce quotas (max users, SIMs) based on plan tier.  
  6. Provide billing history and invoices in user’s billing page.

### 2.9 Feature Flags

* **Functional Requirements:**  
    
  1. Admin can toggle features globally, per org, or per user.  
  2. Frontend checks feature flags on login and stores in state.  
  3. Backend endpoints validate feature flag on each request (using RLS).  
  4. Logging of flag changes (actor, timestamp, scope).

### 2.10 Admin Console

* **Functional Requirements:**  
    
  1. Admin can view all organizations and their status.  
  2. Admin can create, edit, deactivate organizations.  
  3. Admin can view all users across orgs; filter by role, status.  
  4. Admin can impersonate any user to troubleshoot (view-only mode).  
  5. Admin can view audit logs; search by actor, target, date range.

---

## 3\. Reporting & Analytics

### 3.1 Usage Reports

* **Functional Requirements:**  
    
  1. Generate monthly report on SIM usage per org.  
  2. Export CSV with columns: `user_id`, `sim_id`, `usage_date`, `usage_amount`.  
  3. Manager can schedule automated reports (daily, weekly, monthly) via email.

### 3.2 Audit Trail

* **Functional Requirements:**  
    
  1. Log all critical actions: user creation, role changes, plan changes, feature toggles.  
  2. Store logs in `audit_logs` with `actor_id`, `action`, `target_type`, `target_id`, `timestamp`.  
  3. Admin interface to filter and view audit entries.

---

## 4\. UI/UX Requirements

### 4.1 Responsive Design

* **Functional Requirements:**  
    
  1. All pages must render correctly on desktop, tablet, and mobile.  
  2. Sidebar collapses into a hamburger menu on screens narrower than 768px.  
  3. Tables become horizontally scrollable on mobile.

### 4.2 Accessibility

* **Functional Requirements:**  
    
  1. All interactive elements must have keyboard focus states.  
  2. Use ARIA labels for icons and complex components.  
  3. Ensure color contrast ratios meet WCAG AA.

### 4.3 Consistent Styling

* **Functional Requirements:**  
    
  1. Adhere to the design tokens and component guidelines in `UI_Guide_and_Design_System.md`.  
  2. Use Tailwind utility classes for styling; avoid custom CSS when possible.  
  3. Maintain consistent typography, spacing, and color usage.

---

## 5\. Non-Functional Requirements

### 5.1 Performance

* **Functional Requirements:**  
    
  1. Page load time under 3 seconds for authenticated pages on standard broadband.  
  2. API response times under 300ms for core CRUD operations.  
  3. Support at least 100 concurrent users on core platform.

### 5.2 Scalability

* **Functional Requirements:**  
    
  1. Supabase should auto-scale read replicas and Edge Functions based on load.  
  2. Use CDN (Vercel) to cache static assets.  
  3. Design database indexes for efficient queries on large datasets (e.g., activities over 100k rows).

### 5.3 Security

* **Functional Requirements:**  
    
  1. Enforce HTTPS for all endpoints.  
  2. Implement RLS on all tables as defined in `Security_Implementation.md`.  
  3. Rate-limit sensitive endpoints (login, password reset) to mitigate brute force.

### 5.4 Maintainability

* **Functional Requirements:**  
    
  1. Codebase should have ≥80% unit test coverage.  
  2. Follow consistent code style (ESLint, Prettier).  
  3. Document all APIs in `Integrations_Specifications.md` with request/response examples.

---

## 6\. Phase 2: Voice AI Add-On Requirements

*All requirements below are for Phase 2 implementation; do not begin until Phase 1 is complete.*

### 6.1 Persona & Scenario Management

* **Functional Requirements:**  
    
  1. Global personas available to all orgs; org-specific personas override global.  
  2. Manager/ Admin can create custom personas (name, description, default scenario).  
  3. Scenario must include `prompt_text`, `expected_responses`, and `difficulty_level` (1–5).  
  4. Scenario selection on session start filters by persona and difficulty.

### 6.2 Real-Time Voice Sessions

* **Functional Requirements:**  
    
  1. User initiates session by selecting persona and scenario; system returns TURN server credentials.  
  2. Client establishes WebRTC connection with Edge Function to stream audio.  
  3. Audio is sent to STT (OpenAI Whisper); transcription text is sent to GPT-4 for response.  
  4. GPT-4 response is sent to TTS (ElevenLabs) and streamed back to client.  
  5. Session can be paused, resumed, or terminated by user or system (circuit breaker).

### 6.3 Cost Control & Billing

* **Functional Requirements:**  
    
  1. Estimate cost at session start: `cost_estimate = expected_duration * price_per_minute`.  
  2. Display real-time usage: minutes used, cost incurred, percentage of daily/monthly limits.  
  3. If `cost_actual` exceeds `circuit_breaker_threshold`, system auto-terminates session and notifies user.  
  4. Voice usage applied to `voice_usage_records`; usage aggregated per user daily/monthly.

### 6.4 Session Analytics

* **Functional Requirements:**  
    
  1. After session end, generate summary: total minutes, cost, score based on scenario responses.  
  2. Store full transcript; allow user to download or review within UI.  
  3. Manager can view team’s voice usage analytics: minutes used per rep, scenario success rates.

### 6.5 Security & Compliance

* **Functional Requirements:**  
    
  1. Stream audio over DTLS/SRTP; do not fall back to unencrypted channels.  
  2. Store transcripts encrypted at rest; signed URLs expire after 5 minutes.  
  3. Provide endpoint to delete user’s voice data upon request (GDPR compliance).

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
