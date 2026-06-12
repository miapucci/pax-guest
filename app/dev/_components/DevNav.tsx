'use client';

import { usePathname } from 'next/navigation';

const teal  = '#14B8A6';
const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const NAV_LINKS = [
  { label: 'Activity',  href: '/dev' },
  { label: 'Hosts',     href: '/dev/hosts' },
  { label: 'Changelog', href: '/dev/changelog' },
];

export default function DevNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === '/dev' ? pathname === '/dev' : pathname.startsWith(href);

  return (
    <nav style={{
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(8,9,16,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1300px', margin: '0 auto',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: '28px', height: '56px',
      }}>
        {/* Logo + badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <a href="/host" style={{
            fontFamily: serif, fontSize: '20px', color: white,
            textDecoration: 'none', letterSpacing: '0.2px',
          }}>
            Pax
          </a>
          <span style={{
            fontFamily: sans, fontSize: '10px', fontWeight: 600,
            color: teal, background: 'rgba(20,184,166,0.1)',
            border: '1px solid rgba(20,184,166,0.2)',
            borderRadius: '6px', padding: '2px 8px',
            letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>
            Dev
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: '2px', flex: 1, overflowX: 'auto' }}>
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(href);
            return (
              <a key={href} href={href} className={active ? undefined : 'nav-link'} style={{
                fontFamily: sans, fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? '#5EEAD4' : muted,
                background: active ? 'rgba(20,184,166,0.09)' : 'transparent',
                border: active ? '1px solid rgba(20,184,166,0.16)' : '1px solid transparent',
                textDecoration: 'none',
                padding: '6px 14px', borderRadius: '8px',
                letterSpacing: '0.1px', whiteSpace: 'nowrap',
              }}>
                {label}
              </a>
            );
          })}
        </div>

        {/* Back to host portal */}
        <a href="/host" className="nav-link" style={{
          fontFamily: sans, fontSize: '12px', fontWeight: 400,
          color: 'rgba(248,250,252,0.3)', textDecoration: 'none',
          flexShrink: 0, padding: '6px 10px',
        }}>
          ← Host portal
        </a>
      </div>
    </nav>
  );
}
