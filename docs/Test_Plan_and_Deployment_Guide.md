# Test Plan and Deployment Guide (v2.1)

This document outlines the testing strategy, test cases, and deployment procedures for the SalesPulse platform. Core testing and deployment steps cover Phase 1; Voice AI–specific tests are tagged as **Phase 2**.

---

## 1\. Testing Strategy Overview

### 1.1 Objectives

* Validate core platform functionality (Phase 1) end-to-end.  
* Ensure quality, reliability, and performance before production release.  
* Verify Voice AI Add-On features separately in Phase 2 to avoid blocking Phase 1.

### 1.2 Testing Types

| Test Type | Phase 1 (Core) | Phase 2 (Voice AI Add-On) |
| :---- | :---- | :---- |
| **Unit Tests** | Business logic, database functions, API handlers | Cost estimation, provider-manager, Edge Functions (mocked) |
| **Integration Tests** | Supabase interactions, Stripe/Mailgun webhooks | WebRTC signaling with mocked STT/TTS providers |
| **End-to-End (E2E) Tests** | User signup, goal flow, activity logging, SIM purchase, dashboards | Voice lobby → WebRTC flow (with prerecorded audio fixtures) → session summary |
| **Performance Tests** | API response latency, DB query performance | Simulate 50 concurrent WebRTC sessions (TURN server load) |
| **Security Tests** | RLS enforcement, input validation, auth flows | Secure audio stream, transcript encryption, circuit breaker logic |
| **Regression Tests** | All critical flows from Phase 1 remain intact | Ensure Voice AI addition does not break core functionality |

---

## 2\. Phase 1 Test Cases (Core Platform)

### 2.1 Unit Tests

#### 2.1.1 Goal Calculation Logic

* **Test:** Given input target $100,000/year and SIM conversion rates, verify daily call/deal counts.  
* **Test:** Adjust conversion rates in Pro mode; confirm recalculated targets.

#### 2.1.2 Activity CRUD Functions

* **Test:** Insert `activity` record; validate RLS restrictions (rep can only insert own ID).  
* **Test:** Update `activity` within 24 hours; reject updates after 24 hours.  
* **Test:** Delete `activity` only allowed by manager/admin.

#### 2.1.3 SIM Purchase & Usage

* **Test:** `purchaseSIM(userId, simId)` creates `user_sims` record and deducts quota.  
* **Test:** Prevent purchase if plan does not allow additional SIMs.

#### 2.1.4 Billing Webhooks

* **Test:** Stripe `invoice.payment_succeeded` updates subscription status to `active`.  
* **Test:** Stripe `invoice.payment_failed` updates status to `past_due` and triggers email.

#### 2.1.5 Feature Flag Enforcement

* **Test:** User with disabled flag cannot access gated endpoint (e.g., what-if).  
* **Test:** Toggling flag via API updates database and invalidates cached client flags.

#### 2.1.6 RLS Policy Verification

* **Test:** Rep cannot query other user’s data; manager can query org data; admin can query all.  
* **Test:** Orphaned records are not visible due to RLS filtering.

### 2.2 Integration Tests

#### 2.2.1 Supabase Client Integration

* **Test:** Create user via Supabase Auth; verify JWT contains correct claims.  
* **Test:** Insert and select from core tables respecting RLS rules.

#### 2.2.2 API Route Handlers

* **Test:** `/api/goals` endpoints: create, read, update, delete (with RLS).  
* **Test:** `/api/activities` endpoints: correct validation and insertion.

#### 2.2.3 Stripe & Mailgun Integration

* **Test:** Simulate Stripe checkout flow in test mode; verify webhook updates DB.  
* **Test:** Simulate Mailgun sending of verification and billing emails; verify webhook processes inbound email.

### 2.3 End-to-End (E2E) Tests

#### 2.3.1 User Onboarding Flow

* **Test:** Sign up → Receive verification email → Confirm email → Log in → Redirect to `/app/dashboard`.

#### 2.3.2 Goal & Activity Workflow

1. **Create Goal:** Input target, select SIM → Verify goal saved and displayed.  
2. **Log Activity:** Log 10 calls → Dashboard reflects call count and pacing.

#### 2.3.3 SIM Management Flow

* **Test:** Purchase SIM → Verify `user_sims` entry created → UI updates usage count.  
* **Test:** Manager assigns SIM to rep → Rep sees new SIM available.

#### 2.3.4 Billing & Plan Change

* **Test:** Upgrade from Free to Pro via UI → Stripe checkout → Verify upgrade reflected in quotas.  
* **Test:** Downgrade from Pro to Free with proration; verify overages prevented.

#### 2.3.5 Messaging Flow

* **Test:** Rep sends message to manager → Manager reads in UI → Manager replies → Email notification sent to rep.

### 2.4 Performance Tests

* **Test:** Simulate 100 concurrent API requests to `/api/activities`; verify average response time \< 300 ms.  
* **Test:** Database query on `activities` table with 100k rows returns \< 200 ms.

### 2.5 Security Tests

* **Test:** Attempt SQL injection on `/api/goals`; ensure input sanitization prevents attacks.  
* **Test:** Attempt unauthorized RLS bypass by forging JWT; verify access denied.  
* **Test:** Verify password reset link expires after 24 hours.

---

## 3\. Phase 2 Test Cases (Voice AI Add-On)

### 3.1 Unit Tests

#### 3.1.1 Cost Estimation Logic

