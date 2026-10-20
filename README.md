# ClientPilot ⚡

> **A high-productivity micro-SaaS for freelancers and independent software consultants.**  
> Effortlessly manage clients, track project hours with real-time timers, and generate itemized invoices directly from tracked time.

---

## 🏛️ System Architecture

```text
+-----------------------------------------------------------------------------------+
|                                 CLIENTPILOT                                       |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                        FRONTEND (Next.js 14 App Router)                   |   |
|   |  - Modern Dark-Slate Design System (Tailwind CSS, Glassmorphism)          |   |
|   |  - Persistent Navigation: Dashboard | Clients | Projects | Timers | Invoices|   |
|   |  - Global Sticky Active Timer Bar with live 1s ticker                     |   |
|   |  - Dual Mode Client Architecture:                                         |   |
|   |      * mockService.ts (Browser storage fallback / Standalone demo)        |   |
|   |      * api.ts (Live Hono Backend Client with SQLite persistence)          |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|                                    HTTP / JSON                                    |
|                                         |                                         |
|   +-------------------------------------+-------------------------------------+   |
|   |                         BACKEND API (Hono TypeScript)                     |   |
|   |  - Ultra-fast Hono Server running on Node.js via @hono/node-server        |   |
|   |  - Endpoints:                                                             |   |
|   |      * GET  /health                  -> Service health & timestamp        |   |
|   |      * CRUD /api/clients             -> Client management                 |   |
|   |      * CRUD /api/projects            -> Projects linked to clients        |   |
|   |      * CRUD /api/timers              -> Start (422 guard), Stop, Log      |   |
|   |      * POST /api/invoices/generate   -> Unbilled hours billing engine     |   |
|   |      * CRUD /api/invoices            -> State tracking & HTML preview     |   |
|   |  - Middleware: CORS, Request Validation, Error Handler, Logger            |   |
|   |  - Pluggable Repository Pattern: IDataStore (InMemoryStore <-> PrismaStore) |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|                                     Prisma ORM                                    |
|                                         |                                         |
|   +-------------------------------------+-------------------------------------+   |
|   |                        PERSISTENCE (SQLite Database)                      |   |
|   |  - Local File: prisma/dev.db                                              |   |
|   |  - Relational Schema:                                                     |   |
|   |      Client 1----* Project 1----* TimeEntry                               |   |
|   |                    Project 1----* Invoice                                 |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Quick Setup & Installation

### Prerequisites
- **Node.js**: v18+ (tested on Node v24.20.0 LTS)
- **npm**: v9+ (or `npm.cmd` on Windows)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mukashkaldybek-stack/ClientPilot.git
cd ClientPilot

# Install root dependencies (Prisma, TSX, tools)
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Database Synchronization & Seeding
```bash
# Push Prisma schema to SQLite (creates prisma/dev.db)
npm run prisma:push

# Seed database with realistic freelance dataset
npm run seed
```

### 3. Run Development Servers
In two separate terminal tabs:

```bash
# Terminal 1: Backend Hono API (port 3001)
npm run dev:server

# Terminal 2: Frontend Next.js Web App (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Summary

To run the complete automated test suite:
```bash
npm test
```

### Test Suite Results: 100% Pass Rate (20/20 tests across 3 suites)
- **`backend/test/api.test.ts` (6 tests):**
  - `GET /health` returns 200 OK
  - `GET /api/clients` returns client list
  - `POST /api/clients` creates client and handles validation errors
  - `GET /api/projects` and `POST /api/projects` enforces client relationship
  - `POST /api/timers/start` and `POST /api/timers/stop` tracks work sessions
  - `POST /api/invoices/generate` calculates total from time entries and hourly rates
- **`backend/test/prisma_and_regressions.test.ts` (5 tests):**
  - Persists Client CRUD operations in SQLite
  - Persists Project CRUD operations in SQLite with foreign key linkage
  - Persists Timer start and stop sessions in SQLite
  - **Regression Test 1:** `test_timer_start_requires_project_id` (Asserts HTTP 422 for omitted, null, or empty `project_id`)
  - **Regression Test 2:** `test_invoice_generation_supports_special_characters` (Asserts international characters like `é`, `&`, `<`, `>`, `"` are preserved in JSON and safely escaped in HTML preview)
