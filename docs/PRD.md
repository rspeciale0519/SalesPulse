# Product Requirements Document (PRD) — SalesPulse (v2.2)

This PRD defines the functional goals, business justification, core platform requirements (Phase 1), and Voice AI Add-On requirements (Phase 2) for SalesPulse. All sections related to Voice AI are explicitly labeled as **Phase 2**.

---

## 1\. Purpose

SalesPulse enables life insurance sales representatives to track income goals, log daily activities, and visualize performance. The core platform (Phase 1) focuses on goal calculation, activity tracking, KPI dashboards, SIM management, and billing. The Voice AI Add-On (Phase 2) provides AI-driven conversation practice, real-time audio coaching, and scenario-based training to accelerate skill development and improve sales performance.

---

## 2\. Target Audience

### 2.1 Primary Users

* **Sales Representatives (Reps):** Seek to hit sales goals, track activities, and improve skills through AI coaching (Phase 2).  
* **Team Managers:** Monitor team performance, assign SIMs, enable coaching for reps (Phase 2).  
* **Enterprise Administrators:** Oversee multiple teams, manage billing and feature flags, and configure global coaching content (Phase 2).

### 2.2 Secondary Users

* **Platform Admins & SuperAdmins:** Manage tenant configurations, global feature flags, and Voice AI content library (Phase 2).  
* **Support & QA Teams:** Monitor user data, troubleshoot issues, and validate Voice AI session analytics (Phase 2).

---

## 3\. Use Cases & Goals

| Use Case | Phase 1 Core Platform | Phase 2 Voice AI Add-On |
| :---- | :---- | :---- |
| Set income & activity goals | Compute daily/weekly targets based on SIMs | N/A |
| Log and track daily activities (calls, appointments) | Real-time input, pacing alerts | N/A |
| Visualize KPI dashboard | Individual & org dashboards | Include Voice AI metrics—minutes used, cost, skill scores |
| Purchase and manage SIMs | Browse, purchase, and assign SIMs | Determine coaching add-on eligibility and pricing |
| In-app messaging | Threaded messaging between rep and manager | Integrate coaching feedback and session summaries into threads |
| Manage subscriptions & billing | Stripe integration, plan upgrades/downgrades | Add Voice AI add-on to subscription, manage usage overages |
| **AI-Powered Conversation Practice** | N/A | Real-time audio sessions, persona selection, difficulty levels |
| **Voice AI Scenario Customization** | N/A | Create or edit objection banks, training scenarios |
| **Coach Performance Analytics** | N/A | Display session analytics: success rates, recommendations |

---

## 4\. User Roles and Permissions

| Role | Phase 1 Capabilities | Phase 2 Voice AI Access |
| :---- | :---- | :---- |
| **Rep** | Personal KPI dashboard, goal calculator, activity logging | Access to Voice AI practice sessions (if add-on active) |
| **Team Manager** | Org KPI dashboard, SIM assignment, messaging | View team Voice AI analytics, assign scenarios, manage coaching |
| **Enterprise Admin** | Full org user control, plan visibility, feature toggling | Manage organization-level Voice AI personas & content |
| **Enterprise Team Mgr** | Scoped access to sub-team features, analytics | Sub-team Voice AI analytics and management |
| **Platform Admin** | Global/Org/User feature flag control, impersonation | Global Voice AI content management and system administration |
| **SuperAdmin** | Global control across all organizations, user, and feature rollout | Full Voice AI system administration, pricing updates |

---

## 5\. Platform Tiers & Monetization

### 5.1 Pricing Plan Summary

| Tier | Monthly Cost | Users Included | SIMs Included | Extra Users | Extra SIMs | Voice AI Individual (Phase 2) | Voice AI Bundle (Phase 2) |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| **Free** | $0 | 1 | 0 | N/A | N/A | N/A | N/A |
| **Pro** | $25 | 1 | 1 | N/A | $10/mo each | $10/mo per SIM | $25/mo for 3 SIMs |
| **Team** | $100 | 5 | 1 | $20/mo per user (up to 5\) | $10/mo each | $10/mo per SIM | $25/mo for 3 SIMs |
| **Enterprise** | $300 | 15 | 3 | $20/mo per user (no limit) | $10/mo each | $10/mo per SIM | $25/mo for 3 SIMs |

**Notes:**

* Voice AI add-ons require an active SIM.  
* Bundled pricing applies only to groups of 3 SIMs.  
* Add-on attach rates and revenue projections are defined in Phase 2 requirements.

---

## 6\. User Journeys & Workflows

### 6.1 Core Platform (Phase 1)

1. **Sign-Up & Onboarding**:  
     
   * User signs up → receives verification email → logs in → completes profile.  
   * System initializes default plan (Free) and prompts to purchase Pro or higher.

   

2. **Goal Setup**:  
     
   * Rep navigates to Goal Calculator → enters income target → selects SIM(s) → views activity breakdown.  
   * Goals are persisted and visible on dashboard.

   

