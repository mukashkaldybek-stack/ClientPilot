# Developer Iteration Log & Technical Notes: ClientPilot

## Overview
This log documents the iterative implementation of ClientPilot through 5 mandatory phases, architectural decisions, and bug remediation records.

---

## Technical Stack & Architecture Decisions
- **Monorepo / Workspace Layout:**
  - `frontend/`: Next.js 14/15 App Router application with Tailwind CSS, Lucide icons, and responsive components.
  - `backend/`: TypeScript Hono application with `@hono/node-server`, CORS, and Zod/manual validation schemas.
  - `prisma/`: SQLite schema (`schema.prisma`) and seed scripts.
  - `docs/`: OpenAPI specification (`openapi.yml`).
  - `design/`: Design prompt and reference documents (`v0_prompt.md`).
- **Data Persistence:**
  - In Iterations 1-3, `mockService` and in-memory stores decouple frontend and backend progression.
  - In Iterations 4-5, Prisma ORM with SQLite file storage (`dev.db`) ensures atomic persistence.

---

## Iteration Progress Log

### Iteration 1: Frontend-Only Implementation with `mockService`
- **Status:** Pending Execution
- **Deliverables:** Next.js application shell with Navigation sidebar, Dashboard KPIs, Clients list & modal, Projects list & modal, Live Timer controls, and Invoice view/export. Powered by client-side `mockService.ts`.
- **Implementation Notes:** Ensure complete standalone functionality without requiring the backend server to be running.

### Iteration 2: OpenAPI Contract Specification (`docs/openapi.yml`)
- **Status:** Pending Execution
- **Deliverables:** Comprehensive OpenAPI 3.0 specification covering `/api/clients`, `/api/projects`, `/api/timers`, `/api/invoices`, error payloads, and data models.

### Iteration 3: In-Memory Hono API Implementation
- **Status:** Pending Execution
- **Deliverables:** Hono TypeScript server mounted at `backend/` with in-memory store, CORS configured for `http://localhost:3000`, `/health` endpoint, and full CRUD for Clients, Projects, Timers, and Invoices.

### Iteration 4: SQLite Database with Prisma ORM
- **Status:** Pending Execution
- **Deliverables:** `prisma/schema.prisma` with SQLite provider. Models: `Client`, `Project`, `TimeEntry`, `Invoice`. Database push, seed scripts, and Prisma repository layer replacing in-memory stores.

### Iteration 5: Frontend + Backend Integration & Verification
- **Status:** Pending Execution
- **Deliverables:** Frontend API client connected to backend endpoints. Live data flow from UI to SQLite and back. Real-time timer persistence and invoice calculations verified end-to-end.

---

## Bug Fix Protocol Records (Issues #16 & #17)

### Issue #16: [user-test-bug] Timer API crashes when project_id is missing
- **Root Cause Analysis:** POST `/api/timers/start` was expecting `project_id` to exist without checking for falsy or undefined values, causing unhandled exceptions in database lookups or relation mapping.
- **Remediation:** Introduce strict request body validation checking for existence of `project_id` (string, non-empty). Return HTTP 422 with structured error payload `{ "error": "Validation Error", "field": "project_id", "message": "project_id is required" }`.
- **Regression Test:** `test_timer_start_requires_project_id`.

### Issue #17: [user-test-bug] Invoice generation fails with special characters
- **Root Cause Analysis:** Rendering printable HTML invoices with raw string interpolation of client names containing `&`, `<`, `>`, quotes, or accented characters could corrupt the HTML DOM or fail serialization.
- **Remediation:** Add sanitization utility `escapeHtml` to escape dangerous HTML entities while keeping UTF-8 characters intact for display and PDF rendering.
- **Regression Test:** `test_invoice_generation_supports_special_characters`.
