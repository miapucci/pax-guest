'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Property {
  id: string;
  nickname: string;
  address: string;
  wifi_name: string;
  wifi_password: string;
  late_checkout_enabled: boolean;
  late_checkout_price: number;
  early_checkin_enabled: boolean;
  early_checkin_price: number;
}

type View = 'home' | 'wifi' | 'late-checkout' | 'early-checkin' | 'checkout-ack';

export default function GuestClient({ property }: { property: Property }) {
  const [view, setView] = useState<View>('home');

  return (
    <div className="min-h-dvh bg-[#0c0d12] text-[#F8FAFC]">
      {/* Teal glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl" />
      </div>

      <div className="relative max-w-md mx-auto px-5 py-10 pb-16">
        {view === 'home'    && <HomeView    property={property} setView={setView} />}
        {view === 'wifi'    && <WifiView    property={property} onBack={() => setView('home')} />}
        {view === 'late-checkout'  && <UpsellView property={property} type="late_checkout"  onBack={() => setView('home')} />}
        {view === 'early-checkin'  && <UpsellView property={property} type="early_checkin"  onBack={() => setView('home')} />}
        {view === 'checkout-ack'   && <CheckoutAckView property={property} onBack={() => setView('home')} />}
      </div>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────

function HomeView({ property, setView }: { property: Property; setView: (v: View) => void }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs font-semibold tracking-widest text-teal-400/70 uppercase mb-2">
          Your stay at
        </div>
        <h1 className="text-3xl font-semibold text-white mb-1 leading-tight">
          {property.nickname}
        </h1>
        {property.address && (
          <p className="text-sm text-white/40">{property.address}</p>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">

        {/* Wi-Fi */}
        {property.wifi_name && (
          <button
            onClick={() => setView('wifi')}
            className="w-full text-left rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-lg">
                📶
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Wi-Fi</div>
                <div className="text-xs text-white/40">Tap to view password</div>
              </div>
              <div className="ml-auto text-white/25 text-lg">›</div>
            </div>
            <div className="text-xs text-teal-400/80 font-medium truncate">
              {property.wifi_name}
            </div>
          </button>
        )}

        {/* Late checkout */}
        {property.late_checkout_enabled && (
          <button
            onClick={() => setView('late-checkout')}
            className="w-full text-left rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-lg">
                🕐
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Late Checkout</div>
                <div className="text-xs text-white/40">Stay a few extra hours</div>
              </div>
              <div className="ml-auto">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
                  ${property.late_checkout_price}
                </span>
              </div>
            </div>
            <div className="text-xs text-white/35 leading-relaxed">
              Request extra time before checkout — your host will confirm within minutes.
            </div>
          </button>
        )}

        {/* Early check-in */}
        {property.early_checkin_enabled && (
          <button
            onClick={() => setView('early-checkin')}
            className="w-full text-left rounded-2xl border border-teal-500/20 bg-teal-500/5 p-5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-lg">
                🔑
              </div>
              <div>
                <div className="font-semibold text-sm text-white">Early Check-in</div>
                <div className="text-xs text-white/40">Arrive before standard time</div>
              </div>
              <div className="ml-auto">
                <span className="text-xs font-bold text-teal-400 bg-teal-400/10 border border-teal-400/20 rounded-full px-2 py-0.5">
                  ${property.early_checkin_price}
                </span>
              </div>
            </div>
            <div className="text-xs text-white/35 leading-relaxed">
              Request early access — your host will confirm within minutes.
            </div>
          </button>
        )}

        {/* Checkout acknowledgment */}
        <button
          onClick={() => setView('checkout-ack')}
          className="w-full text-left rounded-2xl border border-white/8 bg-white/3 p-5 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-lg">
              ✅
            </div>
            <div>
              <div className="font-semibold text-sm text-white">Checkout Confirmation</div>
              <div className="text-xs text-white/40">Confirm your departure</div>
            </div>
            <div className="ml-auto text-white/25 text-lg">›</div>
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-white/18 mt-10 leading-5">
        Powered by Pax · Guest data encrypted & deleted after 14 days
      </p>
    </div>
  );
}

// ── Wi-Fi ─────────────────────────────────────────────────────────────────────

function WifiView({ property, onBack }: { property: Property; onBack: () => void }) {
  const [copied, setCopied] = useState<'name' | 'pass' | null>(null);

  const copy = async (text: string, field: 'name' | 'pass') => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <BackButton onBack={onBack} />

      <div className="mb-8">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-2xl mb-5">
          📶
        </div>
        <h2 className="text-2xl font-semibold mb-1">Wi-Fi Access</h2>
        <p className="text-sm text-white/40">Tap any field to copy</p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => copy(property.wifi_name, 'name')}
          className="w-full text-left rounded-2xl border border-white/8 bg-white/4 p-5 active:scale-[0.98] transition-transform"
        >
          <div className="text-xs text-white/35 uppercase tracking-wider mb-2">Network</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-lg">{property.wifi_name}</span>
            <span className="text-xs text-teal-400 font-medium">
              {copied === 'name' ? '✓ Copied' : 'Copy'}
            </span>
          </div>
        </button>

        <button
          onClick={() => copy(property.wifi_password, 'pass')}
          className="w-full text-left rounded-2xl border border-white/8 bg-white/4 p-5 active:scale-[0.98] transition-transform"
        >
          <div className="text-xs text-white/35 uppercase tracking-wider mb-2">Password</div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-lg tracking-wider">{property.wifi_password}</span>
            <span className="text-xs text-teal-400 font-medium">
              {copied === 'pass' ? '✓ Copied' : 'Copy'}
            </span>
          </div>
        </button>
      </div>

      <p className="text-xs text-white/25 text-center mt-8">
        Having trouble? Restart your Wi-Fi or try forgetting the network first.
      </p>
    </div>
  );
}

