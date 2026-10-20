# Product Manager (PM) Specification & Grooming Notes: ClientPilot

## 1. Product Vision & Strategy
**ClientPilot** is a streamlined micro-SaaS engineered for solo freelancers, contractors, and boutique software agencies. Its purpose is to eliminate context switching between CRM, time trackers, and billing software by offering a consolidated, lightweight, high-performance platform.

### Target Personas
1. **The Solo Tech Consultant / Developer:** Billable on hourly or retainers, needs instant time tracking with zero friction.
2. **The Creative Freelancer:** Works on multiple concurrent projects, requires client contact archiving and itemized professional invoices.
3. **The Boutique Studio Lead:** Tracks project velocity, total billable hours, and paid vs. outstanding invoices.

---

## 2. Release & Iteration Roadmap

| Iteration | Stage | Scope & Deliverables | Acceptance Target |
|-----------|-------|----------------------|-------------------|
| **Iteration 1** | Frontend Mocked Shell | Next.js App Router, Tailwind design system, sidebar layout, Dashboard, Clients, Projects, Timers, Invoices, powered by `mockService`. | 100% functional standalone UI without backend dependencies. |
| **Iteration 2** | Contract Definition | `docs/openapi.yml` defining schemas, CRUD endpoints, error codes (400, 404, 422, 500). | OpenAPI 3.0 specification validated against mock schema. |
| **Iteration 3** | In-Memory Hono API | TypeScript Hono server, `/health`, CORS, in-memory repositories for Client, Project, Timer, Invoice. | All endpoints functional via HTTP requests. |
| **Iteration 4** | SQLite Persistent Store | Prisma schema (`schema.prisma`), SQLite database push, migration and seed script, Prisma-backed repositories. | Data survives server restarts; Prisma validation passes. |
| **Iteration 5** | E2E Integration | Full frontend-to-backend linkage, real-time timer sync, dynamic invoice generation, local testing. | Complete workflow from client creation to invoice generation operational. |

---

## 3. Grooming Notes: MVP Issues (#1 – #15)

- **Issue 1 & 2 (Frontend Architecture):**  
  Must feel sleek, fast, and modern (slate/emerald palette, glassmorphism cards, responsive sidebar). Mock service must emulate real-world async latency and provide sensible seed datasets.
- **Issue 3 (OpenAPI Contract):**  
  Contract is source-of-truth. Must enforce strict validation schemas (`project_id` required for timer start, rates > 0, currency ISO codes).
- **Issue 4 (Hono Server Scaffolding):**  
  Lightweight Node server with `@hono/node-server`, CORS middleware enabling frontend origin `http://localhost:3000`, and health check `/health`.
- **Issues 5 – 8 (In-Memory Endpoints):**  
  CRUD mechanics implemented with clean repository pattern so swapping to Prisma in Iteration 4 requires zero route refactoring.
- **Issues 9 – 13 (Prisma SQLite Integration):**  
  Prisma schema with relational integrity: `Client` 1:N `Project` 1:N `TimeEntry`, `Project` 1:N `Invoice`. Total invoice amounts computed deterministically from duration (seconds/3600) * project hourly rate.
- **Issues 14 & 15 (Frontend E2E Wiring):**  
  Switch frontend from `mockService` mode to live API mode with environment configuration (`NEXT_PUBLIC_API_URL`).

---

## 4. Bug Priority Notes & User Test Bugs (#16 & #17)

### Issue 16: [mvp] [user-test-bug] Timer API crashes when project_id is missing
- **Severity / Priority:** P1 - High (Blocks core time tracking flow)
- **Grooming Note:**  
  When user triggers timer start without specifying `project_id`, or sends malformed JSON (`{"project_id": null}` or `{}`), unhandled exceptions must not bubble into a 500 Internal Server Error.
- **Product Decision:**  
  Reject request with HTTP status `422 Unprocessable Entity` and standard payload:
  `{"error": "Validation Error", "message": "project_id is required to start a timer", "field": "project_id"}`.
- **Resolution Path:** Enforce explicit request schema validation in the Hono route before any database interaction.

### Issue 17: [mvp] [user-test-bug] Invoice generation fails with special characters
- **Severity / Priority:** P1 - High (Blocks billing international clients)
- **Grooming Note:**  
  Clients with characters like accents (`é`, `ñ`), ampersands (`&`), quotes (`"`, `'`), or angle brackets (`<`, `>`) caused string interpolation or template rendering issues during invoice generation.
- **Product Decision:**  
  All client-facing fields (Client Name, Address, Project Name, Notes) must be sanitized and HTML-entity escaped when rendering printable documents, while preserving Unicode characters in JSON APIs.
- **Resolution Path:** Implement utility `escapeHtml` / text sanitizer across invoice generation routines.

---

## 5. Post-MVP Backlog (#18 – #20)
*Status: LEAVE OPEN for future iterations.*
- **Issue 18 (CI pipeline & Vercel deployment):** GitHub Actions workflow for automated test runs, Prisma validations, and Vercel preview environments.
- **Issue 19 (Stripe B2B Subscriptions):** Starter ($12/mo), Pro ($29/mo), and Agency ($79/mo) billing plans with Stripe customer portal webhook synchronization.
- **Issue 20 (Multi-Tenant Authentication):** NextAuth/Clerk integration with `tenant_id` column partition across all tables.
