import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../src/app.js';
import { usePrismaStore, getStore } from '../src/store/index.js';

describe('ClientPilot SQLite Prisma & Regression Test Suite', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    usePrismaStore();
    app = createApp();
  });

  // Issue 10: SQLite Client CRUD
  it('persists client CRUD operations in SQLite', async () => {
    // 1. Create client
    const createRes = await app.request('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nexus Dynamics SQLite',
        email: 'billing@nexusdynamics.io',
        company: 'Nexus Corp',
        hourly_rate: 195,
        currency: 'USD',
        address: '500 Tech Blvd, Austin, TX',
      }),
    });
    expect(createRes.status).toBe(201);
    const client = await createRes.json();
    expect(client.id).toBeDefined();
    expect(client.name).toBe('Nexus Dynamics SQLite');

    // 2. Fetch from SQLite
    const getRes = await app.request(`/api/clients/${client.id}`);
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.email).toBe('billing@nexusdynamics.io');

    // 3. Update client
    const patchRes = await app.request(`/api/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hourly_rate: 210 }),
    });
    expect(patchRes.status).toBe(200);
    const updated = await patchRes.json();
    expect(updated.hourly_rate).toBe(210);
  });

  // Issue 11: SQLite Project CRUD
  it('persists project CRUD operations in SQLite with client linkage', async () => {
    const clientsRes = await app.request('/api/clients');
    const clients = await clientsRes.json();
    expect(clients.length).toBeGreaterThan(0);
    const testClient = clients[0];

    // Create project
    const createRes = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: testClient.id,
        name: 'Distributed Database Sharding',
        hourly_rate: 220,
        status: 'active',
      }),
    });
    expect(createRes.status).toBe(201);
    const project = await createRes.json();
    expect(project.client_id).toBe(testClient.id);

    // List projects for this client
    const listRes = await app.request(`/api/projects?clientId=${testClient.id}`);
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.some((p: { id: string }) => p.id === project.id)).toBe(true);
  });

  // Issue 12: SQLite Timer start/stop
  it('persists timer start and stop sessions in SQLite', async () => {
    const projectsRes = await app.request('/api/projects');
    const projects = await projectsRes.json();
    const testProject = projects[0];

    // Start timer
    const startRes = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: testProject.id,
        description: 'SQLite persistence testing session',
      }),
    });
    expect(startRes.status).toBe(201);
    const timer = await startRes.json();
    expect(timer.is_active).toBe(true);
    expect(timer.project_id).toBe(testProject.id);

    // Stop timer
    const stopRes = await app.request('/api/timers/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: timer.id }),
    });
    expect(stopRes.status).toBe(200);
    const stopped = await stopRes.json();
    expect(stopped.is_active).toBe(false);
  });

  // Issue 16: REGRESSION TEST
  it('test_timer_start_requires_project_id', async () => {
    // 1. Missing project_id entirely
    const res1 = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: 'Orphaned work' }),
    });
    expect(res1.status).toBe(422);
    const body1 = await res1.json();
    expect(body1.error).toBe('Validation Error');
    expect(body1.field).toBe('project_id');

    // 2. null project_id
    const res2 = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: null }),
    });
    expect(res2.status).toBe(422);
    const body2 = await res2.json();
    expect(body2.error).toBe('Validation Error');

    // 3. empty string project_id
    const res3 = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: '   ' }),
    });
    expect(res3.status).toBe(422);

    // 4. empty JSON body {}
    const res4 = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res4.status).toBe(422);
  });

  // Issue 17: REGRESSION TEST
  it('test_invoice_generation_supports_special_characters', async () => {
    // 1. Create client with special characters: accents, ampersands, angle brackets, quotes
    const specialClientRes = await app.request('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'René & François <Holdings> "Global" SA',
        email: 'rene+test@francois-holdings.fr',
        company: 'Société & Co. <Paris>',
        hourly_rate: 185,
        address: '12 Rue de l\'Élysée <Bâtiment A & B>, 75008 Paris',
      }),
    });
    expect(specialClientRes.status).toBe(201);
    const specialClient = await specialClientRes.json();
    expect(specialClient.name).toBe('René & François <Holdings> "Global" SA');

    // 2. Create project for this client
    const specialProjectRes = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: specialClient.id,
        name: 'International & Secure Gateway <v2.0> "Alpha"',
        hourly_rate: 185,
      }),
    });
    expect(specialProjectRes.status).toBe(201);
    const specialProject = await specialProjectRes.json();

    // 3. Log a time entry
    const timerRes = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: specialProject.id,
        description: 'Audit of authentication flow & token parsing <OAuth2>',
      }),
    });
    expect(timerRes.status).toBe(201);
    const timer = await timerRes.json();

    // Stop timer
    await app.request('/api/timers/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: timer.id }),
    });

    // 4. Generate invoice
    const invoiceRes = await app.request('/api/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: specialProject.id,
        notes: 'Net 30 terms. Échéance: 30 jours & escompte 0% <Merci>!',
      }),
    });
    expect(invoiceRes.status).toBe(201);
    const invoice = await invoiceRes.json();

    // Verification:
    // A) JSON response preserves original Unicode characters accurately
    expect(invoice.client_name).toBe('René & François <Holdings> "Global" SA');
    expect(invoice.total_amount).toBeGreaterThan(0);

    // B) HTML preview is properly escaped (no unescaped <Holdings>, has &amp;, &lt;, &gt;)
    expect(invoice.html_preview).toBeDefined();
    expect(invoice.html_preview).toContain('René &amp; François &lt;Holdings&gt; &quot;Global&quot; SA');
    expect(invoice.html_preview).not.toContain('<Holdings>');
    expect(invoice.html_preview).toContain('&lt;Merci&gt;!');
  });
});
