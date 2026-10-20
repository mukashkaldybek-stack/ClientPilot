import { serve } from '@hono/node-server';
import { createApp } from './app.js';

const app = createApp();
const port = parseInt(process.env.PORT || '3001', 10);

console.log(`Starting ClientPilot API server on port ${port}...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`⚡ ClientPilot API listening on http://localhost:${info.port}`);
  }
);
