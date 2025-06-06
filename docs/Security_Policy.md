# Security Policy (v2.1)

This document outlines the overarching security policies and requirements for the SalesPulse platform. Core policies apply to Phase 1; any additional security requirements for the Voice AI Add-On are explicitly marked as **Phase 2**.

---

## 1\. Policy Overview

The SalesPulse Security Policy defines how we protect user data, ensure compliance with regulatory standards, and maintain system integrity. All employees, contractors, and third-party vendors working with SalesPulse must adhere to these policies.

**Primary Objectives:**

1. Protect confidentiality, integrity, and availability of data.  
2. Ensure compliance with applicable laws and regulations (e.g., GDPR, CCPA).  
3. Mitigate risks through preventive, detective, and corrective controls.  
4. Provide guidelines for secure development, deployment, and operations.

---

## 2\. Data Classification & Handling

### 2.1 Data Classification Levels

| Classification | Description | Examples |
| :---- | :---- | :---- |
| **Public** | Non-sensitive data intended for broad distribution. | Marketing website content, public API docs. |
| **Internal** | Data accessible by internal teams, not user-sensitive. | Internal project plans, non-production logs. |
| **Confidential** | User-specific or business-sensitive information. | User PII (email, name), subscription status. |
| **Restricted** | Highly sensitive data requiring strong protection. | Password hashes, payment data, Voice AI transcripts (Phase 2). |

### 2.2 Data Handling Requirements

* **Public Data:** No specific controls; can be stored in public or private repositories.  
    
* **Internal Data:** Access limited to employees and contractors; stored in approved internal systems.  
    
* **Confidential Data:**  
    
  * Encrypted at rest and in transit (TLS 1.2+).  
  * Access restricted by RLS and role-based controls.  
  * Logging of access events for auditing.


* **Restricted Data:**  
    
  * All Confidential controls, plus:  
      
    * Transcripts and audio files (Phase 2) stored in encrypted buckets with short-lived access tokens.  
    * Payment-related data (e.g., Stripe tokens) handled by PCI-compliant services; no raw card data stored.

---

## 3\. Access Control

### 3.1 Authentication

* **User Authentication (Phase 1):**  
    
  * Supabase Auth with email/password.  
  * Enforce multi-factor authentication (MFA) for Admin and SuperAdmin accounts.


* **Voice AI Admin Authentication (Phase 2):**  
    
  * Same as Phase 1, plus biometric or hardware key option for superuser-level Voice AI administrators if available.

### 3.2 Authorization

* **Role-Based Access Control (RBAC):**  
    
  * All actions gated by roles (`admin`, `manager`, `rep`).  
  * RLS policies enforce table-level permissions.


* **Least Privilege Principle:**  
    
  * Users and services granted only the permissions required to perform their functions.  
  * Review roles quarterly for adjustments.

### 3.3 Third-Party Access

* **Vendors & Contractors:**  
    
  * Access to production systems granted only upon completion of background checks and signing of NDA.  
  * All third-party access must use unique credentials and MFA.


* **API Integrations:**  
    
  * Use OAuth or API keys scoped to minimal necessary permissions.  
  * Rotate API keys every 90 days or immediately upon suspected compromise.

---

## 4\. Network & Infrastructure Security

### 4.1 Perimeter Defense

* **Firewalls & WAF:**  
    
  * Configure application firewalls on Vercel endpoints and Supabase Edge Functions.  
  * Enforce rate limiting on authentication and billing endpoints.


* **Network Segmentation:**  
    
  * Separate production, staging, and development environments.  
  * Restrict access between segments via IP whitelisting and secure tunnels.

### 4.2 Encryption

* **In-Transit Encryption:**  
    
  * Enforce HTTPS/TLS 1.2+ for all web traffic.  
  * WebRTC streams must use DTLS/SRTP (Phase 2).


* **At-Rest Encryption:**  
    
  * Supabase-managed encryption for Postgres and storage (AES-256).  
  * For Voice AI transcripts, use additional envelope encryption on top of Supabase storage (Phase 2).

### 4.3 Endpoint Security

* **Client-Side Controls:**  
    
  * Validate inputs to prevent injection attacks.  
  * Implement secure cookie flags (`HttpOnly`, `Secure`, `SameSite=strict`).


* **Server-Side Controls:**  
    
  * Keep Supabase Edge Functions and dependencies up to date.  
  * Apply security patches within 48 hours of release.

---

