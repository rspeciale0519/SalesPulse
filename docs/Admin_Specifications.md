# Admin Specifications (v2.1)

This document describes the administration interfaces and capabilities for managing the SalesPulse platform. Core admin functions (Phase 1) are outlined first; Voice AI administration (Phase 2) follows.

---

## 1\. Admin Roles & Permissions

| Admin Role | Scope | Permissions (Phase 1) | Permissions (Phase 2) |
| :---- | :---- | :---- | :---- |
| **Platform Admin** | Global | \- Manage all organizations and users |  |

* Toggle global feature flags  
* Impersonate any user  
* View audit logs across all orgs  | \- Manage global Voice AI personas and scenarios  
* Adjust global TTS/STT provider settings and pricing  
* View system-wide Voice AI usage reports  | | **SuperAdmin**     | Global (Superuser tier) | \- All Platform Admin capabilities  
* Manage Platform Admin accounts  | \- All Platform Admin Voice AI capabilities  
* Approve pricing changes for Voice AI  | | **Organization Admin** | Organization         | \- View, create, edit, deactivate users within org  
* Manage org-level feature flags  
* Assign SIMs to users  
* View org-level performance dashboards  | \- Create and manage org-specific Voice AI personas  
* Configure org-level settings (daily/monthly limits, circuit breaker thresholds)  
* View org Voice AI usage analytics  | | **Organization Team Manager** | Specific team within org | \- View and edit users within their team  
* Assign SIMs to team members  
* View team performance metrics  | \- Assign Voice AI scenarios to team members  
* View team Voice AI session summaries  |

---

## 2\. Admin Console UI Components (Phase 1)

### 2.1 Dashboard Overview

* **Summary Cards**: Total organizations, active users, SIM usage summary, subscription revenue.  
* **Quick Actions**: Buttons to create new organization, view feature flags, or review audit logs.

### 2.2 Organization Management

* **Organization List Table**  
    
  * Columns: `Org ID`, `Org Name`, `Plan Tier`, `Status`, `Created At`, `Actions`  
  * Actions: `View`, `Edit`, `Deactivate` (soft-delete sets `is_active = false`)  
  * Filtering: Search by `Org Name`; filter by `Status` (Active/Inactive).


* **Organization Detail Page**  
    
  * **Tabs**: `Overview`, `Users`, `SIM Assignments`, `Usage Metrics`, `Feature Flags`.  
  * **Overview Tab**: Display org details and plan information.  
  * **Users Tab**: List users in org with columns `User ID`, `Name`, `Email`, `Role`, `Status`, `Actions` (`Edit`, `Deactivate`, `Impersonate`).  
  * **SIM Assignments Tab**: Table of `User`, `SIM`, `Purchased At`, `Expires At`, `Usage Count`; `Assign SIM` modal to allocate new SIMs.  
  * **Usage Metrics Tab**: Charts showing org-wide KPI trends (calls, deals, SIM usage) for Phase 1.


* **Create/Edit Organization Form**  
    
  * Input fields: `Org Name` (text), `Plan Tier` (dropdown), `Max Users` (auto-set by tier), `Status` (Active/Inactive).  
  * Validation: `Org Name` required; `Plan Tier` selection updates allowed `Max Users` and `SIMs`.

### 2.3 User Management (Phase 1)

* **User List Table**  
    
  * Columns: `User ID`, `Name`, `Email`, `Role`, `Org`, `Status`, `Last Login`, `Actions` (`Edit`, `Deactivate`, `Impersonate`).  
  * Filtering: Search by `Name`/`Email`, filter by `Org`, filter by `Role`, filter by `Status`.


* **Create/Edit User Modal**  
    
  * Input fields: `Name` (text), `Email` (text), `Role` (dropdown: `manager`, `rep`), `Org` (dropdown), `Status` (Active/Inactive).  
  * On creation: Send invitation email via Mailgun using `invite_user` template.  
  * On edit: Allow updating `Role`, `Status`, and reassigning to a different org (Org Admins can only edit users within their org).


* **Impersonation Feature**  
    
  * Button in `Actions` column: `Impersonate`.  
  * Opens a new tab with a session token that allows viewing the application as the selected user (view-only; no destructive actions permitted).


* **Deactivate User Flow**  
    
  * Confirmation modal prior to deactivation.  
  * Sets `auth.users.is_active = false` and `users.is_active = false`.  
  * Optionally send notification email to user.

### 2.4 Feature Flags Management (Phase 1)

* **Global Feature Flags**  
    
  * Table: `Flag Key`, `Scope` (`global`), `Is Enabled`, `Last Modified`, `Actions` (`Toggle`).  
  * Toggle switches to enable/disable flags; write audit log entry on change.


