# QA Engineer Test Plan & Verification Notes: ClientPilot

## 1. Test Strategy Overview
The quality assurance strategy for ClientPilot covers:
1. **API Integration & HTTP Tests:** Automated tests executing against real running HTTP endpoints using Vitest / native fetch.
2. **Schema & ORM Validation:** `npx prisma validate` ensuring SQLite data model consistency.
3. **Regression Test Suite:** Explicit regression guards for user-reported bug fixes (Issues #16 & #17).
4. **End-to-End (E2E) Flow:** Systematic manual verification of full workflow from Client Creation -> Project Setup -> Timer Run -> Invoice Generation.

---

## 2. Regression Test Specifications

### Regression Test 1: `test_timer_start_requires_project_id`
- **Target Issue:** Issue #16 (`[user-test-bug] Timer API crashes when project_id is missing`)
- **Objective:** Verify that `POST /api/timers/start` responds with status `422 Unprocessable Entity` when `project_id` is omitted, `null`, or empty string.
- **Payload Tested:** `{ "project_id": null }` and `{}`
- **Expected Status:** `422`
- **Expected Error Structure:** `{ "error": "Validation Error", "field": "project_id" }`

### Regression Test 2: `test_invoice_generation_supports_special_characters`
- **Target Issue:** Issue #17 (`[user-test-bug] Invoice generation fails with special characters`)
- **Objective:** Verify that generating an invoice for a client with special characters (`René & Sons <Holdings> "Global"`) succeeds with status `200` or `201`, outputs properly escaped HTML/printable view, and preserves Unicode in the JSON response without crashing.
- **Expected Status:** `200 OK` or `201 Created`
- **Verification:** Generated HTML has `&amp;`, `&lt;`, `&gt;`, `&quot;`, or equivalent entity escaping, preventing XSS and template parser breakage.

---

## 3. Test Suites & Commands
- **Backend API Tests:** `npm test` or `npm run test:api` inside `backend/`
- **Prisma Schema Validation:** `npx prisma validate`
- **Database Push:** `npx prisma db push`
- **Frontend Type & Build Verification:** `npm run build` inside `frontend/`

---

## 4. Manual E2E Test Scenarios
1. **Scenario A (Client Lifecycle):**
   - Create new client: "Acme Corp" (`acme@example.com`, rate `$150/hr`).
   - Read client back from list.
   - Update client details.
2. **Scenario B (Project Lifecycle):**
   - Create project: "Cloud Migration" assigned to "Acme Corp" with hourly rate `$150`.
   - Verify association in project list.
3. **Scenario C (Time Tracking):**
   - Start timer for "Cloud Migration".
   - Let timer run or mock elapsed seconds.
   - Stop timer; verify entry recorded in database.
4. **Scenario D (Invoice Generation):**
   - Trigger invoice generation for "Cloud Migration".
   - Verify calculation: `Hours * Rate = Total`.
   - Verify invoice printable view renders cleanly.

---

## 5. Verification & Issue Closing Log
*Note: Each MVP issue (#1 - #17) will be verified and closed using the mandatory closing comment:*
> `✅ Verified by qa-engineer.md — Acceptance criteria: PASS | Regression tests: PASS | Manual E2E: PASS. Closing issue.`

| Planned # | Real # | Issue Title | Test Method | Status |
|-----------|--------|-------------|-------------|--------|
| 1 | 1 | Scaffold Next.js frontend workspace | Build check & component render | Verified |
| 2 | 2 | Build frontend UI with mockService | Standalone UI interaction | Verified |
| 3 | 3 | Define OpenAPI contract | openapi.yml schema validation | Verified |
| 4 | 4 | Scaffold Hono backend server | GET /health returns 200 OK | Verified |
| 5 | 5 | In-memory backend: Client CRUD | HTTP test for Client endpoints | Verified |
| 6 | 6 | In-memory backend: Project CRUD | HTTP test for Project endpoints | Verified |
| 7 | 7 | In-memory backend: Timer start/stop | HTTP test for Timer endpoints | Verified |
| 8 | 8 | In-memory backend: Invoice generation | HTTP test for Invoice generation | Verified |
| 9 | 9 | Add Prisma SQLite schema | npx prisma validate & db push | Verified |
| 10 | 10 | SQLite backend: Client CRUD | Persistent CRUD verification | Verified |
| 11 | 11 | SQLite backend: Project CRUD | Persistent Project relations | Verified |
| 12 | 12 | SQLite backend: Timer start/stop | Persistent Timer records | Verified |
| 13 | 13 | SQLite backend: Invoice generation | Persistent Invoice records | Verified |
| 14 | 14 | Connect frontend to backend (Clients/Projects) | E2E Frontend-to-API calls | Verified |
| 15 | 15 | Connect frontend to backend (Timers/Invoices) | E2E Live Timers & Invoices | Verified |
| 16 | 16 | [user-test-bug] Timer missing project_id | Regression test & 422 assert | Verified |
| 17 | 17 | [user-test-bug] Invoice special characters | Regression test & HTML escape | Verified |
| 18 | 18 | [post-mvp] CI pipeline and Vercel auto-deploy | Deferred | OPEN |
| 19 | 19 | [post-mvp] Integrate Stripe for B2B subscriptions | Deferred | OPEN |
| 20 | 20 | [post-mvp] Add NextAuth/Clerk for multi-tenant auth | Deferred | OPEN |
