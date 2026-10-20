import { describe, it, expect, beforeEach } from 'vitest';
import { createApp } from '../src/app.js';
import { setStore } from '../src/store/index.js';
import { InMemoryStore } from '../src/store/inMemoryStore.js';

describe('ClientPilot In-Memory API Test Suite', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(() => {
    // Reset store before each test
    setStore(new InMemoryStore());
    app = createApp();
  });

  it('GET /health returns 200 OK', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('ClientPilot API');
  });

  it('GET /api/clients returns client list', async () => {
    const res = await app.request('/api/clients');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it('POST /api/clients creates a new client and handles validation', async () => {
    // Invalid request
    const invalidRes = await app.request('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    expect(invalidRes.status).toBe(400);

    // Valid request
    const validRes = await app.request('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Starlight Tech Inc',
        email: 'accounts@starlight.io',
        hourly_rate: 160,
      }),
    });
    expect(validRes.status).toBe(201);
    const newClient = await validRes.json();
    expect(newClient.name).toBe('Starlight Tech Inc');
    expect(newClient.hourly_rate).toBe(160);
  });

  it('GET and POST /api/projects works and enforces client relationship', async () => {
    // Invalid clientId
    const invalidRes = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'non_existent_client',
        name: 'New Platform',
      }),
    });
    expect(invalidRes.status).toBe(400);

    // Valid project
    const validRes = await app.request('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: 'cli_1',
        name: 'Kubernetes Cluster Deployment',
        hourly_rate: 175,
      }),
    });
    expect(validRes.status).toBe(201);
    const project = await validRes.json();
    expect(project.name).toBe('Kubernetes Cluster Deployment');
    expect(project.client_id).toBe('cli_1');
  });

  it('POST /api/timers/start and /api/timers/stop tracks work', async () => {
    // Start timer
    const startRes = await app.request('/api/timers/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: 'prj_1',
        description: 'Terraform configuration',
      }),
    });
    expect(startRes.status).toBe(201);
    const timer = await startRes.json();
    expect(timer.is_active).toBe(true);
    expect(timer.project_id).toBe('prj_1');

    // Stop timer
    const stopRes = await app.request('/api/timers/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: timer.id }),
    });
    expect(stopRes.status).toBe(200);
    const stoppedTimer = await stopRes.json();
    expect(stoppedTimer.is_active).toBe(false);
  });

  it('POST /api/invoices/generate calculates total from time entries', async () => {
    const res = await app.request('/api/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: 'prj_1',
        notes: 'Thank you for your business.',
      }),
    });
    expect(res.status).toBe(201);
    const invoice = await res.json();
    expect(invoice.project_id).toBe('prj_1');
    expect(invoice.total_amount).toBeGreaterThan(0);
    expect(invoice.line_items.length).toBeGreaterThan(0);
  });
});
