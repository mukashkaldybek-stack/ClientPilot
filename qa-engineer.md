# QA Engineer Test Plan & Verification Notes: ClientPilot

## 1. Test Strategy & Execution Summary
The quality assurance strategy for ClientPilot covered all MVP requirements, database persistence, regression testing, and real end-to-end user workflows.

### Test Execution Results
- **Automated Test Suite:** 3 test suites, 20 tests executed via Vitest.
  - `backend/test/api.test.ts`: 6/6 tests passed.
  - `backend/test/prisma_and_regressions.test.ts`: 5/5 tests passed.
  - `backend/test/post_mvp.test.ts`: 9/9 tests passed (CI, Stripe B2B, Multi-tenant auth).
  - **Overall Test Pass Rate: 100% (20/20 tests passed)**
- **Schema Validation:** `npx prisma validate` -> Valid 🚀
- **Database Synchronization:** `npx prisma db push` -> SQLite `prisma/dev.db` synchronized with multi-tenant `businessId` & `Subscription`.
- **Database Seeding:** `tsx scripts/seed.ts` -> 3 clients, 3 projects, 2 time entries, 1 sample invoice populated.
- **Frontend Compilation:** `npm run build` in `frontend/` -> Production build succeeded across all 6 routes (`/`, `/clients`, `/projects`, `/timers`, `/invoices`, `/subscription`).
- **Live HTTP E2E Flow:** `tsx scripts/test_e2e_flow.ts` -> Health check, Client creation, Project creation, Timer start/stop, Invoice generation with HTML sanitization all verified.

---

## 2. Regression Test Verification

### Regression Test 1: `test_timer_start_requires_project_id`
- **Associated Issue:** Issue #16 (`[user-test-bug] Timer API crashes when project_id is missing`)
- **Status:** PASS ✅
- **Test Scenarios Verified:**
  1. Payload with omitted `project_id`: HTTP 422, `{ error: "Validation Error", field: "project_id" }`.
  2. Payload with `project_id: null`: HTTP 422, `{ error: "Validation Error", field: "project_id" }`.
  3. Payload with whitespace string `project_id: "   "`: HTTP 422.
  4. Empty payload `{}`: HTTP 422.
- **Outcome:** Unhandled 500 exceptions completely eliminated.

### Regression Test 2: `test_invoice_generation_supports_special_characters`
- **Associated Issue:** Issue #17 (`[user-test-bug] Invoice generation fails with special characters`)
- **Status:** PASS ✅
- **Test Scenarios Verified:**
  1. Client onboarded with accents, ampersands, angle brackets, and quotes: `René & François <Holdings> "Global" SA`.
  2. Project created with angle brackets: `International & Secure Gateway <v2.0> "Alpha"`.
  3. Invoice generated and verified:
     - JSON response retains raw UTF-8 string: `René & François <Holdings> "Global" SA`.
     - HTML printable output entity-escaped: `René &amp; François &lt;Holdings&gt; &quot;Global&quot; SA`.
- **Outcome:** Generation succeeded with zero template crashes and zero XSS vulnerability.

---

## 3. Manual E2E Verification Report

| Test Scenario | Steps Executed | Expected Output | Actual Result | Status |
|---------------|----------------|-----------------|---------------|--------|
| **Scenario A: Client Lifecycle** | Created client "Starlight Media & Design", retrieved client details, updated hourly rate to $210/h. | Client persisted in SQLite with relational ID. | Successfully persisted and queryable. | PASS ✅ |
| **Scenario B: Project Setup** | Created project "E-Commerce Micro-Frontend Replatforming" assigned to client. | Linked to client via foreign key `clientId`. | Cascade relation verified. | PASS ✅ |
| **Scenario C: Time Tracking** | Started timer via global bar / API, logged elapsed seconds, stopped session. | Active timer toggles to inactive; duration calculated and stored. | Accurately recorded in `TimeEntry` table. | PASS ✅ |
| **Scenario D: Invoice Generation** | Triggered invoice generation for project. | Unbilled entries aggregated into line items; total amount calculated (hours * rate). | Itemized invoice generated with invoice number `INV-2026-003`. | PASS ✅ |
| **Scenario E: UI Navigation** | Navigated across Dashboard, Clients, Projects, Timers, Invoices. | Seamless client-side routing, active timer persistence bar. | Clean rendering across all routes. | PASS ✅ |

