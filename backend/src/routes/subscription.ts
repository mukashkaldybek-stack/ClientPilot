import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';

export const subscriptionRouter = new Hono();
const prisma = new PrismaClient();

export const SUBSCRIPTION_TIERS = {
  Starter: {
    id: 'starter',
    name: 'Starter',
    price: 12,
    currency: 'USD',
    interval: 'month',
    features: ['Up to 5 Active Clients', 'Standard Time Tracking', 'PDF Invoice Export'],
  },
  Pro: {
    id: 'pro',
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: ['Unlimited Clients & Projects', 'Priority Support', 'Custom Invoice Branding'],
  },
  Agency: {
    id: 'agency',
    name: 'Agency',
    price: 79,
    currency: 'USD',
    interval: 'month',
    features: ['Multi-tenant Teams', 'API Access', 'Dedicated Account Manager'],
  },
};

// GET /api/subscription - Return current workspace subscription & plans
subscriptionRouter.get('/api/subscription', async (c) => {
  const businessId = c.req.header('x-business-id') || 'default-biz';

  let sub = await prisma.subscription.findUnique({
    where: { businessId },
  });

  if (!sub) {
    sub = await prisma.subscription.create({
      data: {
        businessId,
        tier: 'Starter',
        status: 'active',
      },
    });
  }

  return c.json({
    subscription: sub,
    available_tiers: SUBSCRIPTION_TIERS,
  });
});

// POST /api/subscription/checkout - Initiate test-mode checkout session
subscriptionRouter.post('/api/subscription/checkout', async (c) => {
  const businessId = c.req.header('x-business-id') || 'default-biz';
  let body: { tier?: string } = {};

  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  const tier = body.tier as keyof typeof SUBSCRIPTION_TIERS;
  if (!tier || !SUBSCRIPTION_TIERS[tier]) {
    return c.json(
      { error: 'Invalid tier. Must be one of: Starter, Pro, Agency' },
      400
    );
  }

  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const checkoutUrl = `https://checkout.stripe.com/pay/${sessionId}#test_mode`;

  return c.json({
    session_id: sessionId,
    checkout_url: checkoutUrl,
    tier: SUBSCRIPTION_TIERS[tier],
    mode: 'subscription',
    status: 'open',
  });
});

// POST /api/subscription/webhook - Process incoming Stripe webhook events
subscriptionRouter.post('/api/subscription/webhook', async (c) => {
  let event: { type?: string; data?: { object?: Record<string, unknown> } };

  try {
    event = await c.req.json();
  } catch {
    return c.json({ error: 'Webhook payload required' }, 400);
  }

  const businessId = (event.data?.object?.metadata as Record<string, string>)?.businessId || 'default-biz';
  const tier = (event.data?.object?.metadata as Record<string, string>)?.tier || 'Pro';
  const customerId = (event.data?.object?.customer as string) || `cus_${Date.now()}`;
  const subId = (event.data?.object?.subscription as string) || `sub_${Date.now()}`;

  if (event.type === 'checkout.session.completed' || event.type === 'customer.subscription.updated') {
    const updated = await prisma.subscription.upsert({
      where: { businessId },
      update: {
        tier,
        status: 'active',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
      create: {
        businessId,
        tier,
        status: 'active',
        stripeCustomerId: customerId,
        stripeSubscriptionId: subId,
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
      },
    });

    return c.json({ received: true, subscription: updated });
  }

  if (event.type === 'customer.subscription.deleted') {
    const updated = await prisma.subscription.update({
      where: { businessId },
      data: { status: 'canceled' },
    });
    return c.json({ received: true, subscription: updated });
  }

  return c.json({ received: true, message: 'Unhandled event type' });
});

// GET /api/subscription/portal - Customer billing portal
subscriptionRouter.get('/api/subscription/portal', async (c) => {
  const businessId = c.req.header('x-business-id') || 'default-biz';
  return c.json({
    portal_url: `https://billing.stripe.com/p/session/test_${businessId}`,
  });
});
