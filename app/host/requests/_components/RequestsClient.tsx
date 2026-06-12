'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchHostRequests, type RequestRow } from '../actions';

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

type Tab = 'pending' | 'approved' | 'declined' | 'all';

const TYPE_META = {
  late_checkout: { label: 'Late Checkout',  icon: '🕐' },
  early_checkin: { label: 'Early Check-in', icon: '🔑' },
} as const;

const STATUS_STYLE = {
  pending:  { bg: 'rgba(251,191,36,0.08)',  text: '#FCD34D', dot: '#FBBF24' },
  approved: { bg: 'rgba(20,184,166,0.08)',  text: '#5EEAD4', dot: '#14B8A6' },
  declined: { bg: 'rgba(239,68,68,0.08)',   text: '#FCA5A5', dot: '#EF4444' },
};

function StatusBadge({ status }: { status: RequestRow['status'] }) {
  const s = STATUS_STYLE[status];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: s.bg, borderRadius: '100px', padding: '3px 10px 3px 8px', fontFamily: sans, fontSize: '11px', fontWeight: 500, color: s.text }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtAmount(cents: number | null) {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(0)}`;
}

type Props = {
  initialRequests: RequestRow[];
  propertyIds: string[];
};

export default function RequestsClient({ initialRequests, propertyIds }: Props) {
  const [requests, setRequests]     = useState<RequestRow[]>(initialRequests);
  const [tab, setTab]               = useState<Tab>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, 'approving' | 'declining'>>({});
  const [actionError, setActionError]     = useState<Record<string, string>>({});

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setRefreshing(true);
    try {
      const { requests: fresh } = await fetchHostRequests();
      setRequests(fresh);
    } finally {
      if (!quiet) setRefreshing(false);
    }
  }, []);

  // Auto-poll every 30s
  useEffect(() => {
    const id = setInterval(() => refresh(true), 30_000);
    return () => clearInterval(id);
  }, [refresh]);

  async function handleAction(requestId: string, action: 'approve' | 'decline') {
    setActionLoading(prev => ({ ...prev, [requestId]: action === 'approve' ? 'approving' : 'declining' }));
    setActionError(prev => { const n = { ...prev }; delete n[requestId]; return n; });

    try {
      const res = await fetch(`/api/${action}-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'declined' } : r)
      );
    } catch (e: any) {
      setActionError(prev => ({ ...prev, [requestId]: e.message ?? 'Something went wrong' }));
    } finally {
      setActionLoading(prev => { const n = { ...prev }; delete n[requestId]; return n; });
    }
  }

  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    declined: requests.filter(r => r.status === 'declined').length,
  };

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pending',  label: `Pending${counts.pending  > 0 ? ` (${counts.pending})`  : ''}` },
    { key: 'approved', label: `Approved${counts.approved > 0 ? ` (${counts.approved})` : ''}` },
    { key: 'declined', label: `Declined${counts.declined > 0 ? ` (${counts.declined})` : ''}` },
    { key: 'all',      label: `All (${counts.all})` },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            Requests
          </h1>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
            {counts.pending > 0 ? `${counts.pending} pending` : 'No pending requests'}
          </p>
        </div>
        <button
          onClick={() => refresh(false)}
          disabled={refreshing}
          style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)', borderRadius: '8px', padding: '8px 16px', cursor: refreshing ? 'not-allowed' : 'pointer', opacity: refreshing ? 0.6 : 1 }}
        >
          {refreshing ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* No properties state */}
      {propertyIds.length === 0 && (
        <div style={{ background: 'rgba(255,255,255,0.022)', border: `2px dashed rgba(255,255,255,0.08)`, borderRadius: '20px', padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ fontFamily: serif, fontSize: '20px', fontWeight: 400, color: white, marginBottom: '8px' }}>No properties yet</div>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 24px' }}>Add a property first to start receiving requests.</p>
          <a href="/host/properties/new" style={{ fontFamily: sans, fontSize: '14px', fontWeight: 600, color: white, background: 'linear-gradient(135deg, #0D9488, #10B981)', borderRadius: '10px', padding: '11px 22px', textDecoration: 'none' }}>
            Add property
          </a>
        </div>
      )}

      {propertyIds.length > 0 && (
        <>
          {/* Tabs */}
          <div className="tab-strip" style={{ marginBottom: '24px', borderBottom: `1px solid ${border}` }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  fontFamily: sans, fontSize: '13px', fontWeight: tab === t.key ? 500 : 400,
                  color: tab === t.key ? white : muted,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '10px 16px',
                  borderBottom: tab === t.key ? `2px solid ${teal}` : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Empty state for current tab */}
          {filtered.length === 0 && (
            <div style={{ padding: '48px 0', textAlign: 'center' }}>
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted }}>
                No {tab === 'all' ? '' : tab} requests yet
              </p>
            </div>
          )}

          {/* Request cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(r => {
              const meta    = TYPE_META[r.type];
              const loading = actionLoading[r.id];
              const err     = actionError[r.id];

              return (
                <div key={r.id} style={{ background: 'rgba(255,255,255,0.022)', border: r.status === 'pending' ? '1px solid rgba(251,191,36,0.15)' : `1px solid ${border}`, borderRadius: '16px', padding: '22px 24px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{meta.icon}</span>
                      <span style={{ fontFamily: sans, fontSize: '15px', fontWeight: 500, color: white }}>{meta.label}</span>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>

                  {/* Guest + property info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '16px', alignItems: 'end' }}>
                    <div>
                      <div style={{ fontFamily: sans, fontSize: '14px', fontWeight: 400, color: white, marginBottom: '3px' }}>
                        {r.guest_name}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, marginBottom: '6px' }}>
                        {r.guest_email}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: 'rgba(248,250,252,0.35)' }}>
                        {r.property_nickname} · {fmtDate(r.created_at)}
                      </div>
                      {r.note && (
                        <div style={{ marginTop: '10px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
                          <span style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted, fontStyle: 'italic' }}>
                            &ldquo;{r.note}&rdquo;
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: serif, fontSize: '28px', fontWeight: 400, color: teal, lineHeight: 1 }}>
                        {fmtAmount(r.amount)}
                      </div>
                      <div style={{ fontFamily: sans, fontSize: '10px', color: muted, marginTop: '3px', letterSpacing: '0.4px' }}>
                        {r.status === 'pending' ? 'CARD HELD' : r.status === 'approved' ? 'CHARGED' : 'RELEASED'}
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {err && (
                    <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', fontFamily: sans, fontSize: '12px', color: '#FCA5A5' }}>
                      {err}
                    </div>
                  )}

                  {/* Approve / Decline — pending only */}
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleAction(r.id, 'decline')}
                        disabled={!!loading}
                        style={{ fontFamily: sans, fontSize: '13px', fontWeight: 500, color: '#FCA5A5', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', padding: '9px 20px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                      >
                        {loading === 'declining' ? 'Declining…' : 'Decline'}
                      </button>
                      <button
                        onClick={() => handleAction(r.id, 'approve')}
                        disabled={!!loading}
                        className="lift"
                        style={{ fontFamily: sans, fontSize: '13px', fontWeight: 600, color: white, background: loading ? 'rgba(20,184,166,0.4)' : 'linear-gradient(135deg, #0D9488, #10B981)', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 3px 14px rgba(13,148,136,0.25)' }}
                      >
                        {loading === 'approving' ? 'Approving…' : `Approve · ${fmtAmount(r.amount)}`}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
