import { createServiceClient } from '@/lib/supabase/service';

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    pending:   { bg: 'rgba(251,191,36,0.08)',  text: '#FCD34D', dot: '#FBBF24' },
    approved:  { bg: 'rgba(20,184,166,0.08)',  text: '#5EEAD4', dot: '#14B8A6' },
    declined:  { bg: 'rgba(239,68,68,0.08)',   text: '#FCA5A5', dot: '#EF4444' },
    info:      { bg: 'rgba(99,102,241,0.08)',  text: '#A5B4FC', dot: '#6366F1' },
    warning:   { bg: 'rgba(251,191,36,0.08)',  text: '#FCD34D', dot: '#FBBF24' },
    error:     { bg: 'rgba(239,68,68,0.08)',   text: '#FCA5A5', dot: '#EF4444' },
  };
  const c = colors[status] ?? { bg: 'rgba(255,255,255,0.06)', text: muted, dot: muted };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: c.bg, borderRadius: '100px',
      padding: '3px 10px 3px 8px',
      fontFamily: sans, fontSize: '11px', fontWeight: 500, color: c.text,
      letterSpacing: '0.2px',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    hour12: false,
  });
}

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.028)',
      border: `1px solid ${border}`,
      borderRadius: '14px', padding: '20px 24px',
    }}>
      <div style={{ fontFamily: sans, fontSize: '10px', fontWeight: 500, color: 'rgba(248,250,252,0.3)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
        {label}
      </div>
      <div className="tnum" style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: color ?? white, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: muted, marginTop: '6px' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: sans, fontSize: '12px', fontWeight: 600, color: 'rgba(248,250,252,0.4)', letterSpacing: '1.2px', textTransform: 'uppercase', margin: '0 0 14px' }}>
      {children}
    </h2>
  );
}

export const revalidate = 0;

