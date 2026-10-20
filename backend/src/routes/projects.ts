import { Hono } from 'hono';
import { getStore } from '../store/index.js';

export const projectsRouter = new Hono();

// GET /api/projects
projectsRouter.get('/api/projects', async (c) => {
  const clientId = c.req.query('clientId');
  const store = getStore();
  const projects = await store.getProjects(clientId);
  return c.json(projects);
});

// GET /api/projects/:id
projectsRouter.get('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const project = await store.getProject(id);
  if (!project) {
    return c.json({ error: `Project with id '${id}' not found` }, 404);
  }
  return c.json(project);
});

// POST /api/projects
projectsRouter.post('/api/projects', async (c) => {
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.client_id || typeof body.client_id !== 'string' || body.client_id.trim() === '') {
    return c.json(
      { error: 'Validation Error', field: 'client_id', message: 'client_id is required' },
      400
    );
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    return c.json(
      { error: 'Validation Error', field: 'name', message: 'name is required' },
      400
    );
  }

  try {
    const newProject = await store.createProject({
      client_id: body.client_id.trim(),
      name: body.name.trim(),
      description: typeof body.description === 'string' ? body.description : undefined,
      hourly_rate: typeof body.hourly_rate === 'number' ? body.hourly_rate : undefined,
      status: body.status as 'active' | 'in_review' | 'completed' | undefined,
    });
    return c.json(newProject, 201);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

// PATCH /api/projects/:id
projectsRouter.patch('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  let body: Record<string, unknown>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  try {
    const updated = await store.updateProject(id, body as Record<string, unknown>);
    if (!updated) {
      return c.json({ error: `Project with id '${id}' not found` }, 404);
    }
    return c.json(updated);
  } catch (err) {
    return c.json({ error: (err as Error).message }, 400);
  }
});

// DELETE /api/projects/:id
projectsRouter.delete('/api/projects/:id', async (c) => {
  const id = c.req.param('id');
  const store = getStore();
  const success = await store.deleteProject(id);
  if (!success) {
    return c.json({ error: `Project with id '${id}' not found` }, 404);
  }
  return c.json({ success: true });
});