- **`backend/test/post_mvp.test.ts` (9 tests):**
  - CI workflow verification (`.github/workflows/ci.yml` with lint, test, and build gates)
  - Vercel configuration verification (`vercel.json`)
  - Stripe B2B subscription tier fetching (`Starter`, `Pro`, `Agency`)
  - Stripe checkout session creation and invalid tier rejection
  - Stripe webhook simulation syncing subscription tier to SQLite
  - Stripe customer billing portal link generation
  - Multi-tenant 401 unauthenticated request enforcement
  - Authenticated Bearer token access authorization
  - Multi-tenant row-level data isolation between distinct businesses

---

## 🔄 AI-Native Iterations Summary

1. **Iteration 1: Frontend-Only with `mockService`:**  
   Built full responsive frontend application shell with dark slate design system, persistent sidebar navigation, real-time timer ticking bar, and realistic mock data service.
2. **Iteration 2: OpenAPI Contract (`docs/openapi.yml`):**  
   Defined standardized OpenAPI 3.0 specification covering all endpoints, parameters, schemas, and validation error models.
3. **Iteration 3: In-Memory Hono Backend:**  
   Built TypeScript Hono backend with CORS, health monitoring, and in-memory repositories for Clients, Projects, Timers, and Invoices.
4. **Iteration 4: SQLite Database with Prisma ORM:**  
   Created relational schema (`prisma/schema.prisma`), pushed tables to `prisma/dev.db`, created seed script (`scripts/seed.ts`), and implemented `PrismaStore` with full persistence.
5. **Iteration 5: Full Frontend-Backend Integration:**  
   Connected frontend to Hono API server, executed automated end-to-end integration flow (`scripts/test_e2e_flow.ts`), and verified persistence.

---

## 📋 GitHub Issue Status

| Planned # | Real # | Title | Labels | Status |
|:---------:|:------:|-------|--------|:------:|
| 1 | 1 | [mvp] Scaffold Next.js frontend workspace | mvp | CLOSED ✅ |
| 2 | 2 | [mvp] Build frontend UI with mockService | mvp | CLOSED ✅ |
| 3 | 3 | [mvp] Define OpenAPI contract | mvp | CLOSED ✅ |
| 4 | 4 | [mvp] Scaffold Hono backend server | mvp | CLOSED ✅ |
| 5 | 5 | [mvp] In-memory backend: Client CRUD | mvp | CLOSED ✅ |
| 6 | 6 | [mvp] In-memory backend: Project CRUD | mvp | CLOSED ✅ |
| 7 | 7 | [mvp] In-memory backend: Timer start/stop | mvp | CLOSED ✅ |
| 8 | 8 | [mvp] In-memory backend: Invoice generation | mvp | CLOSED ✅ |
| 9 | 9 | [mvp] Add Prisma SQLite schema | mvp | CLOSED ✅ |
| 10 | 10 | [mvp] SQLite backend: Client CRUD | mvp | CLOSED ✅ |
| 11 | 11 | [mvp] SQLite backend: Project CRUD | mvp | CLOSED ✅ |
| 12 | 12 | [mvp] SQLite backend: Timer start/stop | mvp | CLOSED ✅ |
| 13 | 13 | [mvp] SQLite backend: Invoice generation | mvp | CLOSED ✅ |
| 14 | 14 | [mvp] Connect frontend to backend for clients and projects | mvp | CLOSED ✅ |
| 15 | 15 | [mvp] Connect frontend to backend for timers and invoices | mvp | CLOSED ✅ |
| 16 | 16 | [mvp] [user-test-bug] Timer API crashes when project_id is missing | mvp, user-test-bug | CLOSED ✅ |
| 17 | 17 | [mvp] [user-test-bug] Invoice generation fails with special characters | mvp, user-test-bug | CLOSED ✅ |
| 18 | 18 | [post-mvp] CI pipeline and Vercel auto-deploy | post-mvp | CLOSED ✅ |
| 19 | 19 | [post-mvp] Integrate Stripe for B2B subscriptions | post-mvp | CLOSED ✅ |
| 20 | 20 | [post-mvp] Add NextAuth/Clerk for multi-tenant authentication | post-mvp | CLOSED ✅ |
