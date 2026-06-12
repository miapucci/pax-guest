import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase/service';
import { addChangelogEntry } from './actions';

export const metadata: Metadata = { title: 'Changelog — Pax Dev' };
export const revalidate = 0;

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const TAG_STYLE: Record<string, { color: string; bg: string }> = {
  feature: { color: '#5EEAD4', bg: 'rgba(20,184,166,0.08)' },
  fix:     { color: '#FCA5A5', bg: 'rgba(239,68,68,0.08)' },
  infra:   { color: '#A5B4FC', bg: 'rgba(99,102,241,0.08)' },
  content: { color: '#FCD34D', bg: 'rgba(251,191,36,0.08)' },
};

const inputStyle: React.CSSProperties = {
  width: '100%', fontFamily: sans, fontSize: '14px', fontWeight: 300,
  color: white, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
  padding: '11px 14px', boxSizing: 'border-box',
};

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export default async function DevChangelogPage() {
  const db = createServiceClient();
  const { data: entries, error } = await db
    .from('changelog')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  const tableMissing = error?.message?.includes('does not exist') || error?.code === '42P01';

  return (
    <div style={{ maxWidth: '760px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '0 0 6px', letterSpacing: '-0.4px' }}>
          Changelog
        </h1>
        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: 0 }}>
          Private record of what shipped, what broke, what changed
        </p>
      </div>

      {tableMissing ? (
        <div style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '14px', padding: '18px 22px' }}>
          <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: '#FCD34D', margin: 0, lineHeight: 1.7 }}>
            The changelog table doesn&apos;t exist yet — run{' '}
            <code style={{ fontFamily: 'monospace' }}>supabase/migrations/20260610_changelog_table.sql</code>{' '}
            in the Supabase SQL Editor. It seeds itself with the Phase 1–4 build history.
          </p>
        </div>
      ) : (
        <>
          {/* Quick-add form */}
          <form action={addChangelogEntry} style={{
            background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`,
            borderRadius: '16px', padding: '22px 24px', marginBottom: '36px',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '10px' }}>
              <input name="title" placeholder="What changed?" required style={inputStyle} />
              <select name="tag" defaultValue="feature" style={{ ...inputStyle, appearance: 'none' }}>
                <option value="feature">Feature</option>
                <option value="fix">Fix</option>
                <option value="infra">Infra</option>
                <option value="content">Content</option>
              </select>
            </div>
            <textarea name="body" placeholder="Details (optional)" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            <button type="submit" style={{
              alignSelf: 'flex-end',
              fontFamily: sans, fontSize: '13px', fontWeight: 600, color: white,
              background: 'linear-gradient(135deg, #0D9488, #10B981)',
              border: 'none', borderRadius: '10px', padding: '10px 24px', cursor: 'pointer',
            }}>
              Add entry
            </button>
          </form>

          {/* Timeline */}
          {(!entries || entries.length === 0) ? (
            <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted }}>No entries yet</p>
          ) : (
            <div style={{ position: 'relative', paddingLeft: '24px' }}>
              {/* Vertical line */}
              <div style={{ position: 'absolute', left: '5px', top: '6px', bottom: '6px', width: '1px', background: 'rgba(255,255,255,0.08)' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {entries.map((e: any) => {
                  const tag = TAG_STYLE[e.tag] ?? TAG_STYLE.feature;
                  return (
                    <div key={e.id} style={{ position: 'relative' }}>
                      {/* Dot */}
                      <div style={{
                        position: 'absolute', left: '-23px', top: '6px',
                        width: '9px', height: '9px', borderRadius: '50%',
                        background: tag.color, boxShadow: `0 0 8px ${tag.color}40`,
                      }} />

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: sans, fontSize: '15px', fontWeight: 500, color: white }}>
                          {e.title}
                        </span>
                        <span style={{ fontFamily: sans, fontSize: '10px', fontWeight: 600, color: tag.color, background: tag.bg, borderRadius: '100px', padding: '2px 9px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                          {e.tag}
                        </span>
                      </div>
                      {e.body && (
                        <p style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, margin: '0 0 6px', lineHeight: 1.7 }}>
                          {e.body}
                        </p>
                      )}
                      <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 300, color: 'rgba(248,250,252,0.25)' }}>
                        {fmtDate(e.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
