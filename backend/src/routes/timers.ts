import { Hono } from 'hono';
import { getStore } from '../store/index.js';

export const timersRouter = new Hono();

// GET /api/timers
timersRouter.get('/api/timers', async (c) => {
  const projectId = c.req.query('projectId');
  const store = getStore();
  const timers = await store.getTimers(projectId);
  return c.json(timers);
});

// POST /api/timers/start
timersRouter.post('/api/timers/start', async (c) => {
  const store = getStore();
  let body: Record<string, unknown> = {};

  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { error: 'Validation Error', field: 'project_id', message: 'project_id is required' },
      422
    );
  }

  // Robust validation: project_id must exist and be non-empty string
  if (
    body === null ||
    typeof body !== 'object' ||
    !('project_id' in body) ||
    body.project_id === null ||
    body.project_id === undefined ||
    typeof body.project_id !== 'string' ||
    body.project_id.trim() === ''
  ) {
    return c.json(
      {
        error: 'Validation Error',
        field: 'project_id',
        message: 'project_id is required to start a timer',
      },
      422
    );
  }

  try {
    const timer = await store.startTimer({
      project_id: body.project_id.trim(),
      description: typeof body.description === 'string' ? body.description : undefined,
    });
    return c.json(timer, 201);
  } catch (err: unknown) {
    const status = (err as { status?: number }).status || 500;
    return c.json(
      {
        error: status === 422 ? 'Validation Error' : 'Internal Server Error',
        message: (err as Error).message,
        field: (err as { field?: string }).field,
      },
      status as any
    );
  }
});

// POST /api/timers/stop
timersRouter.post('/api/timers/stop', async (c) => {
  const store = getStore();
  let body: { id?: string } = {};
  try {
    body = await c.req.json();
  } catch {
    // Body is optional for stop
  }

  const stopped = await store.stopTimer(body.id);
  if (!stopped) {
    return c.json({ error: 'No active timer found to stop' }, 404);
  }
  return c.json(stopped);
});

// DELETE /api/timers/:id
timersRouter.delete('/api/timers/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const success = await store.deleteTimer(id);
  if (!success) {
    return c.json({ error: `Timer entry with id '${id}' not found` }, 404);
  }
  return c.json({ success: true });
});
