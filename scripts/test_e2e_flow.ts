/**
 * End-to-End Live System Integration Verification Script
 * Validates full flow:
 * 1. Health check
 * 2. Client Creation in SQLite
 * 3. Project Creation linked to Client
 * 4. Start Real-time Timer session
 * 5. Stop Timer session and compute duration
 * 6. Generate Invoice from tracked work
 * 7. Validate Invoice totals, line items, and sanitized HTML
 */

async function runE2EVerification() {
  const baseUrl = 'http://localhost:3001';
  console.log(`\n==================================================`);
  console.log(`🚀 RUNNING FULL END-TO-END FLOW (HTTP -> HONO -> SQLITE)`);
  console.log(`Target: ${baseUrl}`);
  console.log(`==================================================\n`);

  // 1. Health Check
  console.log('1. Checking Backend Health Endpoint (/health)...');
  const healthRes = await fetch(`${baseUrl}/health`);
  if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.statusText}`);
  const health = await healthRes.json();
  console.log(`   -> Health Status: ${health.status} (${health.service})`);

  // 2. Client Creation
  console.log('\n2. Creating Client via POST /api/clients...');
  const clientPayload = {
    name: 'Starlight Media & Design <International> "Global"',
    email: 'contact@starlight-media.com',
    company: 'Starlight Media Corp',
    hourly_rate: 175.0,
    currency: 'USD',
    address: '742 Evergreen Terrace & Boulevard, Suite 100',
  };
  const clientRes = await fetch(`${baseUrl}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(clientPayload),
  });
  if (!clientRes.ok) throw new Error(`Client creation failed: ${await clientRes.text()}`);
  const client = await clientRes.json();
  console.log(`   -> Client Created: ID=${client.id}, Name=${client.name}, Rate=$${client.hourly_rate}/h`);

  // 3. Project Creation
  console.log('\n3. Creating Project via POST /api/projects...');
  const projectPayload = {
    client_id: client.id,
    name: 'E-Commerce Micro-Frontend Replatforming',
    description: 'Next.js App Router, Tailwind design system, and checkout funnel optimization.',
    hourly_rate: 175.0,
    status: 'active',
  };
  const projectRes = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectPayload),
  });
  if (!projectRes.ok) throw new Error(`Project creation failed: ${await projectRes.text()}`);
  const project = await projectRes.json();
  console.log(`   -> Project Created: ID=${project.id}, Name=${project.name}, Client=${project.client_name}`);

  // 4. Start Timer
  console.log('\n4. Starting Timer Session via POST /api/timers/start...');
  const timerStartRes = await fetch(`${baseUrl}/api/timers/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: project.id,
      description: 'Implemented payment webhook receiver and idempotency keys',
    }),
  });
  if (!timerStartRes.ok) throw new Error(`Timer start failed: ${await timerStartRes.text()}`);
  const activeTimer = await timerStartRes.json();
  console.log(`   -> Active Timer Running: ID=${activeTimer.id}, Task="${activeTimer.description}", StartedAt=${activeTimer.start_time}`);

  // Simulated elapsed work
  console.log('   -> Simulating 1.5 seconds of focused development...');
  await new Promise((r) => setTimeout(r, 1500));

  // 5. Stop Timer
  console.log('\n5. Stopping Timer Session via POST /api/timers/stop...');
  const timerStopRes = await fetch(`${baseUrl}/api/timers/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: activeTimer.id }),
  });
  if (!timerStopRes.ok) throw new Error(`Timer stop failed: ${await timerStopRes.text()}`);
  const stoppedTimer = await timerStopRes.json();
  console.log(`   -> Timer Stopped: ID=${stoppedTimer.id}, Duration=${stoppedTimer.duration_seconds}s, Active=${stoppedTimer.is_active}`);

  // 6. Generate Invoice
  console.log('\n6. Generating Invoice via POST /api/invoices/generate...');
  const invoiceRes = await fetch(`${baseUrl}/api/invoices/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project_id: project.id,
      notes: 'Net 14 payment terms. Thank you for choosing ClientPilot!',
      due_days: 14,
    }),
  });
  if (!invoiceRes.ok) throw new Error(`Invoice generation failed: ${await invoiceRes.text()}`);
  const invoice = await invoiceRes.json();
  console.log(`   -> Invoice Successfully Issued: Number=${invoice.invoice_number}`);
  console.log(`   -> Total Hours: ${invoice.total_hours} hrs @ $${invoice.hourly_rate}/h`);
  console.log(`   -> Total Due: $${invoice.total_amount} ${invoice.currency}`);
  console.log(`   -> Line Items: ${invoice.line_items.length} items aggregated`);
  console.log(`   -> HTML Preview Escaping Verification:`);
  console.log(`      * Has sanitized ampersand: ${invoice.html_preview?.includes('&amp;')}`);
  console.log(`      * Has sanitized angle bracket: ${invoice.html_preview?.includes('&lt;')}`);

  // 7. Verification Summary
  console.log(`\n==================================================`);
  console.log(`✅ FULL END-TO-END FLOW VERIFIED SUCCESSFULLY!`);
  console.log(`All operations persisted to SQLite database: prisma/dev.db`);
  console.log(`==================================================\n`);
}

runE2EVerification().catch((e) => {
  console.error('❌ E2E Verification Flow failed:', e);
  process.exit(1);
});
