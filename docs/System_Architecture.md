# System Architecture (v2.1)

This document describes the high-level architecture and infrastructure for the SalesPulse platform. Core components are detailed for Phase 1\. Sections related to Voice AI are tagged as **Phase 2** and should be implemented only after Phase 1 completion.

---

## 1\. Overview

SalesPulse is a multi-tenant SaaS application built using a modern JAMstack approach:

* **Frontend:** Next.js with React, Tailwind CSS, TypeScript  
* **Backend & Database:** Supabase (PostgreSQL, Auth, RLS, Edge Functions)  
* **Edge/API Layer:** Supabase Edge Functions (Node.js) for custom business logic (e.g., billing webhooks, STT/TTS orchestration in Phase 2\)  
* **Storage:** Supabase Storage (file uploads, transcripts)  
* **Third-Party Services:** Stripe (billing), Mailgun (email) - Core services only for MVP\)

Traffic flow:

1. User interacts with Next.js frontend (deployed on Vercel).  
2. Frontend queries Supabase via client libraries for data operations (RLS enforced).  
3. For specialized tasks (e.g., payment intent capture, sending emails, STT/TTS calls), frontend calls Supabase Edge Functions via REST endpoints.  
4. Background tasks (e.g., analytics aggregation, email sending, voice usage logging) run via scheduled Edge Functions or Postgres triggers.

---

## 2\. Infrastructure Diagram

\+----------------------+         \+----------------------+         \+----------------------+

|   User Browser       | \<-----\> |     Vercel CDN       | \<-----\> |   Next.js Frontend   |

\+----------------------+         \+----------------------+         \+----------------------+

                                      |             ^                    |        |

                                      v             |                    |        v

                             \+----------------------+--------------------+   \+--------------+

                             |               Supabase Endpoint           |   | Third-Party  |

                             |  \- Auth (JWT, RLS)                         |   |  Services:   |

                             |  \- Postgres (Core & Phase 2 tables)       |   |  \- Stripe    |

                             |  \- Edge Functions (billing, webhooks,      |   |  \- Mailgun   |

                             |     Phase 2 STT/TTS orchestrator)          |   |  \- Google    |

                             \+---------------------------------------------+   |    Calendar   |

                                                                                \+--------------+

---

## 3\. Core Components (Phase 1\)

### 3.1 Frontend (Next.js)

* **Routing & Pages:**  
    
  * `/`: Landing and marketing pages (public)  
  * `/app`: Main application shell (authenticated)  
  * `/app/goals`, `/app/activities`, `/app/dashboard`, `/app/sims`, `/app/billing`


* **State Management:** Zustand for global state (user session, feature flags, SIM usage)  
    
* **UI Components:** Tailwind CSS utility classes; design tokens defined in `tailwind.config.js` (colors, spacing, typography)  
    
* **API Client:** Supabase JS client for CRUD operations; custom `fetch` wrappers for Edge Function calls  
    
* **Feature Flags:** Retrieved on login and stored in Zustand; used to conditionally render UI

#### 3.1.1 Authentication Flow

1. User signs in via NextAuth or Supabase Auth UI.  
2. Frontend stores JWT in HttpOnly cookie.  
3. Middleware (`middleware.ts`) enforces redirect to `/login` if no valid JWT.  
4. After login, feature flags and user metadata fetched and stored client-side.

### 3.2 Backend & Database (Supabase)

#### 3.2.1 PostgreSQL Database