3. **Activity Logging**:  
     
   * Rep logs calls/appointments/deals via Activity Tracker → inputs are validated → updates KPI progress in real time.  
   * If logged before EOD, user can edit within 24 hours; manager may edit any.

   

4. **SIM Management**:  
     
   * Rep views SIM catalog → purchases a SIM → system updates usage count → rep accesses SIM tools.  
   * Manager can assign SIMs to reps in Org.

   

5. **Billing & Stripe Flow**:  
     
   * User selects plan → Stripe Checkout Session created → on success, `subscriptions` record created → quotas updated → UI reflects new limits.  
   * Webhooks handle `invoice.payment_succeeded` and `invoice.payment_failed`.

   

6. **In-App Messaging**:  
     
   * Rep opens messaging panel → sends message to manager → message stored in `messages` and `threads` tables → unread badge updates.  
   * Manager replies; user receives email notification (optional).

   

7. **Dashboard & Analytics**:  
     
   * Rep navigates to dashboard → views charts for calls, appointments, deals vs. targets → pacing alerts displayed.  
   * Manager views org dashboard → drills down to individual rep metrics → exports CSV.

### 6.2 Voice AI Add-On (Phase 2)

1. **Add-On Activation**:  
     
   * Team/Enterprise user purchases Voice AI add-on via modified checkout flow → add-on active flag toggled.

   

2. **Voice AI Lobby**:  
     
   * Rep clicks “AI Coaching” → enters lobby → selects a global or org-specific persona → selects scenario and difficulty → views cost estimate.

   

3. **Real-Time Session**:  
     
   * System calls `/api/voice/start-session` → returns TURN credentials → client initiates WebRTC handshake → streams audio.  
   * Audio relayed to STT (Whisper) → transcribed text sent to GPT-4 → GPT-4 response synthesized by ElevenLabs → audio returned to client.  
   * UI displays live transcript and cost usage banner.

   

4. **Cost Control & Circuit Breaker**:  
     
   * Server calculates actual minutes and cost → if cost \> threshold, session auto-terminates → user alerted via modal.  
   * All usage logged in `voice_usage_records`.

   

5. **Session Summary**:  
     
   * User ends session → calls `/api/voice/end-session` → server returns summary (minutes, cost, performance score) → UI displays summary with download transcript option.

   

6. **Analytics & Reporting**:  
     
   * Manager views aggregated Voice AI analytics → sorts by rep, persona, scenario → reviews success metrics and retention impact → adjusts training content accordingly.

---

## 7\. Functional Requirements

See separate detailed requirements in [Functional\_Requirements.md](http://./Functional_Requirements.md). Phase 2 (Voice AI Add-On) sections are clearly labeled.

---

## 8\. Non-Functional Requirements

### 8.1 Performance & Scalability (Phase 1)

* Page load under 3s; API response under 300ms.  
* Support 100 concurrent users and scale via Supabase Edge Functions.  
* Utilize CDN (Vercel) for static assets.

### 8.2 Security & Compliance (Phase 1)

* Enforce HTTPS, RLS on all tables, OWASP best practices.  
* Data retention policy: 12 months for table data, 6 months for audit logs.  
* GDPR compliance: user data deletion endpoints.

### 8.3 Performance & Scalability (Phase 2)

* WebRTC sessions must handle 50 concurrent audio streams.  
* TURN server auto-scaling and cost monitoring.  
* Edge Functions remain \<200ms cold start.

### 8.4 Security & Compliance (Phase 2)

* DTLS/SRTP encryption for audio.  
* Encrypted storage of transcripts with signed URL access.  
* Automated purge of transcripts \>12 months; user-initiated deletion endpoints.

---

## 9\. Metrics & KPIs

### 9.1 Core Platform Metrics (Phase 1)

* Daily active users ≥ 70% of registered users.  
* SIM usage retention ≥ 50% month-over-month.  
* Average session (login) duration ≥ 5 minutes.

### 9.2 Voice AI Specific Metrics (Phase 2)

* Add-on attach rate ≥ 30% for Pro, ≥ 60% for Team.  
* Average session duration ≥ 12 minutes.  
* Monthly active Voice AI users ≥ 75% of eligible subscribers.  
* Objection handling success rate improvement ≥ 25% after 30 days.

---

## 10\. Go-to-Market & Roadmap

### 10.1 Phase 1 Launch

* Target: Core platform release to early adopters within 8 weeks.  
* Focus: Goal tracking, SIM management, billing, basic analytics.  
* Beta Group: 20 reps from 5 organizations.

### 10.2 Phase 2 Rollout (Voice AI Add-On)

* Begin immediately after Phase 1 stabilization (4–6 weeks after launch).  
* Conduct closed beta with 10 Team/Enterprise organizations.  
* Collect feedback on audio quality, latency, and cost transparency.

### 10.3 Future Enhancements (Post Phase 2)

* Marketplace for third-party coaching content.  
* AI-driven performance recommendations (predictive insights).  
* Integration with CRM systems for activity syncing.

---

For PRD feedback or roadmap proposals, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