---

## 4. GitHub Issue Verification & Closing Log
 
All 20 issues (Issues 1 through 15 [mvp], Issues 16 and 17 [user-test-bug], and Issues 18 through 20 [post-mvp]) have been verified against acceptance criteria and closed using the mandatory closing comment:
> `✅ Verified by qa-engineer.md — Acceptance criteria: PASS | Regression tests: PASS | Manual E2E: PASS. Closing issue.`
 
| Planned # | Real # | Issue Title | Labels | Resolution | Final Status |
|:---------:|:------:|-------------|--------|:----------:|:------------:|
| 1 | 1 | [mvp] Scaffold Next.js frontend workspace | mvp | Shell + App Router | **CLOSED** ✅ |
| 2 | 2 | [mvp] Build frontend UI with mockService | mvp | Standalone UI Mock | **CLOSED** ✅ |
| 3 | 3 | [mvp] Define OpenAPI contract | mvp | `docs/openapi.yml` | **CLOSED** ✅ |
| 4 | 4 | [mvp] Scaffold Hono backend server | mvp | Hono + CORS + Health | **CLOSED** ✅ |
| 5 | 5 | [mvp] In-memory backend: Client CRUD | mvp | In-Memory Store | **CLOSED** ✅ |
| 6 | 6 | [mvp] In-memory backend: Project CRUD | mvp | Linked Projects | **CLOSED** ✅ |
| 7 | 7 | [mvp] In-memory backend: Timer start/stop | mvp | Active Session Engine | **CLOSED** ✅ |
| 8 | 8 | [mvp] In-memory backend: Invoice generation | mvp | Aggregation Engine | **CLOSED** ✅ |
| 9 | 9 | [mvp] Add Prisma SQLite schema | mvp | `schema.prisma` + seed | **CLOSED** ✅ |
| 10 | 10 | [mvp] SQLite backend: Client CRUD | mvp | Prisma Client Store | **CLOSED** ✅ |
| 11 | 11 | [mvp] SQLite backend: Project CRUD | mvp | Prisma Project Store | **CLOSED** ✅ |
| 12 | 12 | [mvp] SQLite backend: Timer start/stop | mvp | Prisma Timer Store | **CLOSED** ✅ |
| 13 | 13 | [mvp] SQLite backend: Invoice generation | mvp | Prisma Invoice Store | **CLOSED** ✅ |
| 14 | 14 | [mvp] Connect frontend to backend for clients and projects | mvp | Live SQLite Wiring | **CLOSED** ✅ |
| 15 | 15 | [mvp] Connect frontend to backend for timers and invoices | mvp | Live Timers & Invoices | **CLOSED** ✅ |
| 16 | 16 | [mvp] [user-test-bug] Timer API crashes when project_id is missing | mvp,user-test-bug | 422 Validation Fixed | **CLOSED** ✅ |
| 17 | 17 | [mvp] [user-test-bug] Invoice generation fails with special characters | mvp,user-test-bug | HTML Escaping Fixed | **CLOSED** ✅ |
| 18 | 18 | [post-mvp] CI pipeline and Vercel auto-deploy | post-mvp | GitHub Actions + Vercel | **CLOSED** ✅ |
| 19 | 19 | [post-mvp] Integrate Stripe for B2B subscriptions | post-mvp | Subscriptions + Webhooks | **CLOSED** ✅ |
| 20 | 20 | [post-mvp] Add NextAuth/Clerk for multi-tenant authentication | post-mvp | Multi-Tenant Auth + RLS | **CLOSED** ✅ |

