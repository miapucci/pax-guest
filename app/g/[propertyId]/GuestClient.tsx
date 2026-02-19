'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Property } from './page';

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

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍽️', cafe: '☕', bar: '🍷', attraction: '🗺️', shopping: '🛍️', transport: '🚌',
};
const CATEGORY_LABEL: Record<string, string> = {
  food: 'Food', cafe: 'Cafe', bar: 'Bar', attraction: 'Attraction', shopping: 'Shopping', transport: 'Transport',
};

export default function GuestClient({ property }: { property: Property }) {
  const [view, setView] = useState<View>('home');

  return (
    <div className="min-h-dvh bg-[#0a0b0f] text-[#F8FAFC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-teal-500/6 blur-[80px]" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 rounded-full bg-emerald-500/5 blur-[80px]" />
        <div className="absolute -bottom-32 right-1/4 w-80 h-80 rounded-full bg-teal-600/4 blur-[80px]" />
      </div>

      <div className="relative max-w-md mx-auto">
        {view === 'home'          && <HomeView          property={property} setView={setView} />}
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

// ── Shared wrapper ─────────────────────────────────────────────────────────────

function InnerView({ onBack, children }: { onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="px-5 pt-12 pb-16">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/35 mb-8 hover:text-white/60 transition-colors"
      >
        <span className="text-lg leading-none">←</span>
        <span>Back</span>
      </button>
      {children}
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

function HomeView({ property, setView }: { property: Property; setView: (v: View) => void }) {
  const recs = property.local_recommendations ?? [];
  const videos = property.property_videos ?? [];

  return (
    <div>
      {/* Hero */}
      {property.cover_photo_url ? (
        <div className="relative h-56 overflow-hidden mb-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.cover_photo_url} alt={property.nickname} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full px-2.5 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs font-medium text-teal-400 tracking-wide">Your stay</span>
            </div>
            <h1 className="text-2xl font-semibold text-white leading-tight">{property.nickname}</h1>
            {property.address && <p className="text-xs text-white/45 mt-0.5">{property.address}</p>}
          </div>
        </div>
      ) : (
        <div className="px-5 pt-10 pb-2">
          <div className="inline-flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium text-teal-400 tracking-wide">Your stay at</span>
          </div>
          <h1 className="text-[2rem] font-semibold text-white leading-tight mb-1">{property.nickname}</h1>
          {property.address && (
            <p className="text-sm text-white/35 flex items-center gap-1.5 mt-1">
              <span className="text-base">📍</span>{property.address}
            </p>
          )}
        </div>
      )}

      {/* Welcome message */}
      {property.welcome_message && (
        <div className="mx-5 mt-4 mb-2 rounded-2xl border border-white/6 bg-white/[0.03] p-4">
          <p className="text-xs text-teal-400/70 uppercase tracking-widest font-medium mb-2">From your host</p>
          <p className="text-sm text-white/60 leading-relaxed italic">&ldquo;{property.welcome_message}&rdquo;</p>
        </div>
      )}

      {/* Cards */}
      <div className="px-5 pt-4 pb-16 flex flex-col gap-2.5">

        {/* Section: Arrival */}
        {(property.checkin_instructions || property.wifi_name || videos.length > 0) && (
          <SectionLabel>Arrival</SectionLabel>
        )}

        {property.checkin_instructions && (
          <Card onClick={() => setView('checkin-guide')} accent="teal">
            <CardIcon emoji="🗝️" accent="teal" />
            <CardBody title="Check-in Guide" sub="Step-by-step instructions" />
            <Chevron />
          </Card>
        )}

        {property.wifi_name && (
          <Card onClick={() => setView('wifi')} accent="none">
            <CardIcon emoji="📶" accent="none" />
            <div className="flex-1">
              <div className="font-medium text-sm text-white mb-0.5">Wi-Fi</div>
              <div className="text-xs text-teal-400/80 font-medium truncate">{property.wifi_name}</div>
            </div>
            <Chevron />
          </Card>
        )}

        {videos.length > 0 && (
          <Card onClick={() => setView('video-guides')} accent="none">
            <CardIcon emoji="▶️" accent="none" />
            <div className="flex-1">
              <div className="font-medium text-sm text-white mb-0.5">Video Guides</div>
              <div className="text-xs text-white/40">{videos.length} video{videos.length !== 1 ? 's' : ''} from your host</div>
            </div>
            <Chevron />
          </Card>
        )}

        {/* Section: Stay */}
        {(property.house_rules || recs.length > 0) && (
          <SectionLabel>Your Stay</SectionLabel>
        )}

        {property.house_rules && (
          <Card onClick={() => setView('house-rules')} accent="none">
            <CardIcon emoji="📋" accent="none" />
            <CardBody title="House Rules" sub="Please review before your stay" />
            <Chevron />
          </Card>
        )}

        {recs.length > 0 && (
          <Card onClick={() => setView('local-guide')} accent="none">
            <CardIcon emoji="🗺️" accent="none" />
            <div className="flex-1">
              <div className="font-medium text-sm text-white mb-0.5">Local Guide</div>
              <div className="flex gap-1.5 flex-wrap mt-1">
                {Array.from(new Set(recs.map(r => r.category))).slice(0, 3).map(cat => (
                  <span key={cat} className="text-xs text-white/35 bg-white/5 border border-white/8 rounded-full px-2 py-0.5">
                    {CATEGORY_EMOJI[cat] ?? '📍'} {CATEGORY_LABEL[cat] ?? cat}
                  </span>
                ))}
                {recs.length > 0 && <span className="text-xs text-white/25">· {recs.length} picks</span>}
              </div>
            </div>
            <Chevron />
          </Card>
        )}

        {/* Section: Upsells */}
        {(property.late_checkout_enabled || property.early_checkin_enabled) && (
          <SectionLabel>Upgrade Your Stay</SectionLabel>
        )}

        {property.late_checkout_enabled && (
          <Card onClick={() => setView('late-checkout')} accent="emerald">
            <CardIcon emoji="🕐" accent="emerald" />
            <div className="flex-1">
              <div className="font-medium text-sm text-white mb-0.5">Late Checkout</div>
              <div className="text-xs text-white/40">Stay a few extra hours</div>
            </div>
            <PriceBadge price={property.late_checkout_price} color="emerald" />
          </Card>
        )}

        {property.early_checkin_enabled && (
          <Card onClick={() => setView('early-checkin')} accent="teal">
            <CardIcon emoji="🔑" accent="teal" />
            <div className="flex-1">
              <div className="font-medium text-sm text-white mb-0.5">Early Check-in</div>
              <div className="text-xs text-white/40">Arrive before standard time</div>
            </div>
            <PriceBadge price={property.early_checkin_price} color="teal" />
          </Card>
        )}

        {/* Section: Checkout */}
        <SectionLabel>Departure</SectionLabel>

        <Card onClick={() => setView('checkout-ack')} accent="none">
          <CardIcon emoji="✅" accent="none" />
          <CardBody title="Checkout Confirmation" sub="Confirm your departure" />
          <Chevron />
        </Card>

        <p className="text-center text-xs text-white/12 mt-6 leading-5">
          Powered by Pax · Guest data encrypted & deleted after 14 days
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
      <ViewHeader emoji="🗝️" accent="teal" title="Check-in Guide" sub="Follow these steps to get settled in" />
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="w-7 h-7 rounded-full bg-teal-500/15 border border-teal-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-teal-400">{i + 1}</span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed pt-0.5">{step}</p>
          </div>
        ))}
      </div>
      <InfoNote>Having trouble getting in? Contact your host directly through your booking platform.</InfoNote>
    </div>
  );
}

// ── House Rules ────────────────────────────────────────────────────────────────

function HouseRulesView({ property }: { property: Property }) {
  const rules = (property.house_rules ?? '').split('\n').map(r => r.trim()).filter(Boolean);

  return (
    <div>
      <ViewHeader emoji="📋" accent="none" title="House Rules" sub="Please respect these guidelines during your stay" />
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
        {rules.map((rule, i) => (
          <div key={i} className={`flex items-start gap-3 p-4 ${i < rules.length - 1 ? 'border-b border-white/6' : ''}`}>
            <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-teal-400 text-xs leading-none">✓</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{rule}</p>
          </div>
        ))}
      </div>
      <InfoNote>Violations may result in additional charges. Thank you for respecting the space.</InfoNote>
    </div>
  );
}

// ── Video Guides ───────────────────────────────────────────────────────────────

function VideoGuidesView({ property }: { property: Property }) {
  const videos = property.property_videos ?? [];

  return (
    <div>
      <ViewHeader emoji="▶️" accent="none" title="Video Guides" sub="Short videos from your host" />
      <div className="flex flex-col gap-4">
        {videos.map((v, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              src={v.url}
              controls
              playsInline
              preload="metadata"
              className="w-full block"
              style={{ maxHeight: '260px', backgroundColor: '#000' }}
            />
            <div className="px-4 py-3">
              <div className="font-medium text-sm text-white">{v.title}</div>
            </div>
          </div>
        ))}
      </div>
      <InfoNote>Videos are hosted securely and only accessible during your stay.</InfoNote>
    </div>
  );
}

// ── Local Guide ────────────────────────────────────────────────────────────────

function LocalGuideView({ property }: { property: Property }) {
  const recs = property.local_recommendations ?? [];
  const categories = ['all', ...Array.from(new Set(recs.map(r => r.category)))];
  const [activeCategory, setActiveCategory] = useState('all');
  const filtered = activeCategory === 'all' ? recs : recs.filter(r => r.category === activeCategory);

  return (
    <div>
      <ViewHeader emoji="🗺️" accent="none" title="Local Guide" sub="Curated picks from your host" />
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-500/15 border-teal-500/30 text-teal-400'
                  : 'bg-white/4 border-white/10 text-white/40'
              }`}>
              {cat === 'all' ? 'All' : `${CATEGORY_EMOJI[cat] ?? '📍'} ${CATEGORY_LABEL[cat] ?? cat}`}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        {filtered.map((rec, i) => (
          <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/6 border border-white/8 flex items-center justify-center text-lg flex-shrink-0">
                {CATEGORY_EMOJI[rec.category] ?? '📍'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-medium text-sm text-white">{rec.name}</span>
                  <span className="text-xs text-white/30 bg-white/5 border border-white/8 rounded-full px-2 py-0.5">
                    {CATEGORY_LABEL[rec.category] ?? rec.category}
                  </span>
                </div>
                {rec.note && <p className="text-xs text-white/45 leading-relaxed">{rec.note}</p>}
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
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <ViewHeader emoji="📶" accent="teal" title="Wi-Fi Access" sub="Tap any field to copy" />
      <div className="flex flex-col gap-3">
        {[
          { label: 'Network', value: property.wifi_name, field: 'name' as const },
          { label: 'Password', value: property.wifi_password, field: 'pass' as const },
        ].map(({ label, value, field }) => (
          <button key={field} onClick={() => copy(value, field)}
            className="w-full text-left rounded-2xl border border-white/8 bg-white/[0.04] p-5 active:scale-[0.98] transition-transform">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-2">{label}</div>
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white text-lg tracking-wide truncate">{value}</span>
              <span className={`text-xs font-medium flex-shrink-0 transition-colors ${copied === field ? 'text-emerald-400' : 'text-teal-400'}`}>
                {copied === field ? '✓ Copied' : 'Copy'}
              </span>
            </div>
          </button>
        ))}
      </div>
      <InfoNote>Having trouble? Restart your Wi-Fi or try forgetting the network first.</InfoNote>
    </div>
  );
}

// ── Upsell ────────────────────────────────────────────────────────────────────

function UpsellView({ property, type }: { property: Property; type: 'late_checkout' | 'early_checkin' }) {
  const isLate = type === 'late_checkout';
  const price = isLate ? property.late_checkout_price : property.early_checkin_price;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) { setError('Please enter your name and email.'); return; }
    setError(''); setLoading(true);
    const { error: dbError } = await supabase.from('upsell_requests').insert({
      property_id: property.id, type,
      guest_name: name.trim(), guest_email: email.trim(),
      note: note.trim() || null, status: 'pending',
    });
    setLoading(false);
    if (dbError) { setError('Something went wrong. Please try again.'); } else { setSubmitted(true); }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-3xl mb-5">✓</div>
        <h2 className="text-2xl font-semibold mb-3">Request sent!</h2>
        <p className="text-sm text-white/45 leading-relaxed max-w-xs">
          Your host has been notified and will confirm within a few minutes. You&apos;ll hear back at{' '}
          <span className="text-teal-400">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ViewHeader emoji={isLate ? '🕐' : '🔑'} accent="emerald"
        title={isLate ? 'Late Checkout' : 'Early Check-in'}
        sub={isLate ? 'Request extra time before you leave.' : 'Request early access before standard check-in.'} />

      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between mb-6">
        <div>
          <div className="text-xs text-white/40 mb-0.5">One-time fee</div>
          <div className="text-xs text-white/25">Charged only after host approves</div>
        </div>
        <span className="text-3xl font-bold text-emerald-400">${price}</span>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Jane Smith" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" />
        <Field label="Note (optional)" value={note} onChange={setNote}
          placeholder={isLate ? 'Requesting until 2pm if possible' : 'Arriving around 10am'} multiline />
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-teal-600 to-emerald-500 active:scale-[0.98] transition-transform disabled:opacity-50">
        {loading ? 'Sending…' : `Request ${isLate ? 'Late Checkout' : 'Early Check-in'} · $${price}`}
      </button>
    </div>
  );
}

// ── Checkout Ack ──────────────────────────────────────────────────────────────

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
      <div className="flex flex-col items-center text-center py-10">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-3xl mb-5">✅</div>
        <h2 className="text-2xl font-semibold mb-3">Checkout confirmed</h2>
        <p className="text-sm text-white/45 leading-relaxed max-w-xs mb-8">
          Your departure has been recorded at{' '}
          <span className="text-teal-400">{new Date().toLocaleTimeString()}</span>. Safe travels!
        </p>

        {property.review_url && (
          <a href={property.review_url} target="_blank" rel="noopener noreferrer"
            className="w-full max-w-xs flex items-center justify-center gap-2 py-4 rounded-2xl border border-amber-400/25 bg-amber-400/8 text-amber-300 text-sm font-medium active:scale-[0.98] transition-transform">
            <span className="text-lg">⭐</span>
            Enjoyed your stay? Leave a review
            <span className="text-amber-400/50">↗</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div>
      <ViewHeader emoji="✅" accent="none" title="Checkout Confirmation" sub="Please confirm you've checked out." />

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 text-xs text-white/35 leading-relaxed mb-5">
        By confirming checkout you acknowledge that you have vacated the property,
        removed all personal belongings, returned any keys or access cards, and left
        the property in the condition described in the house rules.
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <Field label="Your full name" value={name} onChange={setName} placeholder="Jane Smith" />
      </div>

      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <div onClick={() => setAgreed(!agreed)}
          className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${agreed ? 'bg-teal-500 border-teal-500' : 'border-white/20 bg-white/5'}`}>
          {agreed && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-sm text-white/55 leading-relaxed">
          I confirm I have fully checked out of {property.nickname}.
        </span>
      </label>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-teal-600 to-emerald-500 active:scale-[0.98] transition-transform disabled:opacity-50">
        {loading ? 'Confirming…' : 'Confirm Checkout'}
      </button>
    </div>
  );
}