* **Test:** Given `expected_duration = 10` min, `price_per_minute = \$0.10`, result `cost_estimate = \$1.00`.  
* **Test:** Simulate price change mid-session; recalculate and notify user.

#### 3.1.2 Provider Manager Failover

* **Test:** Mock ElevenLabs health check as down → `getTTSProvider()` returns fallback.  
* **Test:** Mock OpenAI health check as down → `getSTTProvider()` triggers alert and uses fallback.

#### 3.1.3 RLS Policies for Voice Tables

* **Test:** Rep can only query own `voice_sessions`; manager can query org sessions.  
* **Test:** Only admin can update `voice_settings`.

### 3.2 Integration Tests

#### 3.2.1 Edge Functions with Mocked Providers

* **Test:** `/api/voice/start-session` inserts a `voice_sessions` record with correct `cost_estimate`.  
* **Test:** `/api/voice/stream-audio` receives mocked audio blob; returns mocked TTS audio.  
* **Test:** `/api/voice/end-session` updates `voice_sessions` with `cost_actual` and creates `voice_usage_records`.

### 3.3 End-to-End (E2E) Tests

#### 3.3.1 Voice Lobby to Session Flow

1. **Navigate to `/voice-ai`** (feature flag on) → UI displays persona and scenario options.  
2. **Select Persona & Scenario** → Click `Start Session` → Mock WebRTC handshake with prerecorded audio.  
3. **Receive Transcript** → Mock GPT-4 response → Mock TTS playback.  
4. **End Session** → Verify summary UI with minutes used and cost.

#### 3.3.2 Cost Circuit Breaker

* **Test:** Simulate prolonged session → cost exceeds threshold → session auto-terminates → UI alert displayed.

#### 3.3.3 Usage Analytics Verification

* **Test:** Complete multiple sessions → Dashboard reflects aggregated `voice_usage_records` accurately.

### 3.4 Performance Tests

* **Test:** Simulate 50 concurrent WebRTC sessions streaming 30 seconds of audio.  
* **Test:** Verify TURN server handles bandwidth without significant latency (\>200 ms audio round-trip).

### 3.5 Security Tests

* **Test:** Attempt replay attack with recorded audio; verify session rejects nonces.  
* **Test:** Ensure transcripts are only accessible via signed URL with TTL \< 5 min.  
* **Test:** Validate circuit breaker cannot be disabled by rep.

---

## 4\. Deployment Guide

### 4.1 Environment Setup

* **Phase 1 Environments:**  
    
  * **Local Development:** Clone repo, run `yarn install`, set environment variables in `.env.local`.  
  * **Staging:** Connect Vercel to `develop` branch; configure Supabase staging DB and environment variables.  
  * **Production:** Vercel `main` branch; configure Supabase production DB.


* **Environment Variables:**  
    
  * `NEXT_PUBLIC_SUPABASE_URL`  
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
  * `SUPABASE_SERVICE_ROLE_KEY`  
  * `STRIPE_SECRET_KEY`  
  * `STRIPE_WEBHOOK_SECRET`  
  * `MAILGUN_API_KEY`  
  * `MAILGUN_DOMAIN`  
  * `FEATURE_VOICE_AI_ENABLED` (set to `false` in Phase 1 production)

### 4.2 CI/CD Workflow

* **GitHub Actions (`ci.yml`):**  
    
  1. **Trigger:** On PR to `main` or merge to `main`.  
       
  2. **Steps:**  
       
     * Checkout code  
     * Install dependencies (`yarn install`)  
     * Run lint and type checks (`yarn lint`, `yarn tsc`)  
     * Run unit tests (`yarn test:unit`)  
     * Run E2E tests (`yarn test:e2e`)  
     * Build Next.js app (`yarn build`)  
     * Deploy to Vercel (automatically via GitHub integration).


* **Phase 2 CI (`ci-phase2.yml`):** Add Voice AI unit and E2E tests (mocked providers) to the above steps for PRs targeting `phase-2-voice-ai` branch.

### 4.3 Database Migrations & Seeding

* **Phase 1 Migration:**  
    
  1. Run Supabase `db push` or apply SQL migrations from `migrations/` folder.  
  2. Seed reference data: `plans`, `SIMs`, `feature_flags` (default values).


* **Phase 2 Migration:**  
    
  1. Apply additional migrations for Voice AI tables (`voice_personas`, `voice_sessions`, etc.).  
  2. Seed `voice_personas` and `voice_scenarios` with global defaults.

### 4.4 Post-Deployment Validation

* **Smoke Tests:** Verify key pages load (`/app/dashboard`, `/app/sims`, `/login`) and basic API endpoints respond.  
* **Health Check:** Confirm Supabase and core third-party services (Stripe, Mailgun) are reachable.  
* **Feature Flag Check:** Ensure `FEATURE_VOICE_AI_ENABLED` is `false` in production until Phase 2 launch.

### 4.5 Rollback Procedures

* **Code Rollback:** Use Vercel’s rollback to a previous deployment if critical errors occur.  
* **Database Rollback:** Restore from Supabase daily snapshot if data corruption; apply manual fixes as necessary.  
* **Environment Variables:** Revert any accidental variable changes promptly.

### 4.6 Monitoring & Alerts

* **Logs:** View Supabase logs and Vercel deployment logs for errors.  
* **Alerts:** Configure alerts for failed builds, high error rates, or critical Sentry issues.  
* **Uptime Monitoring:** Use UptimeRobot or similar to ping `/health` endpoint every 5 minutes.

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