* **Organization-Level Feature Flags**  
    
  * In Organization Detail Page → `Feature Flags` tab.  
  * Table: `Flag Key`, `Scope` (`org`), `Is Enabled`, `Actions` (`Toggle`).  
  * Adding a new flag: `Create Flag` modal with `Key`, `Default Value` (enabled/disabled).  
  * Only display feature flags defined globally or for that org.


* **User-Level Feature Flags**  
    
  * Accessible in `User List` → `Edit User` modal → `Feature Flags` section.  
  * Table: `Flag Key`, `Is Enabled`.  
  * Toggling a user-level flag overrides org/global value.


* **Audit Logging**  
    
  * Record each toggle action in `audit_logs`: `actor_id`, `action` \= `feature_flag_toggle`, `target_type`, `target_id`, `timestamp`.

### 2.5 Audit Logs Viewer (Phase 1)

* **Audit Logs Table**  
    
  * Columns: `Log ID`, `Actor`, `Action`, `Target Type`, `Target ID`, `Timestamp`.  
  * Filtering: by `Actor`, `Action`, `Target Type`, date range.  
  * Pagination and CSV export.

---

## 3\. Admin Console UI Components (Phase 2)

### 3.1 Voice AI Persona & Scenario Library

* **Persona List**  
    
  * Table: `Persona ID`, `Name`, `Description`, `Scope` (`global`/`org`), `Created At`, `Actions` (`Edit`, `Deactivate`).  
  * `Create Persona` modal: `Name` (text), `Description` (textarea), `Scope` (dropdown: `global`, or select `Org`), `Default Difficulty Level` (1–5).


* **Scenario Management**  
    
  * Under a selected Persona → `Scenarios` tab.  
  * Table: `Scenario ID`, `Prompt Text (truncated)`, `Difficulty Level`, `Created At`, `Actions` (`Edit`, `Deactivate`).  
  * `Create Scenario` modal: `Prompt Text` (textarea), `Expected Responses` (JSON editor or file upload), `Difficulty Level` (1–5), `Persona` (pre-selected).


* **Scenario Assignment to Teams**  
    
  * Interface to assign scenarios to specific teams or users.  
  * Bulk-assign via multi-select dropdown for org managers.

### 3.2 Voice AI Settings & Policies

* **Org-Level Voice Settings**  
    
  * In Organization Detail Page → `Voice AI Settings` tab.  
  * Fields: `Price Per Minute` (numeric), `Daily Limit Minutes` (integer), `Monthly Limit Minutes` (integer), `Circuit Breaker Threshold` (currency).  
  * Editable only by `Organization Admin` or higher.


* **Global Voice Settings**  
    
  * In Global Admin Console → `Voice AI Settings` page.  
  * Fields: same as org settings, but apply to all orgs by default.  
  * Ability to set fallback provider endpoints, health check intervals.


* **Voice AI Usage Reports**  
    
  * Interface to view aggregated `voice_usage_records` by `Org`, `User`, `Persona`, `Scenario`.  
  * Filters: date range, persona, scenario, user.  
  * Export CSV functionality.

### 3.3 Billing & Pricing Adjustments (Phase 2)

* **Voice Add-On Price Overrides**  
    
  * In `Plan Management`, separate section for Voice AI add-on SKUs: `Single SIM Price`, `3-SIM Bundle Price`.  
  * Ability to update these price IDs and fallback pricing manually.


* **Usage-Based Billing Dashboard**  
    
  * Show real-time metrics: `Total Voice Minutes Used` (organizational), `Overage Charges Incurred`.  
  * Warn when approaching threshold (visual progress bars).

---

## 4\. Security & Access Control (Admin Features)

* **RLS Enforcement**  
    
  * All admin tables enforce RLS: only allowed roles can query or mutate.  
  * Example: `feature_flags` table policy: allow `SELECT` if role \= `admin`; allow `UPDATE` if role \= `admin`.


* **2FA & Account Protection**  
    
  * Platform Admins and SuperAdmins must enable Two-Factor Authentication (2FA) via email or authenticator app.  
  * Admin console access requires stronger password policies (minimum length 12, must include uppercase, numeric, special characters).


* **Session Timeout**  
    
  * Admin console sessions timeout after 30 minutes of inactivity.  
  * Display warning modal 2 minutes before timeout with option to extend.

---

## 5\. Monitoring & Alerting (Admin Features)

* **Health Checks Dashboard**  
    
  * Show status of core services: Supabase DB, Edge Functions, Stripe webhook connectivity, Mailgun API latency.  
  * Real-time Ping status visual (green/red).


* **Voice AI Provider Health (Phase 2)**  
    
  * Display current health of STT/TTS providers (ElevenLabs, OpenAI, fallback).  
  * Show recent failures or latency spikes.


* **Alert Configuration**  
    
  * Ability to configure thresholds (e.g., \>5% failed webhook calls triggers alert).  
  * Set notification channels: email to `admin@miodiollc.com`, Slack integration (optional).

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
