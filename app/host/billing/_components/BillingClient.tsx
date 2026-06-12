'use client';

import { useState } from 'react';

const teal   = '#14B8A6';
const tealD  = '#0D9488';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const PLANS = {
  core: {
    name: 'Core',
    blurb: 'For hosts with up to 5 properties',
    monthly: 19, annual: 190, annualSave: 38,
    features: [
      'Guest portal with QR code',
      'House rules, Wi-Fi & local guide',
      'Flexible checkout requests',
      'Email confirmations',
      'Up to 5 properties',
    ],
  },
  pro: {
    name: 'Pro',
    blurb: 'For hosts with 5+ properties',
    monthly: 29, annual: 290, annualSave: 58,
    features: [
      'Everything in Core',
      'Unlimited properties',
      'Priority support',
    ],
  },
} as const;

type Tier = keyof typeof PLANS;

export type PayoutsState = 'none' | 'incomplete' | 'active';

type Props = {
  status: string | null;            // 'active' | 'past_due' | 'canceled' | null …
  plan: Tier | null;
  hasStripeCustomer: boolean;
  trialDaysLeft: number;            // negative = expired
  payouts: PayoutsState;
};

function StatusChip({ status, trialDaysLeft }: { status: string | null; trialDaysLeft: number }) {
  let label: string, color: string, bg: string;
  if (status === 'active') {
    label = 'Active'; color = '#5EEAD4'; bg = 'rgba(20,184,166,0.08)';
  } else if (status === 'past_due') {
    label = 'Payment failed'; color = '#FCA5A5'; bg = 'rgba(239,68,68,0.08)';
  } else if (trialDaysLeft > 0) {
    label = `Trial · ${trialDaysLeft} ${trialDaysLeft === 1 ? 'day' : 'days'} left`;
    color = trialDaysLeft <= 3 ? '#FCD34D' : '#5EEAD4';
    bg = trialDaysLeft <= 3 ? 'rgba(251,191,36,0.08)' : 'rgba(20,184,166,0.08)';
  } else {
    label = 'Trial ended'; color = '#FCD34D'; bg = 'rgba(251,191,36,0.08)';
  }
  return (
    <span style={{
      fontFamily: sans, fontSize: '12px', fontWeight: 500, color, background: bg,
      borderRadius: '100px', padding: '5px 14px', letterSpacing: '0.2px',
    }}>
      {label}
    </span>
  );
}