## 5\. Secure Development Lifecycle (SDLC)

### 5.1 Coding Standards

* **Secure Coding Guidelines:**  
    
  * Follow OWASP Top 10 recommendations for web applications.  
  * Use parameterized queries or ORM to prevent SQL injection.  
  * Validate and sanitize all user inputs.


* **Code Reviews:**  
    
  * All changes must be peer-reviewed.  
  * Security-specific reviews for new features, especially those handling sensitive data (Phase 2 audio flows).

### 5.2 Dependency Management

* **Vulnerability Scanning:**  
    
  * Automate `npm audit` and `yarn audit` on each CI build.  
  * Address all high and critical vulnerabilities within 72 hours.


* **Approved Libraries:**  
    
  * Maintain a whitelist of approved dependencies.  
  * Prohibit usage of deprecated or unmaintained packages.

### 5.3 Testing & Validation

* **Static Application Security Testing (SAST):**  
    
  * Integrate tools like `eslint-plugin-security` in CI.  
  * Run on every commit.


* **Dynamic Application Security Testing (DAST):**  
    
  * Perform periodic scans against staging environment.  
  * Include scanning for XSS, CSRF, and API misconfigurations.


* **Penetration Testing:**  
    
  * Conduct annual third-party penetration tests.  
  * For Phase 2, include WebRTC-specific attack scenarios (e.g., man-in-the-middle audio capture).

---

## 6\. Incident Response & Reporting

### 6.1 Incident Detection & Reporting

* **Monitoring:**  
    
  * Utilize Supabase logs, Vercel logs, and Sentry for application error tracking.  
  * Configure alerts for unusual patterns (e.g., repeated failed logins, high error rates).


* **Reporting Procedures:**  
    
  * Any team member discovering a security incident must report immediately to the Security Lead and document in Incident Tracker.  
  * For incidents involving user data, notify affected users within 72 hours per GDPR.

### 6.2 Incident Response Plan

1. **Identification:** Triage alerts, confirm if incident is genuine.  
2. **Containment:** Isolate affected systems (e.g., revoke compromised keys, disable vulnerable endpoints).  
3. **Eradication:** Remove malicious code or credentials, patch vulnerabilities.  
4. **Recovery:** Restore systems from backups, validate integrity before returning to production.  
5. **Lessons Learned:** Conduct postmortem, update policies and procedures accordingly.

---

## 7\. Security Awareness & Training

* **Employee Training:**  
    
  * All new hires must complete security onboarding (covering data handling, phishing awareness).  
  * Quarterly refresher training for secure coding and incident reporting.


* **Phishing Simulations:**  
    
  * Conduct semi-annual phishing tests and review results with employees.

---

## 8\. Compliance & Governance

### 8.1 Regulatory Compliance

* **GDPR & CCPA:**  
    
  * Provide data deletion and export capabilities for user data (Phase 1 and Phase 2).  
  * Maintain records of processing activities.


* **PCI DSS:**  
    
  * Do not store raw credit card data.  
  * Rely on Stripe for payment processing; ensure PCI-compliant integration.

### 8.2 Audit & Review

* **Internal Audits:**  
    
  * Conduct quarterly reviews of access logs, RLS policies, and encryption key management.


* **External Audits:**  
    
  * Engage third-party auditors annually for security review and compliance validation.

---

## 9\. Phase 2: Additional Voice AI Security Controls

### 9.1 Audio Data Privacy (Phase 2)

* **Audio Capture & Storage:**  
    
  * Use client-side encryption where feasible before uploading transcripts.  
  * Enforce strict access controls on S3/Supabase buckets storing audio files.


* **Ephemeral Tokens:**  
    
  * Use short-lived JWTs for WebRTC session establishment to prevent session hijacking.

### 9.2 Network Hardening (Phase 2)

* **TURN Server Security:**  
    
  * Configure TURN servers behind a private VPC; restrict access to known IP ranges.  
  * Monitor bandwidth usage and NAT traversal attempts.


* **Encryption Validation:**  
    
  * Periodically test DTLS/SRTP streams for vulnerabilities.  
  * Ensure no plaintext fallback for audio streams.

---

## 10\. Review & Maintenance

* **Policy Review:**  
    
  * Review and update this Security Policy bi-annually or when significant changes occur (new features, regulations).


* **Change Management:**  
    
  * All changes to security controls must be documented in Change Logs and approved by Security Lead.

For questions or clarifications, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).

© 2025 SalesPulse  
