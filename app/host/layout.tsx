import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import HostNav from './_components/HostNav';
import TrialGate from './_components/TrialGate';

const white = '#F8FAFC';
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const DEV_EMAIL = 'mialilypucci@gmail.com';

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/');

  const isMia = user.email === DEV_EMAIL;

  // Subscription + trial state (trial = 14 days from account creation, matching the iOS app)
  const db = createServiceClient();
  const [{ data: profile }, { data: earnings }] = await Promise.all([
    db.from('profiles').select('subscription_status, plan').eq('id', user.id).maybeSingle(),
    db.from('properties').select('total_earned').eq('host_id', user.id),
  ]);

  const daysSinceSignup = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86_400_000);
  const trialDaysLeft   = 14 - daysSinceSignup;
  const status          = profile?.subscription_status ?? null;
  // isMia: the admin account never gets trial-walled out of its own product
  const hasActiveSub    = status === 'active' || status === 'trialing' || isMia;
  const isPastDue       = status === 'past_due' && !isMia;
  const totalEarned     = (earnings ?? []).reduce((sum: number, p: { total_earned: number | null }) => sum + (p.total_earned ?? 0), 0);

  return (
    <div style={{ minHeight: '100dvh', background: '#0c0d12', color: white, fontFamily: sans }}>
      {/* Ambient top glow — gives the whole portal depth without distraction */}
      <div aria-hidden="true" style={{
        position: 'fixed', top: '-220px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '420px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse, rgba(20,184,166,0.07) 0%, transparent 65%)',
      }} />

      <HostNav email={user.email ?? ''} isMia={isMia} />

      {/* Page content — gated on trial/subscription state */}
      <TrialGate
        trialDaysLeft={trialDaysLeft}
        hasActiveSub={hasActiveSub}
        isPastDue={isPastDue}
        totalEarned={totalEarned}
      >
        <main className="fade-up" style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px)', position: 'relative', zIndex: 1 }}>
          {children}
        </main>
      </TrialGate>
    </div>
  );
}
