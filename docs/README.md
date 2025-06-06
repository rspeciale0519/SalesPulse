# SalesPulse Platform — README (v2.1)

Welcome to the SalesPulse codebase. This document serves as the definitive guide for understanding, installing, developing, and deploying the SalesPulse application.

---

## Overview

SalesPulse is a user-focused SaaS platform designed for life insurance sales representatives and their managers. It empowers users to:

* Set personalized income goals  
* Track performance through daily activity inputs  
* Visualize goal progress  
* Activate "what-if" simulations  
* Manage SIM-based sales models  
* Collaborate with teams through shared KPIs and messaging

The app supports role-based access, real-time updates, and organization-level configuration via integrated APIs (Stripe, Mailgun). Voice AI–related features are slated for Phase 2 implementation.

---

## Features (Phase 1)

### For All Users

* Goal calculator with income-to-activity breakdown  
* Real-time activity tracking with daily target logic  
* SIM (Sales Industry Module) based funnel modeling  
* Visual performance dashboard

### For Pro+ Users (Pro, Team, Enterprise)

* Referral modeling and impact tracking  
* What-if mode for forecasting scenarios  
* SIM tuning capabilities  
* Calendar integration (Google Calendar)

### For Team Managers / Enterprise Admins

* Organization-wide KPI dashboards  
* Drilldown analytics per user  
* In-app messaging to team members  
* Organization-level feature toggle panel

### For Platform Admins / SuperAdmins

* Global/Org/User-level feature flag control  
* Full org/user management  
* SIM provisioning and enforcement  
* Audit logging and impersonation tools

---

## Voice AI (Phase 2)

Voice AI capabilities, including real-time coaching sessions, customer persona selection, and Voice AI analytics, are planned for Phase 2. During Phase 1, Voice AI features appear in documentation and UI as "Coming Soon (Phase 2)".

---

## Technologies Used

### Frontend

* Next.js (React-based framework)  
* Tailwind CSS (utility-first styling)  
* Zustand (state management)  
* TypeScript

### Backend

* Supabase (PostgreSQL, Auth, RLS, Edge Functions)  
* Node.js with custom Edge API handlers (when needed)  
* Stripe for billing (authorization \+ delayed capture)  
* Mailgun for transactional email

### DevOps & CI

* GitHub Actions for CI/CD  
* Vercel for frontend deployment  
* Supabase-hosted DB & functions

---

## File Structure

| Directory/File | Description |
| :---- | :---- |
| `/components` | Shared UI components (Tailwind \+ Headless UI) |
| `/pages` | Next.js routing and screens |
| `/lib` | Helpers for API, auth, validation |
| `/hooks` | Reusable state and effect logic (e.g., useKPIData) |
| `/store` | Zustand stores for session, goals, features |
| `/api` | Edge functions and route handlers |
| `/public` | Static assets (logos, icons) |
| `/data/sims/` | YAML-defined SIMs |
| `/data/plans.yml` | Pricing and feature tiers |
| `/types` | TypeScript interfaces and role maps |
| `/middleware.ts` | RLS and feature flag enforcement |
| `README.md` | This file |

---

## Pricing Model (Phase 1)

| Tier | Price | Users Included | SIMs Included | Additional SIMs | Additional Users | Core Features | Pro Features | Team Features |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| Free | $0/mo | 1 | 0 | N/A | N/A | Goal Calculator, Activity Logging | ❌ | ❌ |
| Pro | $25/mo | 1 | 1 | $10/mo each | N/A | All Free | Referral Modeling, What-if Mode, SIM Tuning, Calendar Integration | ❌ |
| Team | $100/mo | 5 | 1 | $10/mo each | $20/mo per user | All Free \+ Pro | All Pro | Organization KPI Dashboard, In-App Messaging, Feature Toggles |
| Enterprise | $300/mo | 15 | 3 | $10/mo each | $20/mo per user | All Free \+ Pro \+ Team | All Pro \+ Team | Admin Console, Audit Logs, Impersonation Tools |

* SIM Bundles: 3 SIMs for $25/mo (discounted)  
* Team Plans: Up to 5 additional users at $20/mo each  
* Enterprise Plans: Unlimited additional users at $20/mo each

---

## Getting Started

### 1\. Clone the Repository

git clone https://github.com/YOUR\_ORG/salespulse.git

### 2\. Install Dependencies

cd salespulse

yarn install

### 3\. Environment Configuration

Create a `.env.local` with the following:

NEXT\_PUBLIC\_SUPABASE\_URL=...

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=...

SUPABASE\_SERVICE\_ROLE\_KEY=...

STRIPE\_SECRET\_KEY=...

MAILGUN\_API\_KEY=...

MAILGUN\_DOMAIN=...

### 4\. Dev Server

yarn dev

Visit `http://localhost:3000` to see the application.

---

## WindSurf AI Usage

To use WindSurf AI as a solo developer:

* Import the PRD and Functional Requirements to seed your development workspace  
* Use the schema defined in `Database_Schema.md` to scaffold models  
* Reference `Feature_Matrix_Reference.md` to guide conditional UI and access logic  
* Follow `UI_Guide_and_Design_System.md` for Tailwind-compatible UI consistency  
* See `Development_TODO.md` for a complete task list

---

## Testing & Deployment

* CI configured via `.github/workflows/ci.yaml`  
* Unit tests required for all business logic (Jest)  
* End-to-end tests defined using Cypress (see `/tests/e2e`)  
* Deployment targets Vercel with preview branches auto-built

---

## License

This repository is licensed for private internal use only. Redistribution or resale is prohibited.

---

For platform support or access requests, contact [rob@miodiollc.com](mailto:rob@miodiollc.com)

© 2025 SalesPulse  
