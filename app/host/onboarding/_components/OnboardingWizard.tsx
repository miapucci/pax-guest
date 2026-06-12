'use client';

import { useState } from 'react';
import { completeOnboarding } from '../actions';

const teal   = '#14B8A6';
const tealD  = '#0D9488';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const fieldStyle: React.CSSProperties = {
  width: '100%', fontFamily: sans, fontSize: '15px', fontWeight: 300,
  color: white, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
  padding: '13px 16px', boxSizing: 'border-box',
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ display: 'block', fontFamily: sans, fontSize: '11px', fontWeight: 500, color: 'rgba(248,250,252,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '7px' }}>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
      <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: checked ? teal : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s' }}>
        <div style={{ position: 'absolute', top: '3px', left: checked ? '23px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: white, transition: 'left 0.2s' }} />
      </div>
    </button>
  );
}

const TOTAL_STEPS = 3; // form steps before the done screen

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    nickname: '',
    address: '',
    wifi_name: '',
    wifi_password: '',
    welcome_message: '',
    late_checkout_enabled: true,
    late_checkout_price: 25,
    early_checkin_enabled: true,
    early_checkin_price: 25,
  });

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const guestUrl = propertyId
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://paxhq.co'}/g/${propertyId}`
    : '';

  async function finish() {
    setSaving(true);
    setError('');
    const result = await completeOnboarding(form);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setPropertyId(result.propertyId!);
    setStep(TOTAL_STEPS); // done screen
    setSaving(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto', padding: '24px 0 60px' }}>

      {/* Progress bar — hidden on done screen */}
      {step < TOTAL_STEPS && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: teal, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Step {step + 1} of {TOTAL_STEPS}
            </span>
            <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: muted }}>
              ~2 minutes
            </span>
          </div>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              background: `linear-gradient(90deg, ${tealD}, #10B981)`,
              borderRadius: '2px', transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }} />
          </div>
        </div>
      )}

      {/* ── Step 1: Property basics ── */}
      {step === 0 && (
        <div>
          <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Name your property
          </h1>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 32px', lineHeight: 1.7 }}>
            This is what guests see when they open their guide.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
            <div>
              <Label>Property name *</Label>
              <input value={form.nickname} onChange={e => set('nickname', e.target.value)}
                placeholder="The Beach House" autoFocus style={fieldStyle} />
            </div>
            <div>
              <Label>Address (optional)</Label>
              <input value={form.address} onChange={e => set('address', e.target.value)}
                placeholder="123 Ocean Drive, West Palm Beach, FL" style={fieldStyle} />
            </div>
          </div>

          <button
            onClick={() => { if (!form.nickname.trim()) { setError('Give your property a name first.'); return; } setError(''); setStep(1); }}
            className="lift"
            style={{ width: '100%', fontFamily: sans, fontSize: '15px', fontWeight: 600, color: white, background: `linear-gradient(135deg, ${tealD}, #10B981)`, border: 'none', borderRadius: '12px', padding: '15px', cursor: 'pointer', boxShadow: '0 4px 24px rgba(13,148,136,0.25)' }}>
            Continue
          </button>
        </div>
      )}

      {/* ── Step 2: Guest essentials ── */}
      {step === 1 && (
        <div>
          <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            The two things every guest asks
          </h1>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 32px', lineHeight: 1.7 }}>
            Wi-Fi and a warm welcome. Add them now or skip and fill in later.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
            <div className="form-grid-2">
              <div>
                <Label>Wi-Fi network</Label>
                <input value={form.wifi_name} onChange={e => set('wifi_name', e.target.value)}
                  placeholder="HomeNetwork_5G" style={fieldStyle} />
              </div>
              <div>
                <Label>Wi-Fi password</Label>
                <input value={form.wifi_password} onChange={e => set('wifi_password', e.target.value)}
                  placeholder="mypassword123" style={fieldStyle} />
              </div>
            </div>
            <div>
              <Label>Welcome message</Label>
              <textarea value={form.welcome_message} onChange={e => set('welcome_message', e.target.value)}
                placeholder="Welcome! We're so glad you're here. Make yourself at home…"
                rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(0)}
              style={{ fontFamily: sans, fontSize: '14px', fontWeight: 400, color: muted, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px 24px', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={() => setStep(2)} className="lift"
              style={{ flex: 1, fontFamily: sans, fontSize: '15px', fontWeight: 600, color: white, background: `linear-gradient(135deg, ${tealD}, #10B981)`, border: 'none', borderRadius: '12px', padding: '15px', cursor: 'pointer', boxShadow: '0 4px 24px rgba(13,148,136,0.25)' }}>
              Continue
            </button>
          </div>
          <button onClick={() => setStep(2)}
            style={{ display: 'block', margin: '16px auto 0', fontFamily: sans, fontSize: '13px', fontWeight: 300, color: 'rgba(248,250,252,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
            Skip for now
          </button>
        </div>
      )}

      {/* ── Step 3: Upsells (the money step) ── */}
      {step === 2 && (
        <div>
          <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Turn requests into revenue
          </h1>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 32px', lineHeight: 1.7 }}>
            Guests can request flexible check-in and checkout — their card is held when they ask,
            and <span style={{ color: white }}>you only get paid when you approve</span>. You&apos;re always in control.
            Payouts land in your bank through Stripe — you&apos;ll connect it right after setup.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {([
              { key: 'late_checkout' as const,  icon: '🕐', title: 'Late checkout',  sub: 'Guests linger a little longer' },
              { key: 'early_checkin' as const,  icon: '🔑', title: 'Early check-in', sub: 'Guests arrive on their schedule' },
            ]).map(({ key, icon, title, sub }) => {
              const enabled  = form[`${key}_enabled`];
              const price    = form[`${key}_price`];
              return (
                <div key={key} style={{
                  background: enabled ? 'rgba(20,184,166,0.05)' : 'rgba(255,255,255,0.022)',
                  border: enabled ? '1px solid rgba(20,184,166,0.2)' : `1px solid ${border}`,
                  borderRadius: '16px', padding: '20px 22px', transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '22px' }}>{icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: sans, fontSize: '15px', fontWeight: 500, color: white }}>{title}</div>
                      <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted }}>{sub}</div>
                    </div>
                    <Toggle checked={enabled} onChange={v => set(`${key}_enabled`, v)} />
                  </div>
                  {enabled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                      <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted }}>Price</span>
                      <div style={{ position: 'relative', width: '110px' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: sans, fontSize: '14px', color: teal }}>$</span>
                        <input type="number" min="1" step="1" value={price}
                          onChange={e => set(`${key}_price`, Number(e.target.value))}
                          style={{ ...fieldStyle, paddingLeft: '28px' }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '12px 16px', fontFamily: sans, fontSize: '13px', color: '#FCA5A5', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setStep(1)} disabled={saving}
              style={{ fontFamily: sans, fontSize: '14px', fontWeight: 400, color: muted, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px 24px', cursor: 'pointer' }}>
              Back
            </button>
            <button onClick={finish} disabled={saving} className="lift"
              style={{ flex: 1, fontFamily: sans, fontSize: '15px', fontWeight: 600, color: white, background: saving ? 'rgba(20,184,166,0.4)' : `linear-gradient(135deg, ${tealD}, #10B981)`, border: 'none', borderRadius: '12px', padding: '15px', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 24px rgba(13,148,136,0.25)' }}>
              {saving ? 'Creating your portal…' : 'Launch my guest portal'}
            </button>
          </div>
        </div>
      )}

      {/* ── Done: portal is live ── */}
      {step === TOTAL_STEPS && propertyId && (
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px', margin: '0 auto 28px',
            background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px',
          }}>
            🎉
          </div>
          <h1 style={{ fontFamily: serif, fontSize: '34px', fontWeight: 400, color: white, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
            {form.nickname} is live.
          </h1>
          <p style={{ fontFamily: sans, fontSize: '15px', fontWeight: 300, color: muted, margin: '0 auto 36px', maxWidth: '400px', lineHeight: 1.7 }}>
            Your guest portal is ready. Print the QR code, place it in your space,
            and guests can scan it the moment they walk in.
          </p>

          {/* Guest link */}
          <button onClick={copyLink} style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: 'rgba(255,255,255,0.03)', border: `1px solid ${border}`,
            borderRadius: '12px', padding: '12px 20px', cursor: 'pointer', marginBottom: '32px',
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: '13px', color: 'rgba(248,250,252,0.6)' }}>{guestUrl}</span>
            <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: copied ? '#86EFAC' : teal }}>
              {copied ? '✓ Copied' : 'Copy'}
            </span>
          </button>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href={`/host/properties/${propertyId}/qr`} className="lift" style={{
              fontFamily: sans, fontSize: '15px', fontWeight: 600, color: white,
              background: `linear-gradient(135deg, ${tealD}, #10B981)`,
              borderRadius: '12px', padding: '15px 28px', textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(13,148,136,0.25)',
            }}>
              View & print QR code
            </a>
            <a href="/host" style={{
              fontFamily: sans, fontSize: '15px', fontWeight: 500, color: muted,
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px',
              padding: '15px 28px', textDecoration: 'none',
            }}>
              Go to dashboard
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
