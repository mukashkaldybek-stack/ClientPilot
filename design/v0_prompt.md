# v0 / Lovable / Claude Design Prompt: ClientPilot Design System

Use this detailed, highly aesthetic prompt when generating UI layouts or redesigning components in v0.dev, Lovable, or Claude Artifacts.

---

## Design Prompt: ClientPilot Freelancer Micro-SaaS

```markdown
Design a modern, ultra-clean, high-productivity web application called "ClientPilot", a micro-SaaS engineered for high-earning freelance software engineers, creative directors, and boutique consultants.

### 1. Aesthetic Direction & Visual Language
- **Theme:** Sleek modern dark mode with subtle slate tints (Background: #0B0F17, Card Surface: #131B2E, Border: #1E293B, Glassmorphism hover states with 12px backdrop blur).
- **Accents:** Emerald / Mint green (#10B981 / #34D399) for active timers, billable metrics, and positive financial trends; Electric Indigo / Cyan (#6366F1 / #06B6D4) for primary actions and project tags.
- **Typography:** Modern clean sans-serif (Inter / Outfit / Plus Jakarta Sans) with crisp tabular numbers (`font-mono` for timer clocks, financial amounts, and invoice IDs).
- **Atmosphere:** Feels like Linear meets Stripe Dashboard with the speed of Raycast. No childish cartoon graphics or bloated corporate padding. Sharp 8px and 12px corner radii, delicate 1px border lines with subtle inner shadows.

### 2. Core Layout & Navigation
- **Persistent Sidebar Navigation:**
  - Brand header with glowing geometric icon and "ClientPilot" logotype.
  - Quick Active Timer Widget pinned in sidebar or bottom bar showing current running task, pulsating emerald record dot, live HH:MM:SS ticker, and instant Stop button.
  - Clean nav items with icons:
    1. Dashboard (Overview metrics, recent activity, revenue chart)
    2. Clients (Client directory, contact info, total billed)
    3. Projects (Active contracts, hourly rates, budget burn rate)
    4. Time Tracker (Interactive timeline, manual entry, active timer)
    5. Invoices (Invoice generator, status filters: Draft, Sent, Paid, Overdue)
  - Bottom profile toggle with workspace status badge.

### 3. Screen Specifications

#### A. Executive Dashboard
- **Top Metric Cards:**
  - Total Hours Tracked (This month vs last month delta)
  - Unbilled Revenue ($ amount ready to be invoiced with instant "Generate Invoice" CTA)
  - Active Projects count
  - Outstanding Invoices ($ pending collection)
- **Active / Recent Sessions Feed:** Table listing recent tasks with client tag, duration badge, billable flag, and action menu.

#### B. Client Management View
- Grid and table view of clients.
- Modal for "Add Client" with Name, Email, Company, Currency, Default Hourly Rate, and Billing Address.
- Quick action to view all associated projects and generate client statement.

#### C. Project Management View
- Cards grouped by status (Active, In Review, Completed).
- Shows client relation badge, rate per hour, hours logged vs estimated, and quick "Start Timer" button directly on project card.

#### D. Time Tracker & Live Timer
- Sticky top banner with input "What are you working on?", Project selector dropdown, billable toggle, and large emerald "Start Timer" trigger.
- Running state transforms into pulsating timer with real-time second ticks, pause, and stop button.
- Comprehensive log table below with editable notes and bulk actions.

#### E. Invoicing & Billing Engine
- "Generate Invoice" modal: Select project, date range, auto-aggregates unbilled time entries into line items.
- Live invoice preview pane: Clean professional invoice layout with freelance business header, client details, line items table (Task description, hours, rate, subtotal), tax calculation, notes/payment terms, and "Export / Print PDF" button.
- Status badges: Emerald "Paid", Amber "Pending", Slate "Draft".

### 4. Interactive Micro-Animations
- Pulse glow animation on active timer indicator dot (`animate-pulse`).
- Smooth card hover lift with subtle border glow transition (`transition-all duration-200 hover:border-emerald-500/30`).
- Modal slide-in with backdrop blur.
- Toast notifications for timer started, stopped, and invoice created.
```
