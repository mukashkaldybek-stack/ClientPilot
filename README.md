# ClientPilot ⚡

> **A high-productivity micro-SaaS for freelancers and independent consultants.**  
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
|   |  - Responsive Layout with Global Active Timer Bar                         |   |
|   |  - Views: Dashboard | Clients | Projects | Time Tracker | Invoices         |   |
|   |  - Client Layer: Dual Mode (mockService.ts <---> Real API Client)         |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|                                    HTTP / JSON                                    |
|                                         |                                         |
|   +-------------------------------------+-------------------------------------+   |
|   |                         BACKEND API (Hono TypeScript)                     |   |
|   |  - Ultra-fast Hono Server running on Node.js                              |   |
|   |  - Endpoints:                                                             |   |
|   |      * /health                  -> Server health status                   |   |
|   |      * /api/clients             -> Client CRUD                            |   |
|   |      * /api/projects            -> Project CRUD (linked to Clients)       |   |
|   |      * /api/timers              -> Start / Stop / List active & logs      |   |
|   |      * /api/invoices            -> Generate & List invoices               |   |
|   |  - Middleware: CORS, Request Validation, Error Handler                    |   |
|   |  - Architecture: Repositories (In-Memory <---> Prisma SQLite)             |   |
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
- **Node.js**: v18+ (tested on Node v24.20.0)
- **npm**: v9+ (or `npm.cmd` on Windows)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/mukashkaldybek-stack/ClientPilot.git
cd ClientPilot

# Install root & backend dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Database Setup (Prisma + SQLite)
```bash
# Push Prisma schema to SQLite
npx prisma db push

# (Optional) Seed sample data
npm run seed
```

### 3. Run the Development Servers
In two terminal tabs or concurrently:

```bash
# Terminal 1: Backend Hono API (port 3001)
npm run dev:server

# Terminal 2: Frontend Next.js (port 3000)
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Summary

To run backend unit, HTTP, and regression test suites:
```bash
# Run all automated tests
npm test
```

### Regression Test Guards
- `test_timer_start_requires_project_id`: Asserts that `POST /api/timers/start` with missing `project_id` returns HTTP `422 Unprocessable Entity` rather than 500 crash.
- `test_invoice_generation_supports_special_characters`: Asserts that invoice generation for clients containing `é`, `&`, `<`, `>`, and quotes correctly escapes HTML entities and generates without error.

---

## 🔄 AI-Native Iteration Summary

1. **Iteration 1: Frontend-Only (mockService):**  
   Built complete responsive UI for Dashboard, Clients, Projects, Timers, and Invoices running entirely in-browser with simulated asynchronous operations.
2. **Iteration 2: OpenAPI Contract (`docs/openapi.yml`):**  
   Standardized all API models, status codes, query filters, and error schemas.
3. **Iteration 3: In-Memory Hono Backend:**  
   Implemented lightning-fast Hono API server with in-memory stores and request validation.
4. **Iteration 4: SQLite Database & Prisma ORM:**  
   Migrated from in-memory to persistent SQLite storage (`prisma/dev.db`), ensuring data survives server restarts.
5. **Iteration 5: Full Frontend-Backend Integration:**  
   Wired Next.js client to Hono API server, verified live end-to-end user workflows and verified all test suites.

---

## 📋 GitHub Issues & Tracking
For a complete audit of all 20 GitHub issues, see [GITHUB_ISSUES.md](file:///c:/Users/77010/Desktop/ass1part2/GITHUB_ISSUES.md).
- Issues #1 – #15: MVP Implementations (Closed ✅)
- Issues #16 – #17: User Test Bugs (Closed ✅)
- Issues #18 – #20: Post-MVP Roadmap (Open ⏳)
