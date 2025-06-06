# Development Plan and Task Checklist (v3.0)

This document outlines the full roadmap and implementation tasks for the SalesPulse platform, separated into two phases:

* **Phase 1: Core Platform** — All tasks required to deliver the core feature set (goals, activities, SIM management, billing, dashboards, admin tools, messaging, feature flags, and IA/CI pipelines).  
* **Phase 2: Voice AI Add-On** — All tasks required to build and integrate the Voice AI coaching feature. (See separate Phase 2 planning document.)

---

## ✅ Phase 1: Core Platform

### Phase 1.1: Project Setup & Environment Configuration

- [ ] Set up Vercel project with domain and staging environment  
- [ ] Initialize Supabase project (DB, Auth, Edge Functions)  
- [ ] Set up GitHub repo and CI integration  
- [ ] Add secret environment variables for Supabase, Stripe, Mailgun  
- [ ] Confirm Stripe dev account with product SKUs and test plans  
- [ ] Configure Mailgun sandbox domain and test endpoint  
- [ ] Set up test deployment and seed accounts

---

### Phase 1.2: Schema, Auth, and RLS

- [ ] Build all core tables from `Database_Schema.md`  
- [ ] Apply full RLS rules per role and organization  
- [ ] Configure Supabase Auth with email/password login  
- [ ] Implement secure session tokens (HttpOnly cookie)  
- [ ] Seed initial SIMs from `data/sims/*.yaml`  
- [ ] Add feature flags table and initial values (global + per org + per user)

---

### Phase 1.3: Core User Modules

#### Goal Calculator

- [ ] UI for income input and SIM-based modeling  
- [ ] Compute daily/weekly/monthly activity goals  
- [ ] Track changes to recalculate remaining effort over time

#### Activity Tracker

- [ ] UI to log calls, appointments, deals, referrals  
- [ ] Auto-fill daily targets  
- [ ] Store and validate entries in Supabase  
- [ ] Handle retroactive edits and annotations

#### What-if Mode

- [ ] Toggle to activate sandbox view for forecasting  
- [ ] Scenario simulation engine (reuse goal engine logic)

#### Referral Impact

- [ ] UI to define multiplier effects  
- [ ] Backend logic to adjust effective deal value or quantity based on referrals

---

### Phase 1.4: KPI Dashboards

#### Individual KPI Dashboard

- [ ] Visual performance tracking per user  
- [ ] Comparison: actual vs target  
- [ ] Alerts for pacing gaps or shortfalls

#### Organization KPI Dashboard

- [ ] Access control for Team Manager, Enterprise Admin, Enterprise TM  
- [ ] Drilldown per user with trendline analysis  
- [ ] KPI table and charts with team aggregation

---

### Phase 1.5: Feature Flags & Access Control

- [ ] Implement client-side state via Zustand store  
- [ ] Resolve flags per user/org/global on login  
- [ ] Conditionally show UI features  
- [ ] Block access on backend to gated features (what-if mode, referrals, messaging)  
- [ ] Admin panel UI to toggle features by org/user  
- [ ] Audit log feature toggle actions (actor, scope, change)

---

### Phase 1.6: Platform Admin Tools

- [ ] View all users by org/role  
- [ ] Impersonate users for support (view-only)  
- [ ] Edit feature flags  
- [ ] Create or suspend organizations  
- [ ] Reassign users and roles  
- [ ] View and export audit logs  
- [ ] Manage SIM availability and status

---

### Phase 1.7: In-App Messaging

- [ ] UI modal and thread view  
- [ ] Role enforcement (same-org only, manager → user only)  
- [ ] Send, read, delete messages  
- [ ] Retain 12-month history  
- [ ] Optional alert notifications (toast, email, badge)

---

### Phase 1.8: Subscription & Billing

- [ ] Stripe pricing synced with `plans.yml`  
- [ ] Create checkout sessions for plan selection + add-ons  
- [ ] Delayed capture flow for proofs  
- [ ] Webhook handlers for invoice/payment updates  
- [ ] Plan enforcement logic on login (max users, SIMs)

---

### Phase 1.9: UI & Styling

- [ ] Apply Tailwind + UI system from `UI_Guide_and_Design_System.md`  
- [ ] Style all pages mobile-first  
- [ ] Ensure accessibility and semantic tags  
- [ ] Componentize inputs, charts, modals, flags

