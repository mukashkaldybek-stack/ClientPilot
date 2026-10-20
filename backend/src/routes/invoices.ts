import { Hono } from 'hono';
import { getStore } from '../store/index.js';

export const invoicesRouter = new Hono();

// GET /api/invoices
invoicesRouter.get('/api/invoices', async (c) => {
  const store = getStore();
  const invoices = await store.getInvoices();
  return c.json(invoices);
});

// GET /api/invoices/:id
invoicesRouter.get('/api/invoices/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const invoice = await store.getInvoice(id);
  if (!invoice) {
    return c.json({ error: `Invoice with id '${id}' not found` }, 404);
  }
  return c.json(invoice);
});

// GET /api/invoices/:id/html
invoicesRouter.get('/api/invoices/:id/html', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const invoice = await store.getInvoice(id);
  if (!invoice || !invoice.html_preview) {
    return c.text('Invoice not found', 404);
  }
  return c.html(invoice.html_preview);
});

// POST /api/invoices/generate
invoicesRouter.post('/api/invoices/generate', async (c) => {
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.project_id || typeof body.project_id !== 'string') {
    return c.json(
      { error: 'Validation Error', field: 'project_id', message: 'project_id is required' },
      400
    );
  }

  try {
    const invoice = await store.generateInvoice({
      project_id: body.project_id.trim(),
      notes: typeof body.notes === 'string' ? body.notes : undefined,
      due_days: typeof body.due_days === 'number' ? body.due_days : undefined,
    });
    return c.json(invoice, 201);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status || 500;
    return c.json({ error: (err as Error).message }, status as any);
  }
});

// PATCH /api/invoices/:id/status
invoicesRouter.patch('/api/invoices/:id/status', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const validStatuses = ['draft', 'sent', 'paid'];
  if (!body.status || !validStatuses.includes(body.status as string)) {
    return c.json(
      { error: 'Invalid status. Must be one of: draft, sent, paid' },
      400
    );
  }

  const updated = await store.updateInvoiceStatus(
    id,
    body.status as 'draft' | 'sent' | 'paid'
  );
  if (!updated) {
    return c.json({ error: `Invoice with id '${id}' not found` }, 404);
  }
  return c.json(updated);
});
