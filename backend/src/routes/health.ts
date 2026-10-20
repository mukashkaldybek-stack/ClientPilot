import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'ClientPilot API',
    timestamp: new Date().toISOString(),
  });
});