export default function BillingClient({ status, plan, hasStripeCustomer, trialDaysLeft, payouts }: Props) {
  const [billing, setBilling]   = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading]   = useState<string | null>(null); // tier, 'portal', or 'connect'
  const [error, setError]       = useState('');

  const isActive = status === 'active';

  async function connectPayouts() {
    setLoading('connect');
    setError('');
    try {
      const res = await fetch('/api/connect-stripe', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setLoading(null);
    }
  }

  async function subscribe(tier: Tier) {
    setLoading(tier);
    setError('');
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billing }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading('portal');
    setError('');
    try {
      const res = await fetch('/api/create-portal-session', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.url;
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
          Billing
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
          Manage your plan and payment details
        </p>
      </div>

      {/* Current status card */}
      <div style={{
        background: 'rgba(255,255,255,0.028)', border: `1px solid ${border}`,
        borderRadius: '16px', padding: '24px 28px', marginBottom: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: 'rgba(248,250,252,0.35)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Current plan
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: serif, fontSize: '24px', fontWeight: 400, color: white }}>
              {isActive && plan ? PLANS[plan].name : 'Free trial'}
            </span>
            <StatusChip status={status} trialDaysLeft={trialDaysLeft} />
          </div>
        </div>

        {hasStripeCustomer && (
          <button onClick={openPortal} disabled={loading === 'portal'} style={{
            fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal,
            background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.25)',
            borderRadius: '10px', padding: '10px 20px',
            cursor: loading === 'portal' ? 'not-allowed' : 'pointer',
            opacity: loading === 'portal' ? 0.6 : 1,
          }}>
            {loading === 'portal' ? 'Opening…' : 'Manage subscription'}
          </button>
        )}
      </div>

      {/* Payouts — where upsell money goes */}
      <div id="payouts" style={{
        background: payouts === 'active' ? 'rgba(20,184,166,0.03)' : 'rgba(251,191,36,0.03)',
        border: payouts === 'active' ? '1px solid rgba(20,184,166,0.15)' : '1px solid rgba(251,191,36,0.15)',
        borderRadius: '16px', padding: '24px 28px', marginBottom: '36px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: 'rgba(248,250,252,0.35)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Upsell payouts
            </span>
            {payouts === 'active' ? (
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: '#5EEAD4', background: 'rgba(20,184,166,0.08)', borderRadius: '100px', padding: '3px 10px' }}>
                ● Connected
              </span>
            ) : (
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: '#FCD34D', background: 'rgba(251,191,36,0.08)', borderRadius: '100px', padding: '3px 10px' }}>
                {payouts === 'incomplete' ? '● Setup unfinished' : '● Not set up'}
              </span>
            )}
          </div>
          <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: 0, lineHeight: 1.7 }}>
            {payouts === 'active'
              ? 'Approved guest upgrades pay out directly to your bank account through Stripe.'
              : <>Guest upgrade payments go <span style={{ color: white, fontWeight: 400 }}>straight to your bank</span> — but
                 only once you connect it through Stripe. Until then, guests can&apos;t pay for upgrades at your properties.</>}
          </p>
        </div>

        {payouts !== 'active' && (
          <button onClick={connectPayouts} disabled={loading === 'connect'} className="lift" style={{
            fontFamily: sans, fontSize: '14px', fontWeight: 600, color: white,
            background: loading === 'connect' ? 'rgba(20,184,166,0.4)' : `linear-gradient(135deg, ${tealD}, #10B981)`,
            border: 'none', borderRadius: '10px', padding: '12px 24px',
            cursor: loading === 'connect' ? 'not-allowed' : 'pointer',
            boxShadow: loading === 'connect' ? 'none' : '0 4px 20px rgba(13,148,136,0.25)',
            flexShrink: 0,
          }}>
            {loading === 'connect' ? 'Opening Stripe…' : payouts === 'incomplete' ? 'Finish payout setup' : 'Connect payouts'}
          </button>
        )}
      </div>

      {/* Monthly / Annual toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
        <div style={{
          display: 'inline-flex', background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${border}`, borderRadius: '12px', padding: '4px',
        }}>
          {(['monthly', 'annual'] as const).map(b => (
            <button key={b} onClick={() => setBilling(b)} style={{
              fontFamily: sans, fontSize: '13px', fontWeight: billing === b ? 600 : 400,
              color: billing === b ? white : muted,
              background: billing === b ? 'rgba(20,184,166,0.15)' : 'transparent',
              border: billing === b ? '1px solid rgba(20,184,166,0.3)' : '1px solid transparent',
              borderRadius: '9px', padding: '8px 22px', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {b === 'monthly' ? 'Monthly' : 'Annual'}
              {b === 'annual' && (
                <span style={{ marginLeft: '6px', fontSize: '11px', color: teal, fontWeight: 600 }}>
                  2 months free
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontFamily: sans, fontSize: '13px', color: '#FCA5A5', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {(Object.entries(PLANS) as [Tier, typeof PLANS[Tier]][]).map(([tier, p]) => {
          const isCurrent = isActive && plan === tier;
          const isPro     = tier === 'pro';
          const price     = billing === 'monthly' ? p.monthly : p.annual;

          return (
            <div key={tier} className="lift hairline-top" style={{
              background: isPro ? 'rgba(20,184,166,0.04)' : 'rgba(255,255,255,0.028)',
              border: isCurrent ? `1px solid ${teal}` : isPro ? '1px solid rgba(20,184,166,0.18)' : `1px solid ${border}`,
              borderRadius: '20px', padding: '32px 30px',
              display: 'flex', flexDirection: 'column', position: 'relative',
            }}>
              {isCurrent && (
                <span style={{
                  position: 'absolute', top: '16px', right: '16px',
                  fontFamily: sans, fontSize: '10px', fontWeight: 600, color: teal,
                  background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.25)',
                  borderRadius: '100px', padding: '3px 10px', letterSpacing: '0.6px', textTransform: 'uppercase',
                }}>
                  Current plan
                </span>
              )}

              <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: 400, color: white, marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, marginBottom: '24px' }}>{p.blurb}</div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontFamily: serif, fontSize: '42px', fontWeight: 400, color: white, lineHeight: 1 }}>${price}</span>
                <span style={{ fontFamily: sans, fontSize: '13px', color: muted }}>/{billing === 'monthly' ? 'month' : 'year'}</span>
              </div>
              <div style={{ fontFamily: sans, fontSize: '11px', color: billing === 'annual' ? teal : 'transparent', marginBottom: '24px', letterSpacing: '0.2px', minHeight: '14px' }}>
                {billing === 'annual' ? `Save $${p.annualSave} vs monthly` : '·'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px', flex: 1 }}>
                {p.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="14" height="14" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                      <path d="M2 6l3 3 5-5" stroke={teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: 'rgba(248,250,252,0.65)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <div style={{
                  textAlign: 'center', fontFamily: sans, fontSize: '13px', fontWeight: 500,
                  color: muted, border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px', padding: '13px',
                }}>
                  Your plan — manage above
                </div>
              ) : (
                <button onClick={() => (isActive ? openPortal() : subscribe(tier))} disabled={!!loading} style={{
                  fontFamily: sans, fontSize: '14px', fontWeight: 600, color: isPro ? white : teal,
                  background: isPro
                    ? (loading === tier ? 'rgba(20,184,166,0.4)' : `linear-gradient(135deg, ${tealD}, #10B981)`)
                    : 'transparent',
                  border: isPro ? 'none' : '1px solid rgba(20,184,166,0.35)',
                  borderRadius: '10px', padding: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: isPro && loading !== tier ? '0 4px 20px rgba(13,148,136,0.25)' : 'none',
                  opacity: loading && loading !== tier ? 0.5 : 1,
                }}>
                  {loading === tier ? 'Redirecting…' : isActive ? `Switch to ${p.name}` : `Start ${p.name}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: 'rgba(248,250,252,0.25)', textAlign: 'center', margin: '28px 0 0', lineHeight: 1.7 }}>
        Payments are processed securely by Stripe. Cancel anytime — your data stays saved.
      </p>
    </div>
  );
}