// ── Design system components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mt-2 mb-1">
      <span className="text-xs font-semibold text-white/25 uppercase tracking-widest">{children}</span>
      <div className="flex-1 h-px bg-white/6" />
    </div>
  );
}

function Card({ onClick, accent, children }: {
  onClick: () => void;
  accent: 'teal' | 'emerald' | 'none';
  children: React.ReactNode;
}) {
  const borderClass = accent === 'teal' ? 'border-teal-500/20 bg-teal-500/[0.04]'
    : accent === 'emerald' ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
    : 'border-white/8 bg-white/[0.03]';
  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-2xl border ${borderClass} p-4 flex items-center gap-3 active:scale-[0.98] transition-transform`}>
      {children}
    </button>
  );
}

function CardIcon({ emoji, accent }: { emoji: string; accent: 'teal' | 'emerald' | 'none' }) {
  const cls = accent === 'teal' ? 'bg-teal-500/15 border-teal-500/20'
    : accent === 'emerald' ? 'bg-emerald-500/15 border-emerald-500/20'
    : 'bg-white/6 border-white/8';
  return (
    <div className={`w-10 h-10 rounded-xl ${cls} border flex items-center justify-center text-xl flex-shrink-0`}>
      {emoji}
    </div>
  );
}

function CardBody({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex-1">
      <div className="font-medium text-sm text-white mb-0.5">{title}</div>
      <div className="text-xs text-white/40">{sub}</div>
    </div>
  );
}

function PriceBadge({ price, color }: { price: number; color: 'teal' | 'emerald' }) {
  const cls = color === 'emerald'
    ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
    : 'text-teal-400 bg-teal-400/10 border-teal-400/20';
  return (
    <span className={`text-xs font-bold ${cls} border rounded-full px-2.5 py-1`}>
      ${price}
    </span>
  );
}

function Chevron() {
  return <span className="text-white/18 text-lg flex-shrink-0">›</span>;
}

function ViewHeader({ emoji, accent, title, sub }: {
  emoji: string; accent: 'teal' | 'emerald' | 'none'; title: string; sub: string;
}) {
  const cls = accent === 'teal' ? 'bg-teal-500/15 border-teal-500/25'
    : accent === 'emerald' ? 'bg-emerald-500/15 border-emerald-500/25'
    : 'bg-white/8 border-white/12';
  return (
    <div className="mb-7">
      <div className={`w-14 h-14 rounded-2xl ${cls} border flex items-center justify-center text-2xl mb-5`}>
        {emoji}
      </div>
      <h2 className="text-2xl font-semibold mb-1">{title}</h2>
      <p className="text-sm text-white/40">{sub}</p>
    </div>
  );
}

function InfoNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-white/6 bg-white/[0.02] p-4">
      <p className="text-xs text-white/30 leading-relaxed text-center">{children}</p>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; multiline?: boolean;
}) {
  const base = 'w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 outline-none focus:border-teal-500/40 transition-colors';
  return (
    <div>
      <label className="text-xs text-white/30 uppercase tracking-widest mb-2 block font-medium">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${base} resize-none`} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={base} autoComplete={type === 'email' ? 'email' : 'name'} />
      }
    </div>
  );
}