* **Core Tables (Phase 1):** Defined in [Database\_Schema.md](http://./Database_Schema.md)  
    
  1. `users`, `organizations`, `sims`, `user_sims`  
  2. `goals`, `activities`, `referrals`, `what_if_scenarios`  
  3. `sim_templates`, `messages`, `threads`, `feature_flags`  
  4. `plans`, `subscriptions`, `usage_records`, `audit_logs`


* **RLS Policies:**  
    
  * Auth JWT claims (`sub`, `org_id`, `role`) used to filter data.  
  * Policies defined per table to enforce least-privilege access (see [Security Implementation.md](http://./Security_Implementation.md)).


* **Triggers & Functions:**  
    
  * Automatically insert into `usage_records` upon certain operations (e.g., SIM usage).  
  * Audit triggers record changes to critical tables in `audit_logs`.

#### 3.2.2 Edge Functions

* **Billing Webhook Handler:**  
    
  * Path: `/api/webhooks/stripe`  
  * Verifies signature, updates `subscriptions` table, toggles feature flags as needed.


* **Email Webhook Handler:**  
    
  * Path: `/api/webhooks/mailgun/inbound`  
  * Parses incoming emails, maps replies to `messages` and `threads`.


* **Utility Functions:**  
    
  * `sendEmail(to, template, variables)` — abstraction over Mailgun API.  
  * `createStripeCheckoutSession(userId, priceId)` — wrapper for Stripe checkout.

---

## 4\. Phase 2: Voice AI Components

**All Voice AI–related components should be implemented after Phase 1\.**

### 4.1 Additional Database Tables

Refer to [Database\_Schema.md](http://./Database_Schema.md) for Phase 2 tables:

* `voice_personas`, `voice_scenarios`, `voice_sessions`, `voice_usage_records`, `voice_settings`.  
* RLS policies restrict access to sessions and settings per user or org.

### 4.2 Real-Time Audio Pipeline

* **WebRTC Signaling:** Handled by an Edge Function `/api/voice/stream-audio`.  
    
  1. Client obtains ICE server info via `/api/voice/start-session`.  
  2. WebRTC handshake established between client and Supabase Edge Function.  
  3. Audio chunks streamed to STT (OpenAI Whisper) and back to TTS (ElevenLabs) via provider manager.


* **Provider Manager Service:**  
    
  * Maintains health checks for ElevenLabs and OpenAI.  
  * Dynamically selects active STT/TTS provider.  
  * Exposes functions `getTTSProvider()`, `getSTTProvider()`.


* **Edge Functions:**  
    
  * `/api/voice/start-session`: Inserts `voice_sessions`, returns TURN credentials.  
  * `/api/voice/stream-audio`: Manages WebRTC signaling, calls STT/TTS.  
  * `/api/voice/end-session`: Calculates actual usage, updates `voice_usage_records` and session cost.

### 4.3 Scaling & TURN Servers

* **TURN Server:**  
    
  * Use a managed TURN provider (e.g., Xirsys) or self-hosted coturn.  
  * Configure in `voice_settings` table: `TURN_SERVER_URL`, `TURN_USERNAME`, `TURN_PASSWORD`.  
  * Track TURN usage metrics to gauge bandwidth costs.


* **Load Balancing:**  
    
  * Vercel scales frontend automatically.  
  * Supabase Edge Functions scale based on concurrency; monitor cold start times.

### 4.4 Monitoring & Logging

* **Prometheus/Grafana (Optional):**  
    
  * Export Supabase function metrics via Prometheus exporter.  
  * Track WebRTC connection success rate, STT/TTS latency, error rates.


* **Error Tracking:**  
    
  * Integrate Sentry in Edge Functions and frontend (DSN in env).


* **Cost Monitoring:**  
    
  * In `voice_settings`, maintain historical logs of `price_per_minute`.  
  * Edge Function pushes cost usage to `voice_usage_records` in real time.

### 4.5 Security & Compliance

* **Data Encryption:**  
    
  * Audio transcripts stored in Supabase Storage with server-side encryption.  
  * Access controlled via signed URLs with short TTL.


* **GDPR/Data Retention:**  
    
  * Implement a scheduled Edge Function to purge audio/transcripts older than 12 months.  
  * Respect user deletion requests by removing all related `voice_sessions` and recordings.


* **RLS Policies (Phase 2):**  
    
  * Only session owners and org admins can read session data.  
  * `voice_settings` read by all; update only by admins.

### 4.6 Third-Party Services (Phase 2)

* **ElevenLabs (TTS):** API key in `ELEVENLABS_API_KEY`; use REST endpoint for streaming audio.  
* **OpenAI (STT & GPT-4):** API key in `OPENAI_API_KEY`; stream transcriptions via WebSocket if supported, else chunked HTTP.  
* **OpenRouter (Fallback):** Use OpenRouter TTS/STT endpoints if primary providers are down.

---

## 5\. CI/CD and Deployment

### 5.1 Git Branching Strategy

* **`main`**: Production-ready Phase 1 code.  
* **`phase-2-voice-ai`**: Branch off after Phase 1 complete; contains all Voice AI changes.  
* **Feature branches**: Named `feature/<description>`; PRs target `main` (Phase 1\) or `phase-2-voice-ai` (Phase 2).

### 5.2 GitHub Actions Workflow

* **`ci.yml`** (runs on PR to `main`):  
    
  * Install dependencies  
  * Lint & TypeScript checks  
  * Unit tests (80%+ coverage)  
  * Cypress E2E tests for core flows  
  * Build and deploy to Vercel Preview


* **`ci-phase2.yml`** (runs on PR to `phase-2-voice-ai`):  
    
  * All steps from `ci.yml` \+  
  * Voice AI unit tests (mocked providers)  
  * Voice AI E2E tests (Cypress with prerecorded audio fixtures)

### 5.3 Environment Configuration

* **Phase 1 Environments:**  
    
  * `.env.local` for local development  
  * `staging` environment on Vercel (linked to `develop` branch)  
  * `production` environment on Vercel (linked to `main` branch)


* **Phase 2 Environments:**  
    
  * Use `.env.local` with `FEATURE_VOICE_AI_ENABLED=true`  
  * `staging-voice` on Vercel (linked to `phase-2-voice-ai`)  
  * When ready, merge to `main` and push to production with feature flag off until launch.

---

## 6\. Summary

Phase 1 focuses on delivering a robust core platform with multi-tenant support, billing, core features, and admin tools. Phase 2 extends the architecture to include real-time Voice AI coaching with STT, TTS, cost control, and analytics. Each phase is isolated via feature flags, branching strategy, and clear documentation references.

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
