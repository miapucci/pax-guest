'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '@/lib/supabase';
import type { Property } from './page';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const CARD_STYLE = {
  style: {
    base: {
      color: '#EDE6D3',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: 'rgba(237,230,211,0.2)' },
    },
    invalid: { color: '#F87171', iconColor: '#F87171' },
  },
};

type View =
  | 'home'
  | 'wifi'
  | 'checkin-guide'
  | 'house-rules'
  | 'video-guides'
  | 'local-guide'
  | 'late-checkout'
  | 'early-checkin'
  | 'checkout-ack';

// ── Design tokens ──────────────────────────────────────────────────────────────
const gold = '#C9A96E';
const g = (a: number) => `rgba(201,169,110,${a})`;   // gold with alpha
const w = (a: number) => `rgba(237,230,211,${a})`;   // warm ivory with alpha
const ivory = '#EDE6D3';
const serif = { fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif" };
const glassCard: React.CSSProperties = {
  background: 'rgba(255,248,240,0.028)',
  border: `1px solid ${g(0.1)}`,
};

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️', cafe: '☕', bar: '🍷', attraction: '🗺️', shopping: '🛍️', transport: '🚌',
};
const CATEGORY_LABEL: Record<string, string> = {
  food: 'Dining', cafe: 'Café', bar: 'Cocktails', attraction: 'Experiences', shopping: 'Shopping', transport: 'Transport',
};

// ── Root ───────────────────────────────────────────────────────────────────────

