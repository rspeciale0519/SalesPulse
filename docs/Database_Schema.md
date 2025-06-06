# Database Schema (v2.1)

This document defines all database tables for the SalesPulse application. Core tables live in Phase 1; Voice AI–specific tables are tagged as **Phase 2**.

---

## Phase 1: Core Tables

### 1\. Users

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique user identifier |
| org\_id | uuid | Foreign Key → organizations.id | Organization the user belongs to |
| role | text | Check: 'admin','manager','rep' | Role of the user within the org |
| email | text | Unique, Not Null | User login and contact email |
| password\_hash | text | Not Null | Hashed password stored securely |
| name | text |  | Full name of the user |
| created\_at | timestamptz | Default `now()` | When the account was created |
| last\_login | timestamptz |  | Timestamp of last successful login |

#### RLS Policies for Users

* `SELECT`: Only if `org_id = auth.jwt().org_id` or `role = 'admin'`  
* `INSERT`: Authenticated users can insert when creating an account  
* `UPDATE`: Users may update their own `name`, `password_hash`  
* `DELETE`: Only `admin` can delete users

---

### 2\. Organizations

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique organization identifier |
| name | text | Unique, Not Null | Organization name |
| created\_at | timestamptz | Default `now()` | Timestamp when org was created |
| is\_active | boolean | Default `true` | Soft-delete flag |

#### RLS Policies for Organizations

* `SELECT`: Only `admin` or `manager` can view  
* `INSERT`: Only `admin` can insert organizations  
* `UPDATE`: Only `admin` can update org attributes  
* `DELETE`: Only `admin` can soft-delete by setting `is_active=false`

---

### 3\. SIMs (Sales Industry Modules)

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique SIM identifier |
| name | text | Not Null | SIM name (e.g., "Real Estate", "Insurance") |
| description | text |  | Brief summary of SIM features |
| created\_at | timestamptz | Default `now()` | Date SIM was added |
| is\_active | boolean | Default `true` | SIM availability flag |

---

### 4\. User\_SIMs

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique user-SIM assignment identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | User who purchased/attached this SIM |
| sim\_id | uuid | Foreign Key → sims.id, Not Null | SIM that was purchased or attached |
| purchased\_at | timestamptz | Default `now()` | Timestamp when SIM was added to user account |
| expires\_at | timestamptz |  | If SIM is subscription-based, expiration date |
| usage\_count | integer | Default 0 | Number of times the SIM’s primary feature used |

#### RLS Policies for User\_SIMs

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` can insert when purchasing a SIM  
* `UPDATE`: Only `admin` or `manager` can adjust expiration or usage  
* `DELETE`: Only `admin` can remove a SIM from a user

---

### 5\. Goals

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique sales goal identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | Owner of the goal |
| target\_amount | numeric | Not Null | Dollar amount to achieve |
| start\_date | date | Not Null | Goal start date |
| end\_date | date | Not Null | Goal end date |
| created\_at | timestamptz | Default `now()` | When the goal was created |
| updated\_at | timestamptz | Default `now()` | Last update timestamp |

#### RLS Policies for Goals

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` can create  
* `UPDATE`: `rep` can update own goals until `end_date`, `manager` or `admin` anytime  
* `DELETE`: Only `admin` or `manager` can delete

---

### 6\. Activities

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique activity record identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | Owner of the activity |
| activity\_type | text | Check: 'call','appointment','deal','referral' | Type of sales activity |
| activity\_date | date | Not Null | Date when activity occurred |
| notes | text |  | Optional additional details |
| created\_at | timestamptz | Default `now()` | When the activity was logged |

#### RLS Policies for Activities

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` can insert  
* `UPDATE`: `rep` can update own activities within 24 hours, `manager` or `admin` anytime  
* `DELETE`: Only `admin` or `manager` can delete

---

### 7\. Referrals

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique referral record identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | User who generated the referral |
| referred\_user\_id | uuid | Foreign Key → users.id | Business contact generated by referral (optional) |
| referral\_value | numeric |  | Monetary value of referral (if tracked) |
| created\_at | timestamptz | Default `now()` | When the referral was logged |

#### RLS Policies for Referrals

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` can create  
* `UPDATE`: Only `admin` or `manager` can update referral\_value  
* `DELETE`: Only `admin` can delete

---

### 8\. What\_If\_Scenarios

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique scenario identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | User owning the scenario |
| scenario\_name | text | Not Null | Descriptive name of what-if scenario |
| scenario\_data | jsonb | Not Null | Serialized inputs for forecasting (goals, activities) |
| created\_at | timestamptz | Default `now()` | When the scenario was created |

