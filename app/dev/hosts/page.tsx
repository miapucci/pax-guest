import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/service';

export const metadata: Metadata = { title: 'Hosts — Pax Dev' };
export const revalidate = 0;

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

function fmtDate(ts: string | undefined | null) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function daysAgo(ts: string | undefined | null) {
  if (!ts) return null;
  return Math.floor((Date.now() - new Date(ts).getTime()) / 86_400_000);
}

function PlanChip({ status, plan, trialDaysLeft }: { status: string | null; plan: string | null; trialDaysLeft: number }) {
  let label: string, color: string, bg: string;
  if (status === 'active') {
    label = plan === 'pro' ? 'Pro' : 'Core';
    color = '#5EEAD4'; bg = 'rgba(20,184,166,0.08)';
  } else if (status === 'past_due') {
    label = 'Past due'; color = '#FCA5A5'; bg = 'rgba(239,68,68,0.08)';
  } else if (status === 'canceled') {
    label = 'Canceled'; color = muted; bg = 'rgba(255,255,255,0.05)';
  } else if (trialDaysLeft > 0) {
    label = `Trial · ${trialDaysLeft}d`; color = '#FCD34D'; bg = 'rgba(251,191,36,0.08)';
  } else {
    label = 'Trial expired'; color = 'rgba(248,250,252,0.35)'; bg = 'rgba(255,255,255,0.04)';
  }
  return (
    <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color, background: bg, borderRadius: '100px', padding: '3px 10px', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

export default async function DevHostsPage() {
  const db = createServiceClient();

  const [{ data: usersData, error: usersError }, { data: profiles }, { data: properties }] = await Promise.all([
    db.auth.admin.listUsers({ page: 1, perPage: 500 }),
    db.from('profiles').select('id, subscription_status, plan, stripe_account_id'),
    db.from('properties').select('host_id'),
  ]);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const propCount  = new Map<string, number>();
  for (const p of (properties ?? []) as { host_id: string }[]) {
    propCount.set(p.host_id, (propCount.get(p.host_id) ?? 0) + 1);
  }

  const users = (usersData?.users ?? [])
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const signups7d = users.filter(u => (daysAgo(u.created_at) ?? 99) < 7).length;
  const active7d  = users.filter(u => (daysAgo(u.last_sign_in_at) ?? 99) < 7).length;
  const paying    = (profiles ?? []).filter((p: any) => p.subscription_status === 'active').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Hosts
        </h1>
        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: 0 }}>
          Every account on the platform
        </p>
      </div>

      {/* Summary stats */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '36px' }}>
        {[
          { label: 'Total hosts',     value: users.length, color: teal },
          { label: 'New · 7 days',    value: signups7d },
          { label: 'Active · 7 days', value: active7d },
          { label: 'Paying',          value: paying, color: teal },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'rgba(255,255,255,0.028)', border: `1px solid ${border}`, borderRadius: '14px', padding: '18px 22px' }}>
            <div style={{ fontFamily: sans, fontSize: '10px', fontWeight: 500, color: 'rgba(248,250,252,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
              {label}
            </div>
            <div className="tnum" style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: color ?? white, lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Host table */}
      <div style={{ background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`, borderRadius: '16px', overflow: 'auto' }}>
        <div style={{ minWidth: '640px' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 110px 110px 70px 110px',
          gap: '16px', padding: '14px 22px',
          borderBottom: `1px solid ${border}`,
        }}>
          {['Email', 'Signed up', 'Last sign-in', 'Props', 'Plan'].map(h => (
            <span key={h} style={{ fontFamily: sans, fontSize: '10px', fontWeight: 600, color: 'rgba(248,250,252,0.3)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              {h}
            </span>
          ))}
        </div>

        {usersError ? (
          <div style={{ padding: '24px 22px', fontFamily: sans, fontSize: '13px', color: '#FCA5A5' }}>
            Couldn&apos;t load users: {usersError.message}
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '24px 22px', fontFamily: sans, fontSize: '13px', color: muted }}>No hosts yet</div>
        ) : (
          users.map(u => {
            const profile = profileMap.get(u.id) as any;
            const trialDaysLeft = 14 - (daysAgo(u.created_at) ?? 0);
            const lastSeen = daysAgo(u.last_sign_in_at);
            return (
              <div key={u.id} className="row-hover" style={{
                display: 'grid', gridTemplateColumns: '2fr 110px 110px 70px 110px',
                gap: '16px', padding: '13px 22px',
                borderBottom: `1px solid rgba(255,255,255,0.04)`,
                alignItems: 'center',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 400, color: white, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.email}
                    {profile?.stripe_account_id && (
                      <span title="Stripe Connect linked" style={{ marginLeft: '8px', fontSize: '11px', color: teal }}>⚡</span>
                    )}
                  </div>
                </div>
                <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted }}>
                  {fmtDate(u.created_at)}
                </span>
                <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: lastSeen !== null && lastSeen < 2 ? '#5EEAD4' : muted }}>
                  {lastSeen === null ? 'Never' : lastSeen === 0 ? 'Today' : lastSeen === 1 ? 'Yesterday' : `${lastSeen}d ago`}
                </span>
                <span className="tnum" style={{ fontFamily: serif, fontSize: '15px', color: white }}>
                  {propCount.get(u.id) ?? 0}
                </span>
                <PlanChip
                  status={profile?.subscription_status ?? null}
                  plan={profile?.plan ?? null}
                  trialDaysLeft={trialDaysLeft}
                />
              </div>
            );
          })
        )}
        </div>
      </div>
    </div>
  );
}