export default function GuestClient({ property }: { property: Property }) {
  const [view, setView] = useState<View>('home');

  return (
    <div style={{ backgroundColor: '#09080c', minHeight: '100dvh', color: ivory }}>
      {/* Warm ambient glows */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-180px', right: '-180px', width: '520px', height: '520px', borderRadius: '50%', background: `radial-gradient(circle, ${g(0.09)}, transparent 65%)` }} />
        <div style={{ position: 'absolute', top: '45%', left: '-200px', width: '420px', height: '420px', borderRadius: '50%', background: `radial-gradient(circle, ${g(0.05)}, transparent 65%)` }} />
        <div style={{ position: 'absolute', bottom: '-140px', right: '25%', width: '360px', height: '360px', borderRadius: '50%', background: `radial-gradient(circle, ${g(0.04)}, transparent 65%)` }} />
      </div>

      <div style={{ position: 'relative', maxWidth: '448px', margin: '0 auto' }}>
        {view === 'home'          && <HomeView property={property} setView={setView} />}
        {view === 'wifi'          && <InnerView onBack={() => setView('home')}><WifiView property={property} /></InnerView>}
        {view === 'checkin-guide' && <InnerView onBack={() => setView('home')}><CheckinGuideView property={property} /></InnerView>}
        {view === 'house-rules'   && <InnerView onBack={() => setView('home')}><HouseRulesView property={property} /></InnerView>}
        {view === 'video-guides'  && <InnerView onBack={() => setView('home')}><VideoGuidesView property={property} /></InnerView>}
        {view === 'local-guide'   && <InnerView onBack={() => setView('home')}><LocalGuideView property={property} /></InnerView>}
        {view === 'late-checkout' && <InnerView onBack={() => setView('home')}><UpsellView property={property} type="late_checkout" /></InnerView>}
        {view === 'early-checkin' && <InnerView onBack={() => setView('home')}><UpsellView property={property} type="early_checkin" /></InnerView>}
        {view === 'checkout-ack'  && <InnerView onBack={() => setView('home')}><CheckoutAckView property={property} /></InnerView>}
      </div>
    </div>
  );
}

// ── Inner view wrapper ────────────────────────────────────────────────────────

function InnerView({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div style={{ padding: '48px 24px 88px' }}>
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: w(0.32), fontSize: '13px', letterSpacing: '0.06em', marginBottom: '44px', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.color = w(0.65))}
        onMouseLeave={e => (e.currentTarget.style.color = w(0.32))}
      >
        <span style={{ fontSize: '16px', lineHeight: 1 }}>←</span>
        <span>Back</span>
      </button>
      {children}
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────────

function HomeView({ property, setView }: { property: Property; setView: (v: View) => void }) {
  const recs = property.local_recommendations ?? [];
  const videos = property.property_videos ?? [];

  return (
    <div>
      {/* Hero */}
      {property.cover_photo_url ? (
        <div style={{ position: 'relative', height: '62vw', maxHeight: '290px', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.cover_photo_url} alt={property.nickname}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #09080c 0%, rgba(9,8,12,0.55) 55%, rgba(9,8,12,0.05) 100%)' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px 28px' }}>
            <StatusPill />
            <h1 style={{ ...serif, fontSize: '2.5rem', fontWeight: 300, color: ivory, lineHeight: 1.08, margin: '14px 0 0', letterSpacing: '-0.01em' }}>
              {property.nickname}
            </h1>
            {property.address && (
              <p style={{ fontSize: '12px', color: w(0.38), marginTop: '6px', letterSpacing: '0.04em' }}>
                {property.address}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px 24px 32px' }}>
          <StatusPill />
          <h1 style={{ ...serif, fontSize: '3.2rem', fontWeight: 300, color: ivory, lineHeight: 1.05, margin: '18px 0 0', letterSpacing: '-0.02em' }}>
            {property.nickname}
          </h1>
          <div style={{ width: '40px', height: '1px', background: g(0.45), margin: '18px 0' }} />
          {property.address && (
            <p style={{ fontSize: '12px', color: w(0.35), letterSpacing: '0.05em' }}>
              📍 {property.address}
            </p>
          )}
        </div>
      )}

      {/* Welcome message */}
      {property.welcome_message && (
        <div style={{ margin: '0 20px 4px', padding: '22px 24px 20px', borderRadius: '20px', ...glassCard }}>
          <span style={{ ...serif, fontSize: '3.2rem', fontWeight: 400, color: g(0.4), lineHeight: 0.75, display: 'block', marginBottom: '10px' }}>
            &ldquo;
          </span>
          <p style={{ ...serif, fontSize: '1.05rem', fontStyle: 'italic', color: w(0.62), lineHeight: 1.7, fontWeight: 300 }}>
            {property.welcome_message}
          </p>
          <p style={{ fontSize: '10px', color: g(0.45), letterSpacing: '0.14em', marginTop: '16px', textTransform: 'uppercase', fontWeight: 500 }}>
            — Your Host
          </p>
        </div>
      )}

      {/* Nav cards */}
      <div style={{ padding: '20px 20px 88px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

        {(property.checkin_instructions || property.wifi_name || videos.length > 0) && (
          <SectionLabel>Arrival</SectionLabel>
        )}

        {property.checkin_instructions && (
          <NavCard onClick={() => setView('checkin-guide')} highlight>
            <CardIcon>🗝️</CardIcon>
            <CardBody title="Check-in Guide" sub="Step-by-step arrival instructions" />
            <GoldArrow />
          </NavCard>
        )}

        {property.wifi_name && (
          <NavCard onClick={() => setView('wifi')}>
            <CardIcon>📶</CardIcon>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: ivory, marginBottom: '3px' }}>Wi-Fi</div>
              <div style={{ fontSize: '12px', color: gold, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {property.wifi_name}
              </div>
            </div>
            <GoldArrow />
          </NavCard>
        )}

        {videos.length > 0 && (
          <NavCard onClick={() => setView('video-guides')}>
            <CardIcon>▶️</CardIcon>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: ivory, marginBottom: '3px' }}>Video Guides</div>
              <div style={{ fontSize: '12px', color: w(0.38) }}>
                {videos.length} short film{videos.length !== 1 ? 's' : ''} from your host
              </div>
            </div>
            <GoldArrow />
          </NavCard>
        )}

        {(property.house_rules || recs.length > 0) && (
          <SectionLabel>Your Stay</SectionLabel>
        )}

        {property.house_rules && (
          <NavCard onClick={() => setView('house-rules')}>
            <CardIcon>📋</CardIcon>
            <CardBody title="House Guidelines" sub="Please review before settling in" />
            <GoldArrow />
          </NavCard>
        )}

        {recs.length > 0 && (
          <NavCard onClick={() => setView('local-guide')}>
            <CardIcon>🗺️</CardIcon>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: ivory, marginBottom: '8px' }}>Local Guide</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {Array.from(new Set(recs.map(r => r.category))).slice(0, 3).map(cat => (
                  <span key={cat} style={{ fontSize: '11px', color: w(0.32), background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.1)}`, borderRadius: '99px', padding: '2px 8px' }}>
                    {CATEGORY_EMOJI[cat] ?? '📍'} {CATEGORY_LABEL[cat] ?? cat}
                  </span>
                ))}
                <span style={{ fontSize: '11px', color: w(0.2) }}>· {recs.length} picks</span>
              </div>
            </div>
            <GoldArrow />
          </NavCard>
        )}

        {(property.late_checkout_enabled || property.early_checkin_enabled) && (
          <SectionLabel>Upgrades</SectionLabel>
        )}

        {property.late_checkout_enabled && (
          <UpgradeCard
            onClick={() => setView('late-checkout')}
            emoji="🕐" title="Late Checkout" sub="Linger a little longer"
            price={property.late_checkout_price}
          />
        )}

        {property.early_checkin_enabled && (
          <UpgradeCard
            onClick={() => setView('early-checkin')}
            emoji="🔑" title="Early Check-in" sub="Arrive on your schedule"
            price={property.early_checkin_price}
          />
        )}

        <SectionLabel>Departure</SectionLabel>

        <NavCard onClick={() => setView('checkout-ack')}>
          <CardIcon>✅</CardIcon>
          <CardBody title="Checkout Confirmation" sub="Confirm your departure" />
          <GoldArrow />
        </NavCard>

        <p style={{ textAlign: 'center', fontSize: '11px', color: w(0.1), marginTop: '36px', letterSpacing: '0.08em' }}>
          Powered by Pax
        </p>
      </div>
    </div>
  );
}

// ── Check-in Guide ─────────────────────────────────────────────────────────────

function CheckinGuideView({ property }: { property: Property }) {
  const steps = (property.checkin_instructions ?? '').split('\n').map(s => s.trim()).filter(Boolean);
  return (
    <div>
      <PageHeader emoji="🗝️" title="Check-in Guide" sub="Your arrival, step by step" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', ...glassCard, borderRadius: '18px', padding: '18px 20px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: g(0.1), border: `1px solid ${g(0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
              <span style={{ ...serif, fontSize: '14px', fontWeight: 500, color: gold }}>{i + 1}</span>
            </div>
            <p style={{ fontSize: '14px', color: w(0.72), lineHeight: 1.65, paddingTop: '3px' }}>{step}</p>
          </div>
        ))}
      </div>
      <InfoNote>Having trouble? Contact your host through your booking platform.</InfoNote>
    </div>
  );
}

// ── House Rules ────────────────────────────────────────────────────────────────

function HouseRulesView({ property }: { property: Property }) {
  const rules = (property.house_rules ?? '').split('\n').map(r => r.trim()).filter(Boolean);
  return (
    <div>
      <PageHeader emoji="📋" title="House Guidelines" sub="We ask that you respect these during your stay" />
      <div style={{ borderRadius: '20px', overflow: 'hidden', ...glassCard }}>
        {rules.map((rule, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', borderBottom: i < rules.length - 1 ? `1px solid ${g(0.07)}` : 'none' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0, background: g(0.08), border: `1px solid ${g(0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: gold, marginTop: '2px' }}>✓</div>
            <p style={{ fontSize: '14px', color: w(0.68), lineHeight: 1.62 }}>{rule}</p>
          </div>
        ))}
      </div>
      <InfoNote>Thank you for treating this space with care.</InfoNote>
    </div>
  );
}

// ── Video Guides ───────────────────────────────────────────────────────────────

function VideoGuidesView({ property }: { property: Property }) {
  const videos = property.property_videos ?? [];
  return (
    <div>
      <PageHeader emoji="▶️" title="Video Guides" sub="Short films from your host" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {videos.map((v, i) => (
          <div key={i} style={{ borderRadius: '20px', overflow: 'hidden', border: `1px solid ${g(0.12)}`, background: '#000' }}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={v.url}
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', display: 'block', maxHeight: '260px', background: '#000' }}
            />
            <div style={{ padding: '14px 18px', background: 'rgba(255,248,240,0.02)' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: ivory }}>{v.title}</div>
            </div>
          </div>
        ))}
      </div>
      <InfoNote>Videos are hosted securely for your stay.</InfoNote>
    </div>
  );
}

// ── Local Guide ────────────────────────────────────────────────────────────────

function LocalGuideView({ property }: { property: Property }) {
  const recs = property.local_recommendations ?? [];
  const categories = ['all', ...Array.from(new Set(recs.map(r => r.category)))];
  const [active, setActive] = useState('all');
  const filtered = active === 'all' ? recs : recs.filter(r => r.category === active);

  return (
    <div>
      <PageHeader emoji="🗺️" title="Local Guide" sub="Curated favourites from your host" />
      {categories.length > 2 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActive(cat)}
              style={{ flexShrink: 0, fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: '99px', background: active === cat ? g(0.12) : 'rgba(255,248,240,0.04)', border: `1px solid ${active === cat ? g(0.3) : g(0.1)}`, color: active === cat ? gold : w(0.38), transition: 'all 0.15s', cursor: 'pointer' }}>
              {cat === 'all' ? 'All' : `${CATEGORY_EMOJI[cat] ?? '📍'} ${CATEGORY_LABEL[cat] ?? cat}`}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map((rec, i) => (
          <div key={i} style={{ ...glassCard, borderRadius: '18px', padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.1)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                {CATEGORY_EMOJI[rec.category] ?? '📍'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: ivory }}>{rec.name}</span>
                  <span style={{ fontSize: '10px', color: w(0.28), background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.1)}`, borderRadius: '99px', padding: '2px 8px', letterSpacing: '0.04em' }}>
                    {CATEGORY_LABEL[rec.category] ?? rec.category}
                  </span>
                </div>
                {rec.note && <p style={{ fontSize: '13px', color: w(0.4), lineHeight: 1.55 }}>{rec.note}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Wi-Fi ─────────────────────────────────────────────────────────────────────

function WifiView({ property }: { property: Property }) {
  const [copied, setCopied] = useState<'name' | 'pass' | null>(null);
  const copy = async (text: string, field: 'name' | 'pass') => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2200);
  };

  return (
    <div>
      <PageHeader emoji="📶" title="Wi-Fi Access" sub="Tap either field to copy" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {([
          { label: 'Network', value: property.wifi_name, field: 'name' as const },
          { label: 'Password', value: property.wifi_password, field: 'pass' as const },
        ]).map(({ label, value, field }) => (
          <button key={field} onClick={() => copy(value, field)}
            style={{ width: '100%', textAlign: 'left', padding: '22px 24px', borderRadius: '18px', ...glassCard, cursor: 'pointer', display: 'block', transition: 'border-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = g(0.25))}
            onMouseLeave={e => (e.currentTarget.style.borderColor = g(0.1))}
          >
            <div style={{ fontSize: '10px', color: w(0.22), letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '12px' }}>{label}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <span style={{ fontSize: '22px', fontWeight: 600, color: ivory, letterSpacing: '0.03em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: copied === field ? '#86EFAC' : gold, flexShrink: 0, letterSpacing: '0.06em', transition: 'color 0.2s' }}>
                {copied === field ? '✓ Copied' : 'Copy'}
              </span>
            </div>
          </button>
        ))}
      </div>
      <InfoNote>Having trouble? Forget the network on your device, then reconnect.</InfoNote>
    </div>
  );
}

// ── Upsell ────────────────────────────────────────────────────────────────────

function UpsellView({ property, type }: { property: Property; type: 'late_checkout' | 'early_checkin' }) {
  const isLate = type === 'late_checkout';
  const price = isLate ? property.late_checkout_price : property.early_checkin_price;
  const [step, setStep] = useState<'contact' | 'payment' | 'done'>('contact');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (step === 'done') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: g(0.1), border: `1px solid ${g(0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '28px' }}>✓</div>
        <h2 style={{ ...serif, fontSize: '2.2rem', fontWeight: 400, color: ivory, marginBottom: '6px' }}>Request received</h2>
        <div style={{ width: '32px', height: '1px', background: g(0.35), margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: w(0.42), lineHeight: 1.7, maxWidth: '270px' }}>
          Your host has been notified and will confirm shortly. You&apos;ll hear back at{' '}
          <span style={{ color: gold }}>{email}</span>.
        </p>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <Elements stripe={stripePromise}>
        <UpsellPaymentStep
          property={property} type={type} price={price}
          name={name} email={email} note={note}
          onBack={() => setStep('contact')}
          onSuccess={() => setStep('done')}
        />
      </Elements>
    );
  }

  // Step 1: contact info
  return (
    <div>
      <PageHeader
        emoji={isLate ? '🕐' : '🔑'}
        title={isLate ? 'Late Checkout' : 'Early Check-in'}
        sub={isLate ? 'Request extra time before you leave.' : 'Arrive before the standard check-in time.'}
      />

      <div style={{ borderRadius: '20px', padding: '22px 26px', background: g(0.06), border: `1px solid ${g(0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '12px', color: w(0.35), marginBottom: '5px', letterSpacing: '0.06em' }}>One-time upgrade fee</div>
          <div style={{ fontSize: '11px', color: w(0.2), letterSpacing: '0.03em' }}>Card held now · charged only if approved</div>
        </div>
        <span style={{ ...serif, fontSize: '3rem', fontWeight: 400, color: gold, lineHeight: 1 }}>${price}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <GuestField label="Your name" value={name} onChange={setName} placeholder="Jane Smith" />
        <GuestField label="Email address" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" />
        <GuestField label="Note (optional)" value={note} onChange={setNote}
          placeholder={isLate ? 'Requesting until 2pm if possible' : 'Arriving around 10am'} multiline />
      </div>

      {error && <p style={{ fontSize: '13px', color: '#F87171', marginBottom: '14px' }}>{error}</p>}

      <button
        onClick={() => {
          if (!name.trim() || !email.trim()) { setError('Please enter your name and email.'); return; }
          setError('');
          setStep('payment');
        }}
        style={{ width: '100%', padding: '17px', borderRadius: '16px', background: `linear-gradient(135deg, ${g(0.22)}, ${g(0.1)})`, border: `1px solid ${g(0.32)}`, color: gold, fontSize: '14px', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em' }}
      >
        Continue to Payment
      </button>
    </div>
  );
}

function UpsellPaymentStep({ property, type, price, name, email, note, onBack, onSuccess }: {
  property: Property; type: 'late_checkout' | 'early_checkin'; price: number;
  name: string; email: string; note: string;
  onBack: () => void; onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const isLate = type === 'late_checkout';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent (authorize only — no charge yet)
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId: property.id, type }),
      });
      const { clientSecret, error: apiError } = await res.json();
      if (apiError) { setError(apiError); setLoading(false); return; }

      // 2. Authorize card — holds funds, does NOT charge yet
      const cardEl = elements.getElement(CardElement);
      const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardEl!, billing_details: { name, email } },
      });
      if (stripeError) { setError(stripeError.message ?? 'Card declined.'); setLoading(false); return; }

      // 3. Record the request with the payment intent id
      const { error: dbError } = await supabase.from('upsell_requests').insert({
        property_id: property.id, type,
        guest_name: name.trim(), guest_email: email.trim(),
        note: note.trim() || null, status: 'pending',
        payment_intent_id: paymentIntent!.id,
        amount: paymentIntent!.amount,
      });
      if (dbError) { setError('Failed to submit. Please try again.'); setLoading(false); return; }

      onSuccess();
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', color: w(0.32), fontSize: '13px', letterSpacing: '0.06em', marginBottom: '36px', background: 'none', border: 'none', cursor: 'pointer' }}>
        <span style={{ fontSize: '16px' }}>←</span> Back
      </button>

      <PageHeader
        emoji={isLate ? '🕐' : '🔑'}
        title="Enter card details"
        sub="Your card is held now. You're only charged if your host approves."
      />

      {/* Summary */}
      <div style={{ borderRadius: '16px', padding: '16px 18px', ...glassCard, marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: ivory }}>{isLate ? 'Late Checkout' : 'Early Check-in'}</div>
          <div style={{ fontSize: '12px', color: w(0.35), marginTop: '2px' }}>{name} · {email}</div>
        </div>
        <span style={{ ...serif, fontSize: '1.8rem', fontWeight: 400, color: gold }}>${price}</span>
      </div>

      {/* Stripe card input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '10px', color: w(0.28), letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
          Card Details
        </label>
        <div style={{ background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.12)}`, borderRadius: '14px', padding: '14px 16px' }}>
          <CardElement options={CARD_STYLE} />
        </div>
      </div>

      {error && <p style={{ fontSize: '13px', color: '#F87171', marginBottom: '14px' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading || !stripe}
        style={{ width: '100%', padding: '17px', borderRadius: '16px', background: `linear-gradient(135deg, ${g(0.22)}, ${g(0.1)})`, border: `1px solid ${g(0.32)}`, color: gold, fontSize: '14px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading || !stripe ? 0.6 : 1, letterSpacing: '0.04em', transition: 'opacity 0.2s', marginBottom: '14px' }}>
        {loading ? 'Processing…' : `Request ${isLate ? 'Late Checkout' : 'Early Check-in'} · $${price}`}
      </button>

      <p style={{ textAlign: 'center', fontSize: '12px', color: w(0.28), letterSpacing: '0.02em' }}>
        🔒 Card authorized now · only charged if host approves
      </p>
    </div>
  );
}

// ── Checkout ───────────────────────────────────────────────────────────────────

function CheckoutAckView({ property }: { property: Property }) {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!agreed) { setError('Please confirm you have checked out.'); return; }
    setError(''); setLoading(true);
    const { error: dbError } = await supabase.from('checkout_acknowledgments').insert({
      property_id: property.id, guest_name: name.trim(), acknowledged_at: new Date().toISOString(),
    });
    setLoading(false);
    if (dbError) { setError('Something went wrong. Please try again.'); } else { setSubmitted(true); }
  };

  if (submitted) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingTop: '40px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: g(0.1), border: `1px solid ${g(0.25)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', marginBottom: '28px' }}>✓</div>
        <h2 style={{ ...serif, fontSize: '2.4rem', fontWeight: 300, color: ivory, marginBottom: '8px' }}>Safe travels</h2>
        <div style={{ width: '28px', height: '1px', background: g(0.4), margin: '0 auto 20px' }} />
        <p style={{ fontSize: '14px', color: w(0.4), lineHeight: 1.72, maxWidth: '260px', marginBottom: '48px' }}>
          Your departure has been recorded. It was a pleasure having you.
        </p>
        {property.review_url && (
          <a href={property.review_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '16px', background: g(0.08), border: `1px solid ${g(0.22)}`, color: gold, fontSize: '13px', fontWeight: 500, textDecoration: 'none', letterSpacing: '0.04em' }}>
            <span>⭐</span>
            Leave a review
            <span style={{ color: g(0.4), fontSize: '13px' }}>↗</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader emoji="✅" title="Checkout" sub="Please confirm your departure before you go." />

      <div style={{ borderRadius: '16px', padding: '16px 20px', ...glassCard, fontSize: '13px', color: w(0.3), lineHeight: 1.72, marginBottom: '28px' }}>
        By confirming checkout you acknowledge that you have vacated the property, removed all personal belongings, returned any keys or access cards, and left the property in the agreed condition.
      </div>

      <div style={{ marginBottom: '20px' }}>
        <GuestField label="Your full name" value={name} onChange={setName} placeholder="Jane Smith" />
      </div>

      <div onClick={() => setAgreed(!agreed)} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '28px', cursor: 'pointer' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, border: `1px solid ${agreed ? gold : w(0.18)}`, background: agreed ? g(0.14) : 'rgba(255,248,240,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'all 0.15s' }}>
          {agreed && <span style={{ color: gold, fontSize: '11px', fontWeight: 700 }}>✓</span>}
        </div>
        <span style={{ fontSize: '13px', color: w(0.48), lineHeight: 1.62 }}>
          I confirm I have fully checked out of {property.nickname}.
        </span>
      </div>

      {error && <p style={{ fontSize: '13px', color: '#F87171', marginBottom: '14px' }}>{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        style={{ width: '100%', padding: '17px', borderRadius: '16px', background: `linear-gradient(135deg, ${g(0.2)}, ${g(0.09)})`, border: `1px solid ${g(0.3)}`, color: gold, fontSize: '14px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, letterSpacing: '0.04em', transition: 'opacity 0.2s' }}>
        {loading ? 'Confirming…' : 'Confirm Checkout'}
      </button>
    </div>
  );
}

// ── Design system ─────────────────────────────────────────────────────────────

function StatusPill() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: g(0.1), border: `1px solid ${g(0.25)}`, borderRadius: '99px', padding: '5px 13px' }}>
      <span className="gold-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: gold, display: 'block', flexShrink: 0 }} />
      <span style={{ fontSize: '11px', fontWeight: 500, color: gold, letterSpacing: '0.1em' }}>YOUR STAY</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '10px 0 4px' }}>
      <div style={{ width: '2px', height: '14px', background: g(0.4), borderRadius: '1px', flexShrink: 0 }} />
      <span style={{ fontSize: '10px', fontWeight: 600, color: g(0.48), letterSpacing: '0.18em', textTransform: 'uppercase' }}>{children}</span>
      <div style={{ flex: 1, height: '1px', background: g(0.07) }} />
    </div>
  );
}

function NavCard({ onClick, highlight, children }: { onClick: () => void; highlight?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '18px', background: highlight ? g(0.05) : 'rgba(255,248,240,0.025)', border: `1px solid ${highlight ? g(0.18) : g(0.09)}`, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = g(0.26); e.currentTarget.style.background = 'rgba(255,248,240,0.04)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = highlight ? g(0.18) : g(0.09); e.currentTarget.style.background = highlight ? g(0.05) : 'rgba(255,248,240,0.025)'; }}
    >
      {children}
    </button>
  );
}

function UpgradeCard({ onClick, emoji, title, sub, price }: { onClick: () => void; emoji: string; title: string; sub: string; price: number }) {
  return (
    <button onClick={onClick}
      style={{ width: '100%', textAlign: 'left', padding: '18px 20px', borderRadius: '20px', background: g(0.06), border: `1px solid ${g(0.17)}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'border-color 0.2s, background 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = g(0.3); e.currentTarget.style.background = g(0.09); }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = g(0.17); e.currentTarget.style.background = g(0.06); }}
    >
      <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: g(0.1), border: `1px solid ${g(0.2)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
        {emoji}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: ivory, marginBottom: '3px' }}>{title}</div>
        <div style={{ fontSize: '12px', color: w(0.36) }}>{sub}</div>
      </div>
      <div style={{ ...serif, fontSize: '1.7rem', fontWeight: 400, color: gold, background: g(0.1), border: `1px solid ${g(0.22)}`, borderRadius: '12px', padding: '4px 14px', flexShrink: 0, lineHeight: 1.4 }}>
        ${price}
      </div>
    </button>
  );
}

function CardIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '13px', background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.1)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
      {children}
    </div>
  );
}

function CardBody({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 500, color: ivory, marginBottom: '3px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: w(0.36) }}>{sub}</div>
    </div>
  );
}

function GoldArrow() {
  return <span style={{ color: g(0.35), fontSize: '22px', flexShrink: 0, lineHeight: 1 }}>›</span>;
}

function PageHeader({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: '36px' }}>
      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: g(0.08), border: `1px solid ${g(0.18)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', marginBottom: '22px' }}>
        {emoji}
      </div>
      <h2 style={{ ...serif, fontSize: '2.2rem', fontWeight: 400, color: ivory, lineHeight: 1.12, marginBottom: '8px', letterSpacing: '-0.01em' }}>
        {title}
      </h2>
      <p style={{ fontSize: '13px', color: w(0.38), lineHeight: 1.55, letterSpacing: '0.02em' }}>{sub}</p>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: '28px', borderRadius: '14px', padding: '14px 18px', ...glassCard }}>
      <p style={{ fontSize: '12px', color: w(0.26), lineHeight: 1.65, textAlign: 'center', letterSpacing: '0.02em' }}>{children}</p>
    </div>
  );
}

function GuestField({ label, value, onChange, placeholder, type = 'text', multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: 'rgba(255,248,240,0.04)', border: `1px solid ${g(0.12)}`,
    borderRadius: '14px', padding: '13px 16px', color: ivory, fontSize: '14px',
    fontFamily: 'inherit', boxSizing: 'border-box',
  };
  return (
    <div>
      <label style={{ display: 'block', fontSize: '10px', color: w(0.28), letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ ...base, resize: 'none' }} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />
      }
    </div>
  );
}
