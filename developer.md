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
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Next.js 14 App Router workspace in `frontend/` with Tailwind CSS and Lucide icons.
  - Complete dark-slate theme with emerald accent tokens (`#0b0f17`, `#131b2e`, `#10b981`).
  - Persistent `Sidebar` navigation: Dashboard (`/`), Clients (`/clients`), Projects (`/projects`), Timers (`/timers`), Invoices (`/invoices`).
  - Global `ActiveTimerBar` with real-time second ticker, project selector, and start/stop triggers.
  - Fully implemented `mockService.ts` providing in-memory and `localStorage` persistence with realistic seed data.
  - Unified `api.ts` abstraction supporting dual-mode operation (mock vs live backend).
  - Production build verification (`npm run build` passed cleanly across all 5 routes).

### Iteration 2: OpenAPI Contract Specification (`docs/openapi.yml`)
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Standardized OpenAPI 3.0.3 contract in `docs/openapi.yml`.
  - Detailed endpoints:
    - `/health`: System health monitor.
    - `/api/clients` and `/api/clients/{id}`: CRUD operations.
    - `/api/projects` and `/api/projects/{id}`: Linked project CRUD with client validation.
    - `/api/timers`, `/api/timers/start`, `/api/timers/stop`, `/api/timers/{id}`: Time tracking engine with explicit 422 validation specification for missing `project_id`.
    - `/api/invoices`, `/api/invoices/generate`, `/api/invoices/{id}`, `/api/invoices/{id}/status`: Billing aggregation and state management.
  - Full JSON schemas for inputs, outputs, `ValidationErrorResponse`, and `ErrorResponse`.
  - Direct 1:1 parity between `docs/openapi.yml` and `frontend/src/services/mockService.ts`.

### Iteration 3: In-Memory Hono API Implementation
- **Status:** COMPLETED ✅
- **Deliverables:**
  - TypeScript Hono backend in `backend/` powered by `@hono/node-server`.
  - Configured global CORS middleware supporting web clients.
  - `/health` endpoint returning system status and ISO timestamp.
  - `IDataStore` interface defining persistent repository contract.
  - `InMemoryStore` providing full CRUD operations for Clients and Projects, timer sessions with active status toggling, and unbilled time calculation for invoice generation.
  - Automated tests via Vitest in `backend/test/api.test.ts` verifying all endpoints (100% pass rate).

### Iteration 4: SQLite Database with Prisma ORM
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Prisma schema in `prisma/schema.prisma` configured with SQLite provider (`prisma/dev.db`).
  - Relational schema with cascade rules: `Client` 1:N `Project` 1:N `TimeEntry`, `Project` 1:N `Invoice`.
  - Database schema synchronized using `npx prisma db push`.
  - Realistic database seed script in `scripts/seed.ts` seeding clients, projects, time entries, and invoices.
  - `PrismaStore` in `backend/src/store/prismaStore.ts` implementing `IDataStore` with persistent SQLite queries.
  - Added HTML escaping & internationalization sanitizer in `backend/src/utils/sanitize.ts`.
  - Comprehensive automated test suite in `backend/test/prisma_and_regressions.test.ts` verifying real persistent SQLite transactions and bug regressions (11/11 tests passing).

### Iteration 5: Frontend + Backend Integration & Verification
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Configured environment variables (`NEXT_PUBLIC_USE_BACKEND=true`, `NEXT_PUBLIC_API_URL=http://localhost:3001`).
  - Switched frontend service layer (`frontend/src/services/api.ts`) to communicate with the live Hono backend API.
  - End-to-end automated verification script (`scripts/test_e2e_flow.ts`) executing complete lifecycle:
    1. System health check.
    2. Client creation and persistence in SQLite.
    3. Project creation linked to client in SQLite.
    4. Active timer start, live work tracking, and timer stop with duration calculation.
    5. Automatic invoice generation from tracked work sessions with HTML escaping and currency calculation.
  - Both frontend production build (`npm run build`) and backend tests (11/11 tests) passing without errors.

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

---

## Post-MVP Implementation Records (Issues #18, #19, #20)

### Issue #18: CI/CD Pipeline & Vercel Deployment
- **Status:** COMPLETED ✅
- **Deliverables:**
  - GitHub Actions Workflow: `.github/workflows/ci.yml` running on push/PR to `main`.
  - Workflow steps: repository checkout (`actions/checkout@v4`), Node 20 LTS setup (`actions/setup-node@v4`), dependency caching, Prisma schema validation (`npx prisma validate`), SQLite table deployment (`npx prisma db push`), full automated testing (`npm test`), and Next.js frontend production build (`npm run build:frontend`).
  - Vercel Deployment Configuration: `vercel.json` configuring framework `nextjs`, root directory `frontend/`, and clean routing for production and preview environments.

### Issue #19: Stripe B2B Subscriptions
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Subscription Tiers: Starter ($12/mo), Pro ($29/mo), and Agency ($79/mo).
  - Backend API in `backend/src/routes/subscription.ts`:
    - `GET /api/subscription`: Returns active subscription details and available pricing plans.
    - `POST /api/subscription/checkout`: Creates simulated Stripe checkout session with session URL and tier metadata.
    - `POST /api/subscription/webhook`: Ingests `checkout.session.completed` events and synchronizes subscription tier and customer ID to SQLite.
    - `GET /api/subscription/portal`: Generates Stripe customer billing portal link.
  - SQLite Model in `prisma/schema.prisma`: `Subscription` entity storing `businessId`, `tier`, `status`, `stripeCustomerId`, and `stripeSubscriptionId`.
  - Frontend Subscription Page in `frontend/src/app/subscription/page.tsx`: Interactive tier selection cards, monthly/annual toggles, feature checklist, and checkout CTA wired to backend API.

### Issue #20: Multi-Tenant Authentication & Row-Level Isolation
- **Status:** COMPLETED ✅
- **Deliverables:**
  - Authentication Middleware in `backend/src/middleware/auth.ts`: Rejects unauthenticated requests with HTTP 401 (`Authentication required`), extracts Bearer JWT tokens or business identifiers, and injects `businessId` into request context.
  - Multi-Tenant Schema: Added `businessId` indexed column to `Client`, `Project`, `TimeEntry`, `Invoice`, and `Subscription` models in `prisma/schema.prisma`.
  - Row-Level Tenant Isolation in `backend/src/store/prismaStore.ts`: All CRUD operations enforce `where: { businessId }` filtering, preventing cross-tenant data leakage between freelance workspaces.
  - Comprehensive Test Suite in `backend/test/post_mvp.test.ts`: 9 automated tests verifying CI config, Stripe checkout, webhook database synchronization, 401 unauthenticated blocking, and strict row-level isolation between distinct business IDs.

