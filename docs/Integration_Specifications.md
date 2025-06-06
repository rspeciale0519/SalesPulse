# Integration Specifications (v2.1)

This document details all third-party integrations for the SalesPulse platform. Core integrations (Phase 1\) include authentication, email, and payments. Voice AI–specific integrations are tagged for Phase 2\.

---

## Phase 1: Core Integrations

### 1\. Authentication & Authorization

* **Provider:** Supabase Auth (email/password)  
    
* **Endpoints:**  
    
  * `/auth/v1/signup`  
  * `/auth/v1/token`  
  * `/auth/v1/user`


* **Notes:**  
    
  * On successful sign-up, a JWT and refresh token are issued.  
  * Use HttpOnly cookies to store tokens on the client.  
  * Roles (`admin`, `manager`, `rep`) enforced via RLS policies.

---

### 2\. Email Sending (Mailgun)

* **Provider:** Mailgun (Transactional Email)  
    
* **Environment Variables:**  
    
  * `MAILGUN_API_KEY`  
  * `MAILGUN_DOMAIN`


* **Use Cases:**  
    
  1. **User Verification Email**  
       
     * **Trigger:** After `/auth/v1/signup`  
         
     * **Endpoint:** `POST https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`  
         
     * **Payload:**  
         
       {  
         
         "from": "notifications@yourdomain.com",  
         
         "to": \["{{user.email}}"\],  
         
         "subject": "Welcome to SalesPulse\! Verify Your Email",  
         
         "template": "verify\_email",  
         
         "h:X-Mailgun-Variables": { "verification\_link": "{{link}}" }  
         
       }

       
  2. **Password Reset Email**  
       
     * **Trigger:** On `/auth/v1/request-password-reset`  
     * **Endpoint:** Same as above  
     * **Payload:** Use `reset_password` template with `reset_link` variable.

     

  3. **Billing Notification**  
       
     * **Trigger:** On Stripe webhooks `invoice.payment_failed`, `invoice.payment_succeeded`  
     * **Templates:** `billing_success`, `billing_failure`

     

  4. **Admin Alerts**  
       
     * **Trigger:** Manual or automated (e.g., feature flag changes)  
     * **Usage:** Use Mailgun API to send to `admin@miodiollc.com`.

---

### 3\. Payments & Billing (Stripe)

* **Provider:** Stripe  
    
* **Environment Variables:**  
    
  * `STRIPE_API_KEY`  
  * `STRIPE_WEBHOOK_SECRET`


* **Products & Prices:** Defined in `data/plans.yml`  
    
  * **Plans:** Free, Pro, Team, Enterprise  
  * **SIM Add-On:** `$10/month per SIM`, `$25/month for bundle of 3 SIMs`  
  * **Voice AI Add-On:** *Phase 2 — see Phase 2 section*


* **Checkout Flow (Phase 1):**  
    
  1. **Create Checkout Session**  
       
     * **Endpoint:** `POST /api/checkout/session`  
     * **Request Body:** `{ userId, priceId, successUrl, cancelUrl }`  
     * **Response:** `{ sessionId }`

     

  2. **Webhook Handlers**  
       
     * **Endpoint:** `/api/webhooks/stripe`  
         
     * **Events:**  
         
       * `checkout.session.completed`  
           
         * **Action:** Create `subscriptions` record, activate plan

         

       * `invoice.payment_succeeded`  
           
         * **Action:** Update `subscriptions.status` to `active`

         

       * `invoice.payment_failed`  
           
         * **Action:** Set `subscriptions.status` to `past_due`, notify user via email


* **Pro-Rata & Upgrades/Downgrades:**  
    
  * Handled via Stripe’s `subscription_items.update` API  
  * Update `subscriptions.plan_id` and adjust `current_period_end` accordingly


