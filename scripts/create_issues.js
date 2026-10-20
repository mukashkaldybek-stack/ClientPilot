const { execSync } = require('child_process');
const fs = require('fs');

const issues = [
  {
    planned: 1,
    title: "[mvp] Scaffold Next.js frontend workspace",
    labels: ["mvp"],
    body: `Goal: Create the frontend application shell.
Tasks:
- Initialize Next.js frontend.
- Add Tailwind and a clean component system.
- Add basic app layout with sidebar navigation: Dashboard, Clients, Projects, Timers, Invoices.
- Add npm scripts for dev/build/test.
Acceptance Criteria:
- Frontend builds successfully.
- Pages render without backend dependency.`
  },
  {
    planned: 2,
    title: "[mvp] Build frontend UI with mockService",
    labels: ["mvp"],
    body: `Goal: Complete frontend before backend exists.
Tasks:
- Create mockService for clients, projects, timers, invoices.
- Build Dashboard, Clients, Projects, Timers, and Invoices UI.
- Use realistic mock data.
Acceptance Criteria:
- UI works using mockService only.
- No backend calls are required.`
  },
  {
    planned: 3,
    title: "[mvp] Define OpenAPI contract",
    labels: ["mvp"],
    body: `Goal: Define the API contract before backend implementation.
Tasks:
- Create docs/openapi.yml.
- Define endpoints for clients, projects, timers, invoices.
- Define validation error responses.
Acceptance Criteria:
- openapi.yml exists and describes all MVP endpoints.
- Frontend mockService matches the contract.`
  },
  {
    planned: 4,
    title: "[mvp] Scaffold Hono backend server",
    labels: ["mvp"],
    body: `Goal: Start backend implementation.
Tasks:
- Create Hono TypeScript backend.
- Add health endpoint.
- Add CORS support for frontend.
Acceptance Criteria:
- Backend starts locally.
- GET /health returns OK.`
  },
  {
    planned: 5,
    title: "[mvp] In-memory backend: Client CRUD",
    labels: ["mvp"],
    body: `Goal: Implement clients API without database.
Tasks:
- Add GET /api/clients.
- Add POST /api/clients.
- Add PATCH /api/clients/:id.
- Add DELETE /api/clients/:id.
- Use in-memory storage.
Acceptance Criteria:
- Client CRUD works with in-memory data.
- Validation errors return 400 or 422.`
  },
  {
    planned: 6,
    title: "[mvp] In-memory backend: Project CRUD",
    labels: ["mvp"],
    body: `Goal: Implement projects API without database.
Tasks:
- Add GET /api/projects.
- Add POST /api/projects.
- Add PATCH /api/projects/:id.
- Add DELETE /api/projects/:id.
- Link project to client by clientId.
Acceptance Criteria:
- Project CRUD works.
- Invalid clientId returns validation error.`
  },
  {
    planned: 7,
    title: "[mvp] In-memory backend: Timer start/stop",
    labels: ["mvp"],
    body: `Goal: Implement time tracking API without database.
Tasks:
- Add POST /api/timers/start.
- Add POST /api/timers/stop.
- Add GET /api/timers.
- Start requires project_id.
Acceptance Criteria:
- Timer can start and stop.
- Missing project_id returns validation error.`
  },
  {
    planned: 8,
    title: "[mvp] In-memory backend: Invoice generation",
    labels: ["mvp"],
    body: `Goal: Implement invoice API without database.
Tasks:
- Add GET /api/invoices.
- Add POST /api/invoices/generate.
- Generate invoice from project and time entries.
Acceptance Criteria:
- Invoice generation returns structured invoice or printable HTML/PDF response.
- Total is calculated from time entries and hourly rate.`
  },
  {
    planned: 9,
    title: "[mvp] Add Prisma SQLite schema",
    labels: ["mvp"],
    body: `Goal: Replace in-memory storage with persistent SQLite.
Tasks:
- Add prisma/schema.prisma.
- Define Client, Project, TimeEntry, Invoice models.
- Use SQLite provider.
- Add seed script.
Acceptance Criteria:
- npx prisma validate passes.
- npx prisma db push creates SQLite database.
- Seed script works.`
  },
  {
    planned: 10,
    title: "[mvp] SQLite backend: Client CRUD",
    labels: ["mvp"],
    body: `Goal: Persist clients in SQLite.
Tasks:
- Replace in-memory client storage with Prisma.
- Keep same API contract.
Acceptance Criteria:
- Client CRUD persists after restart.
- npx prisma validate passes.`
  },
  {
    planned: 11,
    title: "[mvp] SQLite backend: Project CRUD",
    labels: ["mvp"],
    body: `Goal: Persist projects in SQLite.
Tasks:
- Replace in-memory project storage with Prisma.
- Keep same API contract.
Acceptance Criteria:
- Project CRUD persists after restart.
- Projects are linked to clients.`
  },
  {
    planned: 12,
    title: "[mvp] SQLite backend: Timer start/stop",
    labels: ["mvp"],
    body: `Goal: Persist timers in SQLite.
Tasks:
- Replace in-memory timer storage with Prisma.
- Add validation for project_id.
Acceptance Criteria:
- Timers persist after restart.
- Missing project_id returns 422, not 500.`
  },
  {
    planned: 13,
    title: "[mvp] SQLite backend: Invoice generation",
    labels: ["mvp"],
    body: `Goal: Persist invoices in SQLite.
Tasks:
- Replace in-memory invoice storage with Prisma.
- Generate invoice from persisted time entries.
- Sanitize client-facing text fields.
Acceptance Criteria:
- Invoice generation works from persisted data.
- Special characters in client details do not crash generation.`
  },
  {
    planned: 14,
    title: "[mvp] Connect frontend to backend for clients and projects",
    labels: ["mvp"],
    body: `Goal: Replace mockService for clients and projects.
Tasks:
- Connect frontend to real backend endpoints.
- Add loading and error states.
Acceptance Criteria:
- Frontend displays real clients and projects from SQLite.
- Creating/editing clients/projects updates backend.`
  },
  {
    planned: 15,
    title: "[mvp] Connect frontend to backend for timers and invoices",
    labels: ["mvp"],
    body: `Goal: Replace mockService for timers and invoices.
Tasks:
- Connect timer start/stop UI to backend.
- Connect invoice generation UI to backend.
- Add end-to-end local test flow.
Acceptance Criteria:
- User can start/stop timer from frontend.
- User can generate invoice from frontend.
- App runs locally end-to-end.`
  },
  {
    planned: 16,
    title: "[mvp] [user-test-bug] Timer API crashes when project_id is missing",
    labels: ["mvp", "user-test-bug"],
    body: `Goal: Make timer start robust.
Tasks:
- Reproduce POST /api/timers/start with missing/null project_id.
- Add regression test named test_timer_start_requires_project_id.
- Fix validation using schema validation.
- Return 422 instead of 500.
Acceptance Criteria:
- Missing project_id returns 422.
- Regression test passes.
- Manual E2E test passes.`
  },
  {
    planned: 17,
    title: "[mvp] [user-test-bug] Invoice generation fails with special characters",
    labels: ["mvp", "user-test-bug"],
    body: `Goal: Make invoice generation safe for international client details.
Tasks:
- Reproduce invoice generation using client name/address containing é, &, <, >, or quotes.
- Add regression test named test_invoice_generation_supports_special_characters.
- Sanitize/escape rendered values.
- Fix invoice rendering.
Acceptance Criteria:
- Invoice generation succeeds with special characters.
- Regression test passes.
- Manual E2E test passes.`
  },
  {
    planned: 18,
    title: "[post-mvp] CI pipeline and Vercel auto-deploy",
    labels: ["post-mvp"],
    body: `Goal: Add CI/CD.
Tasks:
- Add Vercel link.
- CI runs tests and npx prisma validate on PRs.
- Auto-deploy on main.
Acceptance Criteria:
- Failing test blocks merge.
- Preview deploys per PR.
Status: LEAVE OPEN.`
  },
  {
    planned: 19,
    title: "[post-mvp] Integrate Stripe for B2B subscriptions",
    labels: ["post-mvp"],
    body: `Goal: Monetization.
Tasks:
- Add tiers: Starter, Pro, Agency.
- Add checkout and billing portal.
- Sync Stripe webhook status to SQLite.
Acceptance Criteria:
- Test-mode checkout works.
- Webhook updates subscription status.
Status: LEAVE OPEN.`
  },
  {
    planned: 20,
    title: "[post-mvp] Add NextAuth/Clerk for multi-tenant authentication",
    labels: ["post-mvp"],
    body: `Goal: Per-business workspaces.
Tasks:
- Add auth provider.
- Add businessId tenant key to relevant records.
- Add row-level filtering in API.
Acceptance Criteria:
- Two test businesses see only their own data.
- Unauthenticated requests receive 401.
Status: LEAVE OPEN.`
  }
];

