import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const StatIcon = ({ d }: { d: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

const ICONS = {
  home:    'M3 10.5L12 3l9 7.5M5 9.5V21h14V9.5',
  inbox:   'M22 12h-6l-2 3h-4l-2-3H2M5 5h14l3 7v7H2v-7l3-7z',
  earned:  'M12 2v20M17 7H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  spark:   'M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z',
};

function CheckCircle({ done }: { done: boolean }) {
  return done ? (
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
      background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M3 8.5l3.5 3.5L13 4.5" stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  ) : (
    <div style={{
      width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
      background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.14)',
    }} />
  );
}

function fmtWhen(ts: string) {
  const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function HostDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();
  const [{ data: properties }, { data: profile }] = await Promise.all([
    db.from('properties')
      .select('id, nickname, total_earned')
      .eq('host_id', user!.id),
    db.from('profiles')
      .select('subscription_status, plan, stripe_account_id')
      .eq('id', user!.id)
      .maybeSingle(),
  ]);

  const propertyIds   = (properties ?? []).map((p: { id: string }) => p.id);
  const propertyCount = propertyIds.length;
  const totalEarned   = (properties ?? []).reduce(
    (s: number, p: { total_earned: number | null }) => s + (p.total_earned ?? 0), 0);

  let pendingRequests: any[] = [];
  let pendingCount = 0;
  let decidedCount = 0;
  if (propertyCount > 0) {
    const [{ data: pending, count: pendingTotal }, { count: decided }] = await Promise.all([
      db.from('upsell_requests')
        .select('id, created_at, type, guest_name, amount, property_id', { count: 'exact' })
        .in('property_id', propertyIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3),
      db.from('upsell_requests')
        .select('*', { count: 'exact', head: true })
        .in('property_id', propertyIds)
        .neq('status', 'pending'),
    ]);
    pendingRequests = pending ?? [];
    pendingCount = pendingTotal ?? 0;
    decidedCount = decided ?? 0;
  }

  const propertyNames = new Map((properties ?? []).map((p: any) => [p.id, p.nickname]));

  const trialDaysLeft = 14 - Math.floor((Date.now() - new Date(user!.created_at).getTime()) / 86_400_000);
  const subLabel =
    profile?.subscription_status === 'active'
      ? (profile.plan === 'pro' ? 'Pro' : 'Core')
      : profile?.subscription_status === 'past_due'
        ? 'Payment failed'
        : trialDaysLeft > 0
          ? `Trial · ${trialDaysLeft}d left`
          : 'Trial ended';

  const stats = [
    { label: 'Properties',       value: String(propertyCount),        icon: ICONS.home },
    { label: 'Pending requests', value: String(pendingCount), icon: ICONS.inbox },
    { label: 'Total earned',     value: `$${totalEarned.toFixed(0)}`, icon: ICONS.earned, accent: true },
    { label: 'Plan',             value: subLabel,                     icon: ICONS.spark },
  ];

  const steps = [
    {
      done: propertyCount > 0,
      title: 'Add your first property',
      body: 'Set up your property details, house rules, Wi-Fi, and local tips.',
      href: '/host/properties/new',
      cta: 'Add property',
    },
    {
      done: propertyCount > 0,
      title: 'Print & place your QR code',
      body: 'Put it on the fridge or entryway — guests scan it for their personalized guide.',
      href: propertyCount > 0 ? `/host/properties/${propertyIds[0]}/qr` : '/host/properties',
      cta: 'View QR code',
    },
    {
      done: !!profile?.stripe_account_id,
      title: 'Connect payouts',
      body: 'Link your bank through Stripe — approved guest upgrades pay out directly to you. Guests can’t pay for upgrades until this is done.',
      href: '/host/billing#payouts',
      cta: 'Set up payouts',
    },
    {
      done: decidedCount > 0,
      title: 'Handle your first request',
      body: 'When a guest requests flexible checkout, approve it and get paid.',
      href: '/host/requests',
      cta: 'View requests',
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  const allDone   = doneCount === steps.length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: serif, fontSize: '34px', fontWeight: 400, color: white, margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          {propertyCount === 0 ? 'Welcome to Pax' : 'Dashboard'}
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
          {propertyCount === 0
            ? 'Four steps to your first paying guest.'
            : user?.email}
        </p>
      </div>

      {/* Stats row */}
      <div className="stagger" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '14px', marginBottom: '44px',
      }}>
        {stats.map(({ label, value, icon, accent }) => (
          <div key={label} className="lift hairline-top" style={{
            background: 'rgba(255,255,255,0.028)',
            border: `1px solid ${border}`,
            borderRadius: '16px', padding: '22px 24px',
            position: 'relative', overflow: 'hidden',
          }}>
            {accent && (
              <div aria-hidden="true" style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(20,184,166,0.5), transparent)',
              }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: 'rgba(248,250,252,0.35)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {label}
              </span>
              <StatIcon d={icon} />
            </div>
            <div className="tnum" style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: accent ? teal : white, lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Pending requests — surface the money actions first */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: serif, fontSize: '21px', fontWeight: 400, color: white, margin: 0, letterSpacing: '-0.3px' }}>
              Waiting on you
            </h2>
            <a href="/host/requests" style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal, textDecoration: 'none' }}>
              All requests →
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingRequests.map((r: any) => (
              <a key={r.id} href="/host/requests" className="lift" style={{
                display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                background: 'rgba(251,191,36,0.04)',
                border: '1px solid rgba(251,191,36,0.14)',
                borderRadius: '14px', padding: '16px 20px',
                textDecoration: 'none',
              }}>
                <span style={{ fontSize: '18px' }}>{r.type === 'late_checkout' ? '🕐' : '🔑'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: sans, fontSize: '14px', fontWeight: 500, color: white }}>
                    {r.guest_name} · {r.type === 'late_checkout' ? 'Late checkout' : 'Early check-in'}
                  </div>
                  <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, marginTop: '2px' }}>
                    {propertyNames.get(r.property_id) ?? 'Property'} · {fmtWhen(r.created_at)}
                  </div>
                </div>
                <span className="tnum" style={{ fontFamily: serif, fontSize: '20px', color: teal, flexShrink: 0 }}>
                  {r.amount != null ? `$${(r.amount / 100).toFixed(0)}` : ''}
                </span>
                <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: '#FCD34D', flexShrink: 0 }}>
                  Review →
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Setup checklist — hidden once everything's done */}
      {!allDone && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <h2 style={{ fontFamily: serif, fontSize: '21px', fontWeight: 400, color: white, margin: 0, letterSpacing: '-0.3px' }}>
              Get set up
            </h2>
            <span className="tnum" style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.16)', borderRadius: '100px', padding: '3px 12px' }}>
              {doneCount} of {steps.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {steps.map((s, i) => (
              <div key={i} className={s.done ? undefined : 'lift'} style={{
                background: s.done ? 'rgba(20,184,166,0.025)' : 'rgba(255,255,255,0.022)',
                border: s.done ? '1px solid rgba(20,184,166,0.12)' : `1px solid ${border}`,
                borderRadius: '16px', padding: '22px 26px',
                display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
                opacity: s.done ? 0.75 : 1,
              }}>
                <CheckCircle done={s.done} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: sans, fontSize: '15px', fontWeight: 500,
                    color: s.done ? 'rgba(248,250,252,0.5)' : white,
                    textDecoration: s.done ? 'line-through' : 'none',
                    textDecorationColor: 'rgba(248,250,252,0.25)',
                    marginBottom: '4px',
                  }}>
                    {s.title}
                  </div>
                  <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, lineHeight: 1.6 }}>
                    {s.body}
                  </div>
                </div>
                {!s.done && (
                  <a href={s.href} style={{
                    fontFamily: sans, fontSize: '13px', fontWeight: 500,
                    color: teal, textDecoration: 'none',
                    border: '1px solid rgba(20,184,166,0.25)',
                    borderRadius: '10px', padding: '8px 18px',
                    flexShrink: 0, whiteSpace: 'nowrap',
                  }}>
                    {s.cta} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Everything done, nothing pending — calm state */}
      {allDone && pendingRequests.length === 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.018)', border: `1px dashed rgba(255,255,255,0.08)`,
          borderRadius: '16px', padding: '36px 32px', textAlign: 'center',
        }}>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0, lineHeight: 1.7 }}>
            All caught up. New guest requests will appear here the moment they come in.
          </p>
        </div>
      )}
    </div>
  );
}
