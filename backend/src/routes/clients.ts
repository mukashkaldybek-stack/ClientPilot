import { Hono } from 'hono';
import { getStore } from '../store/index.js';

export const clientsRouter = new Hono();

// GET /api/clients
clientsRouter.get('/api/clients', async (c) => {
  const store = getStore();
  const clients = await store.getClients();
  return c.json(clients);
});

// GET /api/clients/:id
clientsRouter.get('/api/clients/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const client = await store.getClient(id);
  if (!client) {
    return c.json({ error: `Client with id '${id}' not found` }, 404);
  }
  return c.json(client);
});

// POST /api/clients
clientsRouter.post('/api/clients', async (c) => {
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return c.json({ error: 'Validation Error', field: 'name', message: 'name is required' }, 400);
  }
  if (!body.email || typeof body.email !== 'string' || !body.email.includes('@')) {
    return c.json({ error: 'Validation Error', field: 'email', message: 'valid email is required' }, 400);
  }

  const newClient = await store.createClient({
    name: body.name.trim(),
    email: body.email.trim(),
    company: typeof body.company === 'string' ? body.company : undefined,
    hourly_rate: typeof body.hourly_rate === 'number' ? body.hourly_rate : undefined,
    currency: typeof body.currency === 'string' ? body.currency : undefined,
    address: typeof body.address === 'string' ? body.address : undefined,
  });

  return c.json(newClient, 201);
});

// PATCH /api/clients/:id
clientsRouter.patch('/api/clients/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const updated = await store.updateClient(id, body as Record<string, unknown>);
  if (!updated) {
    return c.json({ error: `Client with id '${id}' not found` }, 404);
  }
  return c.json(updated);
});

// DELETE /api/clients/:id
clientsRouter.delete('/api/clients/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const success = await store.deleteClient(id);
  if (!success) {
    return c.json({ error: `Client with id '${id}' not found` }, 404);
  }
  return c.json({ success: true });
});