const results = [];

for (const issue of issues) {
  console.log(`Creating Issue ${issue.planned}: ${issue.title}...`);
  const labelArgs = issue.labels.map(l => `--label "${l}"`).join(' ');
  const tempBodyPath = `temp_body_${issue.planned}.txt`;
  fs.writeFileSync(tempBodyPath, issue.body, 'utf8');

  try {
    const cmd = `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --body-file "${tempBodyPath}" ${labelArgs}`;
    const output = execSync(cmd, { encoding: 'utf8' }).trim();
    const match = output.match(/\/issues\/(\d+)/);
    const realNumber = match ? parseInt(match[1], 10) : issue.planned;
    results.push({
      planned: issue.planned,
      real: realNumber,
      title: issue.title,
      labels: issue.labels.join(','),
      status: 'OPEN',
      url: output
    });
    console.log(`-> Created #${realNumber}: ${output}`);
  } finally {
    if (fs.existsSync(tempBodyPath)) {
      fs.unlinkSync(tempBodyPath);
    }
  }
}

fs.writeFileSync('issues_mapping.json', JSON.stringify(results, null, 2), 'utf8');

// Generate GITHUB_ISSUES.md
let md = `# GitHub Issues Status\n\n`;
md += `Live tracking of all 20 GitHub issues for ClientPilot.\n\n`;
md += `| Planned # | Real # | Title | Labels | Status | URL |\n`;
md += `|-----------|--------|-------|--------|--------|-----|\n`;
for (const r of results) {
  md += `| ${r.planned} | ${r.real} | ${r.title} | ${r.labels} | ${r.status} | [Link](${r.url}) |\n`;
}

fs.writeFileSync('GITHUB_ISSUES.md', md, 'utf8');
console.log('Finished creating all 20 issues and wrote GITHUB_ISSUES.md.');
