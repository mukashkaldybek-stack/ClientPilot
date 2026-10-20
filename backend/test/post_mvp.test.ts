import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../src/app.js';
import { usePrismaStore, getStore } from '../src/store/index.js';
import { PrismaStore } from '../src/store/prismaStore.js';

describe('ClientPilot Post-MVP Test Suite (Issues 18, 19, 20)', () => {
  let app: ReturnType<typeof createApp>;
  let authApp: ReturnType<typeof createApp>;
  let prismaStore: PrismaStore;

  beforeAll(async () => {
    usePrismaStore();
    app = createApp();
    authApp = createApp({ enableAuth: true });
    prismaStore = new PrismaStore();
  });

  // ==========================================
  // ISSUE 18: CI Pipeline & Vercel Auto-deploy
  // ==========================================
  describe('Issue 18: CI Pipeline & Vercel Configuration', () => {
    it('verifies CI workflow configuration exists with required gates', () => {
      const ciPath = path.resolve(__dirname, '../../.github/workflows/ci.yml');
      expect(fs.existsSync(ciPath)).toBe(true);
      const ciContent = fs.readFileSync(ciPath, 'utf8');
      expect(ciContent).toContain('npx prisma validate');
      expect(ciContent).toContain('npm test');
      expect(ciContent).toContain('npm run build:frontend');
      expect(ciContent).toContain('actions/checkout@v4');
    });

    it('verifies vercel.json exists for preview and production auto-deployment', () => {
      const vercelPath = path.resolve(__dirname, '../../vercel.json');
      expect(fs.existsSync(vercelPath)).toBe(true);
      const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
      expect(vercelConfig.framework).toBe('nextjs');
      expect(vercelConfig.rootDirectory).toBe('frontend');
    });
  });

  // ==========================================
  // ISSUE 19: Stripe B2B Subscriptions
  // ==========================================
  describe('Issue 19: Stripe B2B Subscriptions', () => {
    const testBizId = `biz-stripe-test-${Date.now()}`;

    it('GET /api/subscription returns Starter, Pro, and Agency tiers', async () => {
      const res = await app.request('/api/subscription', {
        headers: { 'x-business-id': testBizId },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.available_tiers.Starter.price).toBe(12);
      expect(data.available_tiers.Pro.price).toBe(29);
      expect(data.available_tiers.Agency.price).toBe(79);
      expect(data.subscription.tier).toBe('Starter');
      expect(data.subscription.status).toBe('active');
    });

    it('POST /api/subscription/checkout creates session URL and rejects invalid tiers', async () => {
      // Invalid tier
      const invalidRes = await app.request('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'EnterpriseUltra' }),
      });
      expect(invalidRes.status).toBe(400);

      // Valid Pro tier checkout
      const validRes = await app.request('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': testBizId,
        },
        body: JSON.stringify({ tier: 'Pro' }),
      });
      expect(validRes.status).toBe(200);
      const session = await validRes.json();
      expect(session.session_id).toContain('cs_test_');
      expect(session.checkout_url).toContain('https://checkout.stripe.com');
      expect(session.tier.name).toBe('Pro');
    });

    it('POST /api/subscription/webhook synchronizes webhook event to SQLite', async () => {
      const webhookPayload = {
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: 'cus_test_998877',
            subscription: 'sub_test_112233',
            metadata: {
              businessId: testBizId,
              tier: 'Agency',
            },
          },
        },
      };

      const res = await app.request('/api/subscription/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.received).toBe(true);
      expect(body.subscription.tier).toBe('Agency');
      expect(body.subscription.stripeCustomerId).toBe('cus_test_998877');

      // Verify persistence in SQLite
      const subRes = await app.request('/api/subscription', {
        headers: { 'x-business-id': testBizId },
      });
      const subData = await subRes.json();
      expect(subData.subscription.tier).toBe('Agency');
      expect(subData.subscription.status).toBe('active');
    });

    it('GET /api/subscription/portal returns customer billing portal', async () => {
      const res = await app.request('/api/subscription/portal', {
        headers: { 'x-business-id': testBizId },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.portal_url).toContain('https://billing.stripe.com');
    });
  });

  // ==========================================
  // ISSUE 20: Multi-Tenant Authentication & Row-Level Isolation
  // ==========================================
  describe('Issue 20: Multi-Tenant Authentication & Row-Level Isolation', () => {
    it('unauthenticated request receives 401 Unauthorized', async () => {
      const res = await authApp.request('/api/clients');
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.error).toBe('Unauthorized');
      expect(body.message).toContain('Authentication required');
    });

    it('authenticated request with Bearer token passes auth', async () => {
      const res = await authApp.request('/api/clients', {
        headers: { Authorization: 'Bearer biz-auth-test-token' },
      });
      expect(res.status).toBe(200);
    });

    it('two test businesses see only their own data (row-level isolation)', async () => {
      const bizA = 'biz-alpha-workspace';
      const bizB = 'biz-beta-workspace';

      // 1. Business A creates a client
      const clientA = await prismaStore.createClient(
        {
          name: 'Client Alpha Corporation',
          email: 'accounts@alphacorp.com',
          hourly_rate: 200,
        },
        bizA
      );
      expect(clientA.name).toBe('Client Alpha Corporation');

      // 2. Business B creates a client
      const clientB = await prismaStore.createClient(
        {
          name: 'Client Beta Enterprise',
          email: 'accounts@betaent.com',
          hourly_rate: 180,
        },
        bizB
      );
      expect(clientB.name).toBe('Client Beta Enterprise');

      // 3. Query Business A clients: Must see Client Alpha, must NOT see Client Beta
      const listA = await prismaStore.getClients(bizA);
      expect(listA.some((c) => c.name === 'Client Alpha Corporation')).toBe(true);
      expect(listA.some((c) => c.name === 'Client Beta Enterprise')).toBe(false);

      // 4. Query Business B clients: Must see Client Beta, must NOT see Client Alpha
      const listB = await prismaStore.getClients(bizB);
      expect(listB.some((c) => c.name === 'Client Beta Enterprise')).toBe(true);
      expect(listB.some((c) => c.name === 'Client Alpha Corporation')).toBe(false);

      // 5. Cross-tenant access attempt: Business A cannot access Client B by ID
      const crossAttempt = await prismaStore.getClient(clientB.id, bizA);
      expect(crossAttempt).toBeNull();
    });
  });
});