* **Delaying Capture for Proofs:**  
    
  * **Flag:** `delay_capture = true` for orders requiring proof approval (e.g., custom artwork)  
      
  * **Workflow:**  
      
    1. Create an authorization-only PaymentIntent (`capture_method='manual'`)  
    2. On proof approval, call `stripe.paymentIntents.capture`  
    3. On cancellation, call `stripe.paymentIntents.cancel`

---

### 4\. Calendar Integration (Google Calendar)

* **Provider:** Google Calendar API  
    
* **Use Cases:** Sync sales calls and appointments  
    
* **OAuth Scopes:** `https://www.googleapis.com/auth/calendar.events`  
    
* **Endpoints:**  
    
  * `GET https://www.googleapis.com/calendar/v3/calendars/primary/events`  
  * `POST https://www.googleapis.com/calendar/v3/calendars/primary/events`


* **Implementation Notes:**  
    
  * Store OAuth tokens securely in Supabase.  
  * Refresh tokens as needed to maintain access.

---

### 5\. Webhooks & Notifications

* **Mailgun Webhook (Incoming Email):**  
    
  * **Endpoint:** `/api/webhooks/mailgun/inbound`  
  * **Use Case:** Parse replies to in-app messages, convert to message threads


* **Stripe Webhook:**  
    
  * **Endpoint:** `/api/webhooks/stripe`  
  * **Events:** As described above


* **Feature Flag Webhook (Internal):**  
    
  * **Trigger:** Feature flag toggle via Admin Console  
  * **Action:** Emit event to internal message queue (Postgres NOTIFY) for real-time updates

---

## Phase 2: Voice AI Integrations (Phase 2\)

*(Voice AI integration tasks should be implemented only after Phase 1 is complete and flagged accordingly.)*

### 6\. Real-Time Audio (WebRTC)

* **Primary STT Provider:** OpenAI Whisper (via OpenAI API or OpenRouter)  
    
* **Primary TTS Provider:** ElevenLabs  
    
* **Feature Flag:** `voice_ai_enabled` (global/org/user)  
    
* **Configuration:**  
    
  * `ELEVENLABS_API_KEY`  
  * `OPENAI_API_KEY`  
  * `TURN_SERVER_URL` and credentials for WebRTC ICE


* **Edge Functions:**  
    
  1. **`/api/voice/start-session`** — Creates `voice_sessions` record, returns session tokens and TURN server details  
  2. **`/api/voice/stream-audio`** — WebRTC signaling handler, relays audio to STT/TTS services  
  3. **`/api/voice/end-session`** — Calculates cost, updates session, writes to `voice_usage_records`


* **Cost Estimation:**  
    
  * Fetch `price_per_minute` from `voice_settings` table  
  * Compute `cost_estimate = expected_duration_minutes * price_per_minute`  
  * Enforce `circuit_breaker_threshold` to terminate sessions when exceeded


* **Provider Failover:**  
    
  * Use a health check endpoint for ElevenLabs and OpenAI  
  * If primary is down, switch to fallback (e.g., FallbackProvider via OpenRouter)

### 7\. Voice AI Billing (Stripe)

* **Environment Variables:**  
    
  * `VOICE_ADDON_SINGLE_SIM_PRICE_ID`  
  * `VOICE_ADDON_BUNDLE_3_PRICE_ID`


* **Checkout Flow for Voice AI Add-On:**  
    
  1. **Checkout Session**: `POST /api/checkout/voice-addon` with `{ userId, priceId }`  
  2. **On Success**: Attach line item to user’s subscription, mark `user_voice_addons.voice_addon_active` as `true`  
  3. **Webhooks**: Handle `invoice.payment_succeeded`/`invoice.payment_failed` to enable/disable feature flag

### 8\. Analytics & Logging

* **Provider:** Google Analytics (for UI events)  
* **Voice Session Logging:** Insert usage records into `voice_usage_records`  
* **Error Tracking:** Sentry (optional) for capturing runtime exceptions in Edge Functions and frontend

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
