# Feature Matrix Reference (v2.1)

*Authoritative Source: `data/plans.yml`*

This document outlines which features are available in each subscription tier. Core platform features are available in Phase 1\. All Voice AI–related features are tagged for Phase 2\.

---

## 1\. Core Platform Features

| Feature | Free | Pro | Team | Enterprise |
| :---- | :---- | :---- | :---- | :---- |
| Goal Calculator | ✅ | ✅ | ✅ | ✅ |
| Activity Logging | ✅ | ✅ | ✅ | ✅ |
| Referral Modeling | ❌ | ✅ | ✅ | ✅ |
| What-If Mode | ❌ | ✅ | ✅ | ✅ |
| SIM Tuning | ❌ | ✅ | ✅ | ✅ |
| Calendar Integration | ❌ | ✅ | ✅ | ✅ |
| KPI Dashboard (Personal) | ✅ | ✅ | ✅ | ✅ |
| Organization KPI Dashboard | ❌ | ❌ | ✅ | ✅ |
| In-App Messaging | ❌ | ❌ | ✅ | ✅ |
| Feature Toggle Panel (Org-Level) | ❌ | ❌ | ✅ | ✅ |
| Feature Toggle Panel (Global) | ❌ | ❌ | ❌ | ✅ (admin) |
| SIM Management Interface | ❌ | ❌ | ✅ | ✅ |
| Admin Console (Platform Staff) | ❌ | ❌ | ❌ | ✅ (admin) |
| Stripe Checkout w/ Auth \+ Capture | ✅ | ✅ | ✅ | ✅ |
| Email Notifications via Mailgun | ✅ | ✅ | ✅ | ✅ |
| RLS-Protected Multi-Tenant DB | ✅ | ✅ | ✅ | ✅ |

---

## 2\. Voice AI Feature Matrix (Phase 2\)

*All Voice AI–related features below are slated for Phase 2 implementation.*

| Voice AI Feature | Free | Pro | Team | Enterprise |
| :---- | :---- | :---- | :---- | :---- |
| Voice AI Add-On Eligibility (Phase 2) | ❌ | ✅ (Add-on Required) | ✅ (Add-on Included ×1) | ✅ (Add-on Included ×3) |
| Voice AI Basic Practice Sessions (Phase 2) | ❌ | ⬆️ (Add-on Required) | ✅ (if add-on active) | ✅ (if add-on active) |
| Customer Persona Selection (Phase 2) | ❌ | ⬆️ (Add-on Required) | ✅ (if add-on active) | ✅ (if add-on active) |
| Difficulty Level Selection (Phase 2) | ❌ | ⬆️ (Limited Levels) | ✅ (Extended Levels) | ✅ (All Levels) |
| Global Voice AI Scenarios (Phase 2) | ❌ | ⬆️ (Add-on Required) | ✅ | ✅ |
| Custom Organization Scenarios (Phase 2) | ❌ | ❌ | ✅ | ✅ |
| Voice AI Session Analytics (Phase 2) | ❌ | ⬆️ (Basic Analytics) | ✅ (Detailed Analytics) | ✅ (Comprehensive Insights) |
| Team Voice AI Management (Phase 2) | ❌ | ❌ | ✅ (Assign \+ Analytics) | ✅ (Assign \+ Analytics) |
| Voice AI Content Creation (Phase 2) | ❌ | ❌ | ✅ (Limited Content Tools) | ✅ (Full Content Tools) |
| Voice AI Usage Analytics (Phase 2) | ❌ | ❌ | ✅ (Team-Level) | ✅ (Organization-Level) |
| Custom Persona Creation (Phase 2) | ❌ | ❌ | ✅ | ✅ |
| Custom Objection Bank Management (Phase 2) | ❌ | ❌ | ✅ | ✅ |
| Scenario Assignment to Team (Phase 2) | ❌ | ❌ | ✅ | ✅ |
| Voice AI Usage Overage Purchase (Phase 2) | ❌ | ⬆️ ($0.50/15 min) | ⬆️ ($0.50/15 min) | ⬆️ ($0.50/15 min) |

---

### Notes

* `⬆️` denotes additional purchase required beyond the base plan.  
* SIM access, user limits, and add-on pricing are defined in `data/plans.yml` and drive billing logic.  
* During Phase 1, Voice AI features should appear in documentation and UI as “Phase 2” with no active functionality.

For more details on Phase 2 sequencing and dependencies, refer to **Project\_Plan.md**.

---

© 2025 SalesPulse  
