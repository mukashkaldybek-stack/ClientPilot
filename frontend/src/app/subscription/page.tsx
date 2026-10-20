'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface TierInfo {
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
}

export default function SubscriptionPage() {
  const [currentTier, setCurrentTier] = useState<string>('Starter');
  const [status, setStatus] = useState<string>('active');
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  const tiers: Record<string, TierInfo> = {
    Starter: {
      name: 'Starter',
      price: 12,
      currency: 'USD',
      interval: 'month',
      features: [
        'Up to 5 Active Clients',
        'Standard Real-Time Timer',
        'Itemized Invoice PDF Export',
        'Local SQLite Backup',
      ],
    },
    Pro: {
      name: 'Pro',
      price: 29,
      currency: 'USD',
      interval: 'month',
      features: [
        'Unlimited Clients & Projects',
        'Automated Unbilled Hours Sync',
        'Custom Invoice Branding & Terms',
        'Multi-Currency Support',
        'Priority SLA Support',
      ],
    },
    Agency: {
      name: 'Agency',
      price: 79,
      currency: 'USD',
      interval: 'month',
      features: [
        'Multi-Tenant Workspaces',
        'Multiple Consultant Seats',
        'Custom Domain & Stripe Portal',
        'Dedicated API Access',
        'Automated Tax Reports',
      ],
    },
  };

  useEffect(() => {
    fetch('http://localhost:3001/api/subscription', {
      headers: { 'x-business-id': 'default-biz' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) {
          setCurrentTier(data.subscription.tier);
          setStatus(data.subscription.status);
        }
      })
      .catch(() => {});
  }, []);

  const handleCheckout = async (tierName: string) => {
    setCheckoutLoading(tierName);
    try {
      const res = await fetch('http://localhost:3001/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-business-id': 'default-biz',
        },
        body: JSON.stringify({ tier: tierName }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        alert(
          `[Stripe Test Mode]\nRedirecting to Stripe Checkout for ${tierName} plan ($${tiers[tierName].price}/mo).\nSession: ${data.session_id}`
        );
        setCurrentTier(tierName);
      }
    } catch {
      alert('Unable to initiate checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          B2B Subscription Management
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          Plans & Monetization
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Scale your freelance advisory practice. Upgrade anytime with seamless Stripe integration.
        </p>
      </div>

      {/* Current Plan Banner */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            Current Workspace Subscription
          </span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className="text-xl font-bold text-white">{currentTier} Plan</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
              {status}
            </span>
          </div>
        </div>

        <a
          href="http://localhost:3001/api/subscription/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 w-fit"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Stripe Billing Portal
        </a>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(tiers).map(([key, tier]) => {
          const isCurrent = currentTier === key;
          const isPopular = key === 'Pro';

          return (
            <div
              key={key}
              className={`relative bg-[#131b2e] rounded-2xl p-6 flex flex-col justify-between transition-all border ${
                isPopular
                  ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'border-[#1e293b] hover:border-slate-700'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  <span className="text-xs text-slate-400">Billed monthly</span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black font-mono text-white">
                    ${tier.price}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#1e293b]/60">
                  {tier.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-[#1e293b]/60">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold cursor-default"
                  >
                    Current Plan
                  </button>
                ) : (
                  <button
                    onClick={() => handleCheckout(key)}
                    disabled={checkoutLoading === key}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isPopular
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    {checkoutLoading === key ? 'Opening Stripe...' : `Upgrade to ${tier.name}`}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
