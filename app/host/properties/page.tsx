import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

const teal   = '#14B8A6';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export const revalidate = 0;

export default async function PropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();
  const { data: properties } = await db
    .from('properties')
    .select('id, nickname, address, cover_photo_url, total_earned, checkout_count, early_checkin_count, late_checkout_enabled, early_checkin_enabled, created_at')
    .eq('host_id', user!.id)
    .order('created_at', { ascending: false });

  const list = properties ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: serif, fontSize: '32px', fontWeight: 400, color: white, margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            Properties
          </h1>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
            {list.length} {list.length === 1 ? 'property' : 'properties'}
          </p>
        </div>
        <a href="/host/properties/new" className="lift" style={{
          fontFamily: sans, fontSize: '14px', fontWeight: 600, color: white,
          background: 'linear-gradient(135deg, #0D9488, #10B981)',
          borderRadius: '10px', padding: '11px 22px',
          textDecoration: 'none', boxShadow: '0 4px 16px rgba(13,148,136,0.22)',
        }}>
          + Add property
        </a>
      </div>

      {list.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.022)', border: `2px dashed rgba(255,255,255,0.08)`,
          borderRadius: '20px', padding: '64px 32px', textAlign: 'center',
        }}>
          <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: 400, color: white, marginBottom: '8px' }}>
            No properties yet
          </div>
          <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 28px', lineHeight: 1.7 }}>
            Add your first property to generate a QR code and start accepting guest requests.
          </p>
          <a href="/host/properties/new" className="lift" style={{
            fontFamily: sans, fontSize: '14px', fontWeight: 600, color: white,
            background: 'linear-gradient(135deg, #0D9488, #10B981)',
            borderRadius: '10px', padding: '12px 24px', textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(13,148,136,0.22)',
            display: 'inline-block',
          }}>
            Add your first property
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {list.map((p: any) => (
            <div key={p.id} className="lift" style={{
              background: 'rgba(255,255,255,0.022)', border: `1px solid ${border}`,
              borderRadius: '16px', overflow: 'hidden',
              display: 'flex', alignItems: 'stretch',
            }}>
              {/* Cover photo thumbnail */}
              {p.cover_photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.cover_photo_url} alt={p.nickname}
                  style={{ width: '120px', minHeight: '100px', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: '120px', flexShrink: 0,
                  background: 'rgba(20,184,166,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px',
                }}>
                  🏠
                </div>
              )}

              {/* Content */}
              <div style={{ flex: 1, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontFamily: serif, fontSize: '18px', fontWeight: 400, color: white, marginBottom: '4px' }}>
                    {p.nickname}
                  </div>
                  {p.address && (
                    <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted }}>
                      {p.address}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {p.late_checkout_enabled && (
                      <span style={{ fontFamily: sans, fontSize: '10px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: '6px', padding: '2px 8px' }}>
                        Late checkout
                      </span>
                    )}
                    {p.early_checkin_enabled && (
                      <span style={{ fontFamily: sans, fontSize: '10px', fontWeight: 500, color: teal, background: 'rgba(20,184,166,0.08)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: '6px', padding: '2px 8px' }}>
                        Early check-in
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '28px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: 400, color: teal, lineHeight: 1 }}>
                      ${(p.total_earned ?? 0).toFixed(0)}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: '10px', color: muted, marginTop: '3px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                      Earned
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: serif, fontSize: '22px', fontWeight: 400, color: white, lineHeight: 1 }}>
                      {(p.checkout_count ?? 0) + (p.early_checkin_count ?? 0)}
                    </div>
                    <div style={{ fontFamily: sans, fontSize: '10px', color: muted, marginTop: '3px', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                      Requests
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <a href={`/host/properties/${p.id}/qr`} style={{
                    fontFamily: sans, fontSize: '12px', fontWeight: 500, color: teal,
                    border: '1px solid rgba(20,184,166,0.25)', borderRadius: '8px',
                    padding: '7px 14px', textDecoration: 'none',
                  }}>
                    QR code
                  </a>
                  <a href={`/host/properties/${p.id}/edit`} style={{
                    fontFamily: sans, fontSize: '12px', fontWeight: 500, color: 'rgba(248,250,252,0.6)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
                    padding: '7px 14px', textDecoration: 'none',
                  }}>
                    Edit
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
