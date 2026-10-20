import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { healthRouter } from './routes/health.js';
import { clientsRouter } from './routes/clients.js';
import { projectsRouter } from './routes/projects.js';
import { timersRouter } from './routes/timers.js';
import { invoicesRouter } from './routes/invoices.js';

export function createApp(): Hono {
  const app = new Hono();

  // Middleware
  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: '*',
      allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Error handling
  app.onError((err, c) => {
    console.error('Unhandled Application Error:', err);
    const status = (err as unknown as { status?: number }).status || 500;
    return c.json(
      {
        error: status === 422 ? 'Validation Error' : 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
      },
      status as any
    );
  });

  // Mount routes
  app.route('/', healthRouter);
  app.route('/', clientsRouter);
  app.route('/', projectsRouter);
  app.route('/', timersRouter);
  app.route('/', invoicesRouter);

  return app;
}