#### RLS Policies for What\_If\_Scenarios

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` can create  
* `UPDATE`: `rep` can update own scenarios, `manager`/`admin` anytime  
* `DELETE`: Only `admin` or `manager` can delete

---

### 9\. SIM\_Templates

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique template identifier |
| sim\_id | uuid | Foreign Key → sims.id, Not Null | SIM to which this template belongs |
| template\_name | text | Not Null | Name of the scenario template |
| template\_data | jsonb | Not Null | Serialized template data (activity ratios, weights) |
| is\_default | boolean | Default `false` | Default template designation |
| created\_at | timestamptz | Default `now()` | When template was added |

#### RLS Policies for SIM\_Templates

* `SELECT`: Any authenticated user can view default templates; custom templates only if `sim_id` is active for that user  
* `INSERT`: Only `admin` or `manager` can create custom templates for org  
* `UPDATE`: Only creators or `admin` can update  
* `DELETE`: Only `admin` can remove template

---

### 10\. Messages

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique message identifier |
| thread\_id | uuid | Foreign Key → threads.id | Thread grouping identifier |
| sender\_id | uuid | Foreign Key → users.id, Not Null | Message sender |
| recipient\_id | uuid | Foreign Key → users.id, Not Null | Message recipient |
| content | text | Not Null | Message body |
| sent\_at | timestamptz | Default `now()` | When the message was sent |
| is\_read | boolean | Default `false` | Read/unread flag |

### 11\. Threads

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique thread identifier |
| org\_id | uuid | Foreign Key → organizations.id, Not Null | Organization context |
| created\_at | timestamptz | Default `now()` | Thread creation timestamp |

#### RLS Policies for Threads and Messages

* `SELECT`: Only if both sender\_id or recipient\_id \= auth.jwt().sub, or org admin/manager  
* `INSERT`: Authenticated `rep` can start a new thread with a manager or within their team  
* `UPDATE`: Only `sender_id` can mark `is_read`, `admin` can modify content  
* `DELETE`: Only `admin` can remove threads or messages

---

### 12\. Feature\_Flags

| Column | Type | Constraints | Description |  |
| :---- | :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique flag identifier |  |
| key | text | Unique, Not Null | Flag key (e.g., "voice\_ai\_enabled") |  |
| scope | text | Check: 'global','org','user' | Flag granularity level |  |
| scope\_id | uuid | Nullable | If `org` or `user`, references organizations.id or users.id |  |
| is\_enabled | boolean | Default `false` | Flag status |  |
| created\_at | timestamptz | Default `now()` | When flag was created |  |

#### RLS Policies for Feature\_Flags

* `SELECT`: Any authenticated user can view flags scoped to their org/user; global if `is_enabled=true`  
* `INSERT`: Only `admin` or `manager` can create new flags  
* `UPDATE`: Only `admin` or `manager` can toggle flags  
* `DELETE`: Only `admin` can remove flags

---

### 13\. Billing & Subscriptions

#### 13.1 Plans

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key | Unique plan identifier |
| name | text | Unique, Not Null | Plan name ("Free","Pro","Team","Enterprise") |
| price\_per\_month | numeric | Not Null | Monthly cost |
| max\_users | integer | Not Null | Maximum users allowed |
| included\_sims | integer | Not Null | Number of SIMs included |
| can\_purchase\_sims | boolean | Default `true` | Flag if plan allows additional SIM purchases |
| created\_at | timestamptz | Default `now()` | Creation timestamp |

#### 13.2 Subscriptions

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key | Unique subscription identifier |
| user\_id | uuid | Foreign Key → users.id | Owner of the subscription |
| plan\_id | uuid | Foreign Key → plans.id | Plan associated |
| stripe\_subscription\_id | text | Unique, Not Null | Stripe subscription object ID |
| status | text | Check: 'active','past\_due','canceled','unpaid' | Current billing status |
| start\_date | date | Not Null | When subscription began |
| current\_period\_end | date | Not Null | End of current billing period |
| created\_at | timestamptz | Default `now()` | Creation timestamp |

#### RLS Policies for Subscriptions

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: After checkout session succeeds (via webhook)  
* `UPDATE`: Only via Stripe webhooks or `admin`  
* `DELETE`: Only `admin` to fully cancel

---

### 14\. Usage\_Records

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique usage record identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | User consuming the resource |
| sim\_id | uuid | Foreign Key → sims.id, Not Null | SIM associated with usage |
| usage\_date | date | Not Null | Date when resource was consumed |
| usage\_amount | integer | Not Null | Number of units (e.g., SIM template uses) |
| created\_at | timestamptz | Default `now()` | When record was created |

#### RLS Policies for Usage\_Records

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Automatically inserted after each usage event  
* `UPDATE`: Only `admin` can correct erroneous entries  
* `DELETE`: Only `admin` can remove erroneous entries

---

### 15\. Audit\_Logs

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique log entry identifier |
| actor\_id | uuid | Foreign Key → users.id (Nullable) | User who performed the action (or null for system) |
| action | text | Not Null | Brief description of action performed |
| target\_type | text | Not Null | Entity type acted upon ("user","plan","sim", etc.) |
| target\_id | uuid | Nullable | ID of entity acted upon |
| timestamp | timestamptz | Default `now()` | When action occurred |

#### RLS Policies for Audit\_Logs

* `SELECT`: Only `admin` or specified `security_audit` role  
* `INSERT`: Trigger-based or system calls to record actions  
* `UPDATE`: None  
* `DELETE`: Only by `admin` for log rotation

---

## Phase 2: Voice AI–Specific Tables

### 16\. Voice\_Personas

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique persona identifier |
| org\_id | uuid | Foreign Key → organizations.id | If null, available globally |
| name | text | Not Null | Persona name ("Tough Manager","Casual Buyer" etc.) |
| description | text |  | Brief description of persona |
| created\_at | timestamptz | Default `now()` | When persona was created |

#### RLS Policies for Voice\_Personas (Phase 2\)

* `SELECT`: If `org_id = auth.jwt().org_id` or `org_id` is null (global)  
* `INSERT`: Only `manager` or `admin` within org  
* `UPDATE`: Only creator or `admin`  
* `DELETE`: Only `admin`

---

### 17\. Voice\_Scenarios

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique scenario identifier |
| persona\_id | uuid | Foreign Key → voice\_personas.id, Not Null | Persona associated with scenario |
| prompt\_text | text | Not Null | Initial prompt text for scenario |
| expected\_responses | jsonb | Not Null | JSON array of good/bad example answers |
| difficulty\_level | integer | Check: 1..5 | Difficulty rating |
| created\_at | timestamptz | Default `now()` | When scenario was created |

#### RLS Policies for Voice\_Scenarios (Phase 2\)

* `SELECT`: If user’s org matches persona’s org or scenario is global (persona.org\_id is null)  
* `INSERT`: Only `manager` or `admin` within org  
* `UPDATE`: Only creator or `admin`  
* `DELETE`: Only `admin`

---

### 18\. Voice\_Sessions

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique session identifier |
| user\_id | uuid | Foreign Key → users.id, Not Null | User who initiated session |
| persona\_id | uuid | Foreign Key → voice\_personas.id, Not Null | Persona selected |
| scenario\_id | uuid | Foreign Key → voice\_scenarios.id, Not Null | Scenario selected |
| start\_time | timestamptz | Default `now()` | When session started |
| end\_time | timestamptz |  | When session ended |
| status | text | Check: 'pending','in\_progress','completed','terminated' | Session lifecycle state |
| cost\_estimate | numeric |  | Estimated cost at session start |
| cost\_actual | numeric |  | Final cost upon session end |
| created\_at | timestamptz | Default `now()` | Record creation timestamp |

#### RLS Policies for Voice\_Sessions (Phase 2\)

* `SELECT`: Only if `user_id = auth.jwt().sub` or org admin/manager  
* `INSERT`: Authenticated `rep` with add-on active  
* `UPDATE`: Only system/end-session function or `admin`  
* `DELETE`: Only `admin`

---

### 19\. Voice\_Usage\_Records

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique usage record identifier |
| session\_id | uuid | Foreign Key → voice\_sessions.id, Not Null | Associated voice session |
| minutes\_used | integer | Not Null | Number of minutes used in this segment |
| cost\_incurred | numeric | Not Null | Cost incurred for these minutes |
| record\_timestamp | timestamptz | Default `now()` | When record was logged |

#### RLS Policies for Voice\_Usage\_Records (Phase 2\)

* `SELECT`: Only if parent session belongs to user or org admin/manager  
* `INSERT`: By system after each `stream-audio` chunk processed  
* `UPDATE`: Only `admin`  
* `DELETE`: Only `admin`

---

### 20\. Voice\_Settings

| Column | Type | Constraints | Description |
| :---- | :---- | :---- | :---- |
| id | uuid | Primary Key, Default `gen_random_uuid()` | Unique settings record identifier |
| org\_id | uuid | Foreign Key → organizations.id | Organization-specific settings (null for global) |
| price\_per\_minute | numeric | Not Null | Latest TTS/STT pricing (combined rate) |
| daily\_limit\_minutes | integer | Not Null | Max allowed minutes per user per day |
| monthly\_limit\_minutes | integer | Not Null | Max allowed minutes per user per month |
| circuit\_breaker\_threshold | numeric | Not Null | Cost threshold to auto-terminate session |
| created\_at | timestamptz | Default `now()` | When settings were configured |

#### RLS Policies for Voice\_Settings (Phase 2\)

* `SELECT`: Any authenticated user can read global; org admins read org-specific  
* `UPDATE`: Only `admin` or `manager` set thresholds/pricing  
* `DELETE`: Only `admin` (rarely used)

---

**End of Database Schema**  
For questions or updates, contact [rob@miodiollc.com](mailto:rob@miodiollc.com).   
© 2025 SalesPulse