export default async function DevActivityPage() {
  const db = createServiceClient();

  const now      = Date.now();
  const dayAgo   = new Date(now - 24 * 3_600_000).toISOString();
  const weekAgo  = new Date(now - 7 * 24 * 3_600_000).toISOString();

  const [
    { count: hostCount },
    { count: propertyCount },
    { count: requestCount },
    { count: pendingCount },
    { count: approvedCount },
    { data: earnings },
    { count: scansTotal, error: eventsError },
    { count: scans24h },
    { count: scans7d },
    { data: recentRequests },
    { data: events },
  ] = await Promise.all([
    db.from('profiles').select('*',        { count: 'exact', head: true }),
    db.from('properties').select('*',      { count: 'exact', head: true }),
    db.from('upsell_requests').select('*', { count: 'exact', head: true }),
    db.from('upsell_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('upsell_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    db.from('properties').select('total_earned'),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'guest.portal_view'),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'guest.portal_view').gte('created_at', dayAgo),
    db.from('events').select('*', { count: 'exact', head: true }).eq('event_type', 'guest.portal_view').gte('created_at', weekAgo),
    db.from('upsell_requests')
      .select('id, created_at, status, type, guest_name, amount')
      .order('created_at', { ascending: false })
      .limit(8),
    db.from('events')
      .select('*')
      .neq('event_type', 'guest.portal_view')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const eventsTableMissing =
    eventsError?.message?.includes('does not exist') || eventsError?.code === '42P01';

  const totalEarned = (earnings ?? []).reduce(
    (sum: number, p: { total_earned: number | null }) => sum + (p.total_earned ?? 0), 0
  );
  const decidedCount = (requestCount ?? 0) - (pendingCount ?? 0);
  const approvalRate = decidedCount > 0
    ? Math.round(((approvedCount ?? 0) / decidedCount) * 100)
    : null;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '36px' }}>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Activity
        </h1>
        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: 0 }}>
          Live platform snapshot · refreshes on each visit
        </p>
      </div>

      {/* ── Traffic ── */}
      <SectionTitle>Traffic — guest portal views</SectionTitle>
      {eventsTableMissing ? (
        <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '14px', padding: '18px 22px', marginBottom: '40px' }}>
          <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: '#FCD34D', margin: 0, lineHeight: 1.7 }}>
            Traffic tracking is off — run <code style={{ fontFamily: 'monospace' }}>supabase/migrations/20260609_events_table.sql</code> in
            the Supabase SQL Editor to start recording guest portal views.
          </p>
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '40px' }}>
          <StatCard label="Views · 24h"   value={scans24h ?? 0} color={teal} />
          <StatCard label="Views · 7 days" value={scans7d ?? 0} />
          <StatCard label="Views · all time" value={scansTotal ?? 0} />
        </div>
      )}

      {/* ── Business ── */}
      <SectionTitle>Business</SectionTitle>
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '40px' }}>
        <StatCard label="Hosts"            value={hostCount ?? 0} color={teal} />
        <StatCard label="Properties"       value={propertyCount ?? 0} />
        <StatCard label="Upsell revenue"   value={`$${totalEarned.toFixed(0)}`} color={teal} sub="earned by hosts, all time" />
        <StatCard label="Requests"         value={requestCount ?? 0} sub={`${pendingCount ?? 0} pending`} />
        <StatCard label="Approval rate"    value={approvalRate === null ? '—' : `${approvalRate}%`} sub="of decided requests" />
      </div>

      {/* ── Recent requests ── */}
      <SectionTitle>Recent requests</SectionTitle>
      <div style={{
        background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`,
        borderRadius: '16px', overflow: 'hidden', marginBottom: '40px',
      }}>
        {(!recentRequests || recentRequests.length === 0) ? (
          <div style={{ padding: '24px 22px', fontFamily: sans, fontSize: '13px', color: muted }}>No requests yet</div>
        ) : (
          recentRequests.map((r: any) => (
            <div key={r.id} className="row-hover" style={{
              padding: '12px 22px',
              borderBottom: `1px solid rgba(255,255,255,0.04)`,
              display: 'grid', gridTemplateColumns: '140px 1fr auto auto',
              alignItems: 'center', gap: '16px',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(248,250,252,0.3)' }}>
                {fmt(r.created_at)}
              </span>
              <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 400, color: white }}>
                {r.guest_name} · {r.type === 'late_checkout' ? 'Late checkout' : 'Early check-in'}
              </span>
              <span style={{ fontFamily: serif, fontSize: '15px', color: teal }}>
                {r.amount != null ? `$${(r.amount / 100).toFixed(0)}` : '—'}
              </span>
              <StatusBadge status={r.status} />
            </div>
          ))
        )}
      </div>

      {/* ── System events (non-traffic) ── */}
      <SectionTitle>System events</SectionTitle>
      <div style={{
        background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`,
        borderRadius: '16px', overflow: 'hidden',
      }}>
        {eventsTableMissing ? (
          <div style={{ padding: '24px 22px', fontFamily: sans, fontSize: '13px', color: muted }}>
            Enable the events table to see the audit log
          </div>
        ) : (!events || events.length === 0) ? (
          <div style={{ padding: '24px 22px', fontFamily: sans, fontSize: '13px', color: muted }}>
            No system events recorded yet
          </div>
        ) : (
          events.map((e: any) => (
            <div key={e.id} className="row-hover" style={{
              padding: '12px 22px',
              borderBottom: `1px solid rgba(255,255,255,0.04)`,
              display: 'grid', gridTemplateColumns: '140px 1fr auto auto',
              alignItems: 'center', gap: '16px',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(248,250,252,0.3)' }}>
                {fmt(e.created_at)}
              </span>
              <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 400, color: white }}>
                {e.event_type}
              </span>
              <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: muted }}>
                {e.actor_email ?? e.actor_id?.slice(0, 8) ?? '—'}
              </span>
              <StatusBadge status={e.severity ?? 'info'} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
