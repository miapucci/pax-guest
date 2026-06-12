import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Payouts connected' };

const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default function ConnectSuccessPage() {
  return (
    <div style={{
      minHeight: '100dvh', background: '#0c0d12', color: white, fontFamily: sans,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
    }}>
      <div className="fade-up hairline-top" style={{
        width: '100%', maxWidth: '440px', textAlign: 'center',
        background: 'rgba(16,18,24,0.72)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '24px', padding: '48px 44px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '20px', margin: '0 auto 24px',
          background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px',
        }}>
          ⚡
        </div>
        <h1 style={{ fontFamily: serif, fontSize: '28px', fontWeight: 400, color: white, margin: '0 0 12px', letterSpacing: '-0.4px' }}>
          Payouts connected
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 32px', lineHeight: 1.7 }}>
          Approved guest upgrades now pay out directly to your bank through Stripe.
          Your upgrade options are live on your guest portal.
        </p>
        <a href="/host/billing" className="lift" style={{
          display: 'inline-block', fontFamily: sans, fontSize: '14px', fontWeight: 600,
          color: white, background: 'linear-gradient(135deg, #0D9488, #10B981)',
          borderRadius: '12px', padding: '14px 32px', textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(13,148,136,0.25)',
        }}>
          Back to Billing
        </a>
        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: 'rgba(248,250,252,0.25)', margin: '24px 0 0', lineHeight: 1.6 }}>
          Stripe may take a moment to finish verification — if Billing still shows
          &ldquo;Setup unfinished,&rdquo; give it a minute and refresh.
        </p>
      </div>
    </div>
  );
}
