# Security Implementation (v2.1)

This document outlines security controls, encryption, RLS policies, and compliance guidelines for the SalesPulse platform. Core security measures are defined for Phase 1\. Voice AI–specific security requirements are tagged as **Phase 2**.

---

## 1\. Authentication & Authorization

### 1.1 Supabase Auth

* **Provider:** Supabase Auth (email/password)  
    
* **Password Storage:** Bcrypt hashing with salt (default Supabase settings).  
    
* **JWT Configuration:**  
    
  * Tokens include `sub` (user id), `org_id`, `role` claims.  
  * Access token TTL: 1 hour; Refresh token mechanism via Supabase.


* **Role Enforcement:**  
    
  * `role` claim used in RLS policies to control table-level access.  
  * Roles: `admin`, `manager`, `rep`.

### 1.2 RLS Policies

* All tables enforce RLS; no unrestricted public access.  
    
* Example policy for `activities` table:  
    
  CREATE POLICY "Select own activities" ON public.activities  
    
    FOR SELECT USING (auth.jwt().sub \= user\_id OR auth.jwt().role IN ('admin','manager'));  
    
  CREATE POLICY "Insert own activities" ON public.activities  
    
    FOR INSERT WITH CHECK (auth.jwt().sub \= user\_id);  
    
  CREATE POLICY "Update own activities within 24h" ON public.activities  
    
    FOR UPDATE USING ((auth.jwt().sub \= user\_id) AND (NOW() \- created\_at) \< INTERVAL '24 hours');  
    
* All core tables have similar policies: restrict by `auth.jwt().org_id`, `sub`, and `role`.

---

## 2\. Data Encryption & Secrets Management

### 2.1 In-Transit Encryption

* **TLS:** All HTTP traffic encrypted via HTTPS (mandatory on Vercel and Supabase).  
* **WebSockets (WebRTC):** DTLS/SRTP encryption by default.

### 2.2 At-Rest Encryption

* **Supabase Storage:** AES-256 server-side encryption for all stored files, including uploaded images and audio transcripts.  
* **Database Encryption:** PostgreSQL Transparent Data Encryption (TDE) if supported by Supabase; otherwise, rely on Supabase-managed encryption at rest.

### 2.3 Secrets Management

* Store all API keys (Stripe, Mailgun, ElevenLabs, OpenAI) in environment variables (Vercel / Supabase Dashboard).  
* Rotate keys every 90 days.  
* Limit access to secrets only to CI systems and production environments.

---

## 3\. Network & Infrastructure Security

### 3.1 Vercel & Supabase Configuration

* **Allowed Origins:** Restrict Supabase `auth` and `cors` settings to only Vercel domains and localhost for dev.  
* **IP Whitelisting:** For Supabase Admin panel, only allow trusted office IP ranges.

### 3.2 Firewall & WAF

* **Vercel WAF:** Enable rate limiting on critical endpoints (sign-in, webhooks) to mitigate brute-force and DDoS.  
* **Supabase Edge Functions:** Configure function timeouts and CPU limits to prevent resource exhaustion.

---

## 4\. Secure Development Practices

### 4.1 Dependency Management

* Regularly run `npm audit` and `yarn audit`; address high/critical vulnerabilities within 7 days.  
* Use Dependabot or Renovate to automate dependency updates.

### 4.2 Code Reviews & CI/CD

* All PRs require at least one code review and successful passing of lint, type checks, and unit tests.  
* Security linting (ESLint plugin: `eslint-plugin-security`) enabled on CI.

### 4.3 Penetration Testing

* Perform quarterly penetration tests focusing on injection, XSS, CSRF, and authentication flows.  
* Engage a third-party security firm for annual audit.

---

## 5\. Compliance & Data Protection

### 5.1 GDPR & Data Retention

* **User Data Deletion:** When a user requests deletion, remove `users`, `activities`, `goals`, and anonymize PII with cascading deletes or nullification.  
    
* **Voice Transcripts (Phase 2):** Provide endpoint to delete all voice transcripts and sessions upon user request.  
    
* **Data Retention:** Default retention policy is 12 months. Automated Edge Function runs nightly to purge data older than 12 months from:  
    
  * `voice_sessions`, `voice_usage_records` (Phase 2\)  
  * `audit_logs` (retain for 12 months, then archive)  
  * `messages` and `threads` older than 12 months (optional purge flag for orgs).

### 5.2 Logging & Monitoring

* **Audit Logs:** Write all critical actions (user creation, role changes, billing updates) to `audit_logs` table.  
* **Log Aggregation:** Stream Supabase logs to Papertrail or Logflare for centralized monitoring.  
* **Anomaly Detection:** Setup alerts for abnormal login patterns or spike in errors.

---

## 6\. Phase 2: Voice AI Security Considerations

### 6.1 Audio Data Protection (Phase 2\)

* **Storage:** Store audio recordings and transcripts in Supabase Storage with ACL set to private.  
* **Access Control:** Signed URLs expire after 5 minutes. Only user and org admin can generate signed URLs for transcripts.  
* **Encryption:** Transcripts in `voice_usage_records` stored as encrypted `TEXT` or using PostgreSQL’s `pgcrypto` functions.

### 6.2 Edge Function Sanitization

* Validate all incoming STT/TTS payloads to prevent injection via audio metadata.  
* Rate limit `/api/voice/stream-audio` to 5 requests per minute per user to prevent abuse.

### 6.3 Circuit Breaker Logic Security

* **Thresholds:** Stored in `voice_settings`; default safe thresholds set by sysadmin.  
* **Tampering Protection:** RLS on `voice_settings` prohibits `rep` from reducing thresholds.

---

## 7\. Incident Response

* **Breach Notification:** In case of a data breach, notify affected users within 72 hours as per GDPR.  
* **Rollback Plan:** Maintain database backups via Supabase daily snapshots; test restore quarterly.  
* **Root Cause Analysis:** Document incidents in `postmortems/` folder and assign corrective actions.

---

For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
