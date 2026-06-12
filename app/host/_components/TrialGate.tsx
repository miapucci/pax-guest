'use client';

import { usePathname } from 'next/navigation';

const teal   = '#14B8A6';
const tealD  = '#0D9488';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

type Props = {
  trialDaysLeft: number;          // negative = expired
  hasActiveSub: boolean;          // subscription_status === 'active' or 'trialing'
  isPastDue: boolean;
  totalEarned: number;            // dollars earned across all properties
  children: React.ReactNode;
};

export default function TrialGate({ trialDaysLeft, hasActiveSub, isPastDue, totalEarned, children }: Props) {
  const pathname = usePathname();

  // Billing must always be reachable so the host can actually pay
  const onBilling    = pathname.startsWith('/host/billing');
  const onOnboarding = pathname.startsWith('/host/onboarding');
  const expired      = !hasActiveSub && trialDaysLeft <= 0;
  const showWall     = expired && !onBilling;
  const lastDays     = trialDaysLeft <= 3;

  return (
    <>
      {/* Past-due warning — subscription exists but payment failed */}
      {isPastDue && (
        <div style={{
          background: 'rgba(251,191,36,0.07)', borderBottom: '1px solid rgba(251,191,36,0.15)',
          padding: '10px 32px', textAlign: 'center',
        }}>
          <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 400, color: '#FCD34D' }}>
            Your last payment failed — your account will pause soon.{' '}
            <a href="/host/billing" style={{ color: '#FCD34D', fontWeight: 600, textDecoration: 'underline' }}>
              Update billing
            </a>
          </span>
        </div>
      )}

      {/* Trial countdown banner — hidden once subscribed, during onboarding, and when the wall is up */}
      {!hasActiveSub && !isPastDue && !expired && !onOnboarding && (
        <div style={{
          background: lastDays ? 'rgba(251,191,36,0.07)' : 'rgba(20,184,166,0.05)',
          borderBottom: lastDays ? '1px solid rgba(251,191,36,0.15)' : '1px solid rgba(20,184,166,0.12)',
          padding: '10px 32px', textAlign: 'center',
        }}>
          <span style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: lastDays ? '#FCD34D' : 'rgba(248,250,252,0.6)' }}>
            {trialDaysLeft === 1 ? 'Last day of your free trial' : `${trialDaysLeft} days left in your free trial`}
            {' · '}
            <a href="/host/billing" style={{ color: lastDays ? '#FCD34D' : teal, fontWeight: 600, textDecoration: 'none' }}>
              Choose a plan →
            </a>
          </span>
        </div>
      )}

      {/* Content — blurred behind the wall when expired */}
      <div style={showWall ? { filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', maxHeight: '100vh', overflow: 'hidden' } : undefined}>
        {children}
      </div>

      {/* Hard wall — trial over, no subscription */}
      {showWall && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(8,9,14,0.82)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px',
        }}>
          <div className="fade-up hairline-top" style={{
            width: '100%', maxWidth: '460px',
            background: '#101218', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px', padding: '44px 40px', textAlign: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)',
              borderRadius: '100px', padding: '5px 14px',
              fontFamily: sans, fontSize: '10px', fontWeight: 600, color: '#FCD34D',
              letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px',
            }}>
              Trial ended
            </div>

            <h2 style={{ fontFamily: serif, fontSize: '28px', fontWeight: 400, color: white, margin: '0 0 14px', letterSpacing: '-0.4px', lineHeight: 1.2 }}>
              Your QR codes are paused.
            </h2>

            {totalEarned > 0 ? (
              <>
                <div style={{
                  background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.15)',
                  borderRadius: '14px', padding: '18px', margin: '0 0 18px',
                }}>
                  <div style={{ fontFamily: serif, fontSize: '36px', fontWeight: 400, color: teal, lineHeight: 1 }}>
                    ${totalEarned.toFixed(0)}
                  </div>
                  <div style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: muted, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '6px' }}>
                    Earned during your trial
                  </div>
                </div>
                <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 28px', lineHeight: 1.7 }}>
                  There&apos;s more on the table. Reactivate to keep your guest portal,
                  QR codes, and upsells live.
                </p>
              </>
            ) : (
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 28px', lineHeight: 1.7 }}>
                Your guest portal, QR codes, and upsell requests are on hold.
                Pick a plan to bring them back — everything is saved exactly as you left it.
              </p>
            )}

            <a href="/host/billing" className="lift" style={{
              display: 'block', fontFamily: sans, fontSize: '15px', fontWeight: 600,
              color: white, background: `linear-gradient(135deg, ${tealD}, #10B981)`,
              borderRadius: '12px', padding: '15px', textDecoration: 'none',
              boxShadow: '0 4px 24px rgba(13,148,136,0.3)', marginBottom: '14px',
            }}>
              Choose a plan — from $19/mo
            </a>
            <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: 'rgba(248,250,252,0.25)' }}>
              Cancel anytime · Your data is saved
            </span>
          </div>
        </div>
      )}
    </>
  );
}
