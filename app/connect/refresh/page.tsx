import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Continue payout setup' };

const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default function ConnectRefreshPage() {
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
        <h1 style={{ fontFamily: serif, fontSize: '26px', fontWeight: 400, color: white, margin: '0 0 12px', letterSpacing: '-0.4px' }}>
          That link expired
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 32px', lineHeight: 1.7 }}>
          Stripe setup links are short-lived. Head back to Billing and click
          &ldquo;Finish payout setup&rdquo; to get a fresh one — your progress is saved.
        </p>
        <a href="/host/billing#payouts" className="lift" style={{
          display: 'inline-block', fontFamily: sans, fontSize: '14px', fontWeight: 600,
          color: white, background: 'linear-gradient(135deg, #0D9488, #10B981)',
          borderRadius: '12px', padding: '14px 32px', textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(13,148,136,0.25)',
        }}>
          Back to Billing
        </a>
      </div>
    </div>
  );
}