---

### Phase 1.10: Testing, QA, and CI/CD

- [ ] Add unit tests (80% coverage min)  
- [ ] Add E2E tests for major flows (KPI, goal update, flag toggle, messaging)  
- [ ] Linting + TypeScript checks  
- [ ] CI workflow validation (GitHub Actions)  
- [ ] Pre-deploy tests on all branches

---

### Phase 1.11: Deployment

- [ ] Connect Vercel to production domain  
- [ ] Final production Supabase DB + backups  
- [ ] Set environment variables in all platforms  
- [ ] Run final seed scripts (plans, SIMs, admin user)  
- [ ] Push to `main` and monitor deployment status

---

### Phase 1.12: Post-Launch Support

- [ ] Monitor app uptime  
- [ ] Watch logs for billing or auth errors  
- [ ] Periodically rotate secrets  
- [ ] Review usage analytics  
- [ ] Respond to user support requests via internal contact form or CRM

---

## ✅ Phase 2: Voice AI Add-On (Phase 2)

*(All Voice AI–specific tasks are grouped in a separate Phase 2 planning document. Do not begin Phase 2 until Phase 1 is complete and confirmed.)*

1. **Phase 2.1: Voice AI Data Model & RLS**  
     
   - [ ] Define `voice_personas`, `voice_scenarios`, `voice_sessions`, `voice_usage_records` tables (in `Database_Schema.md`).  
   - [ ] Add RLS policies for Voice AI tables.  
   - [ ] Seed global and organization-specific personas and scenarios.

   

2. **Phase 2.2: Voice AI Provider Integrations**  
     
   - [ ] Implement `estimate_cost_for_session()` logic.  
   - [ ] Integrate with ElevenLabs (TTS) and OpenAI (STT & GPT-4) via Edge Functions.  
   - [ ] Build provider-manager for failover between TTS/STT providers.

   

3. **Phase 2.3: Voice AI Backend & APIs**  
     
   - [ ] Create Edge Function `/api/voice/start-session`.  
   - [ ] Create Edge Function `/api/voice/stream-audio` for WebRTC orchestration.  
   - [ ] Create Edge Function `/api/voice/end-session`.  
   - [ ] Implement usage tracking, cost updates, and circuit breaker logic.

   

4. **Phase 2.4: Voice AI Billing & Stripe**  
     
   - [ ] Add Stripe SKUs for Voice AI add-ons (single SIM, 3-SIM bundle).  
   - [ ] Implement webhook handlers (`invoice.payment_succeeded`, `invoice.payment_failed`).  
   - [ ] Update billing UI to include Voice AI purchase flows.

   

5. **Phase 2.5: Voice AI Frontend UI**  
     
   - [ ] Build Voice AI Lobby: persona and scenario selection, cost preview.  
   - [ ] Develop WebRTC Chat Window with mic controls, transcription panel, cost banner.  
   - [ ] Create Session Summary screen with minutes used, cost, transcript download.

   

6. **Phase 2.6: Voice AI Testing & QA**  
     
   - [ ] Unit tests for cost estimation, provider-manager, Edge Functions (mocked providers).  
   - [ ] Integration tests with local mocks for ElevenLabs and Whisper.  
   - [ ] E2E Cypress tests covering full Voice AI flow (lobby → stream → end → summary).  
   - [ ] Performance/load tests (e.g., simulate 50 concurrent WebRTC sessions).

   

7. **Phase 2.7: Voice AI Documentation Updates**  
     
   - [ ] Update `README.md` to include Voice AI configuration and environment variables.  
   - [ ] Add Voice AI subsections in `Integrations_Specifications.md` and `System_Architecture.md`.  
   - [ ] Add Voice AI screens to `UI_Guide_and_Design_System.md`.  
   - [ ] Document RLS and data-retention policies for Voice AI in `Security Implementation.md`.

   

8. **Phase 2.8: Voice AI Beta & Launch**  
     
   - [ ] Enable feature flag `FEATURE_VOICE_AI_ENABLED` for beta users.  
   - [ ] Run closed beta with internal test organizations.  
   - [ ] Collect feedback, iterate on UI/UX and performance.  
   - [ ] Final launch: enable Voice AI Add-On for Team/Enterprise in production.

---

For technical questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com)

© 2025 SalesPulse  