// ── Upsell (late checkout + early check-in) ───────────────────────────────────

function UpsellView({
  property,
  type,
  onBack,
}: {
  property: Property;
  type: 'late_checkout' | 'early_checkin';
  onBack: () => void;
}) {
  const isLate = type === 'late_checkout';
  const price = isLate ? property.late_checkout_price : property.early_checkin_price;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      setError('Please enter your name and email.');
      return;
    }
    setError('');
    setLoading(true);

    const { error: dbError } = await supabase.from('upsell_requests').insert({
      property_id: property.id,
      type,
      guest_name: name.trim(),
      guest_email: email.trim(),
      note: note.trim() || null,
      status: 'pending',
    });

    setLoading(false);
    if (dbError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div>
        <BackButton onBack={onBack} />
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-3xl mb-5">
            ✓
          </div>
          <h2 className="text-2xl font-semibold mb-3">Request sent!</h2>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Your host has been notified and will confirm within a few minutes.
            You'll hear back at <span className="text-teal-400">{email}</span>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton onBack={onBack} />

      <div className="mb-7">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-2xl mb-5">
          {isLate ? '🕐' : '🔑'}
        </div>
        <h2 className="text-2xl font-semibold mb-1">
          {isLate ? 'Late Checkout' : 'Early Check-in'}
        </h2>
        <p className="text-sm text-white/40 leading-relaxed">
          {isLate
            ? 'Request extra time before you leave. Your host will confirm shortly.'
            : 'Request early access before standard check-in. Your host will confirm shortly.'}
        </p>
      </div>

      {/* Price */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/6 p-4 flex items-center justify-between mb-6">
        <span className="text-sm text-white/55">One-time fee</span>
        <span className="text-2xl font-bold text-emerald-400">${price}</span>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-3 mb-4">
        <Field label="Your name" value={name} onChange={setName} placeholder="Jane Smith" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="jane@example.com" type="email" />
        <Field label="Note (optional)" value={note} onChange={setNote} placeholder={isLate ? "Requesting until 2pm if possible" : "Arriving around 10am"} multiline />
      </div>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-teal-600 to-emerald-500 active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {loading ? 'Sending…' : `Request ${isLate ? 'Late Checkout' : 'Early Check-in'} · $${price}`}
      </button>

      <p className="text-xs text-white/25 text-center mt-4">
        Payment collected only after your host approves.
      </p>
    </div>
  );
}

// ── Checkout acknowledgment ───────────────────────────────────────────────────

function CheckoutAckView({ property, onBack }: { property: Property; onBack: () => void }) {
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!agreed) { setError('Please confirm you have checked out.'); return; }
    setError('');
    setLoading(true);

    const { error: dbError } = await supabase.from('checkout_acknowledgments').insert({
      property_id: property.id,
      guest_name: name.trim(),
      acknowledged_at: new Date().toISOString(),
    });

    setLoading(false);
    if (dbError) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div>
        <BackButton onBack={onBack} />
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/15 border border-teal-500/25 flex items-center justify-center text-3xl mb-5">
            ✅
          </div>
          <h2 className="text-2xl font-semibold mb-3">Checkout confirmed</h2>
          <p className="text-sm text-white/45 leading-relaxed max-w-xs">
            Your departure has been recorded at{' '}
            <span className="text-teal-400">{new Date().toLocaleTimeString()}</span>.
            Safe travels!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton onBack={onBack} />

      <div className="mb-7">
        <div className="w-14 h-14 rounded-2xl bg-white/8 border border-white/12 flex items-center justify-center text-2xl mb-5">
          ✅
        </div>
        <h2 className="text-2xl font-semibold mb-1">Checkout Confirmation</h2>
        <p className="text-sm text-white/40 leading-relaxed">
          Please confirm you've checked out. This creates a timestamped record for your host.
        </p>
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/3 p-4 text-xs text-white/40 leading-relaxed mb-5">
        By confirming checkout you acknowledge that you have vacated the property,
        removed all personal belongings, returned any keys or access cards, and left
        the property in the condition described in the house rules.
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <Field label="Your full name" value={name} onChange={setName} placeholder="Jane Smith" />
      </div>

      <label className="flex items-start gap-3 mb-5 cursor-pointer">
        <div
          onClick={() => setAgreed(!agreed)}
          className={`w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
            agreed ? 'bg-teal-500 border-teal-500' : 'border-white/20 bg-white/5'
          }`}
        >
          {agreed && <span className="text-white text-xs">✓</span>}
        </div>
        <span className="text-sm text-white/55 leading-relaxed">
          I confirm I have fully checked out of {property.nickname}.
        </span>
      </label>

      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-4 rounded-2xl font-semibold text-white text-sm bg-gradient-to-r from-teal-600 to-emerald-500 active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {loading ? 'Confirming…' : 'Confirm Checkout'}
      </button>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="flex items-center gap-1.5 text-sm text-white/40 mb-8 active:text-white/70 transition-colors"
    >
      ‹ Back
    </button>
  );
}

function Field({
  label, value, onChange, placeholder, type = 'text', multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
}) {
  const base =
    'w-full bg-white/4 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none focus:border-teal-500/50 focus:bg-white/6 transition-colors';

  return (
    <div>
      <label className="text-xs text-white/35 uppercase tracking-wider mb-2 block">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={`${base} resize-none`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={base}
          autoComplete={type === 'email' ? 'email' : 'name'}
        />
      )}
    </div>
  );
}
