'use client';

import { usePathname } from 'next/navigation';
import { SignOutButton } from './SignOutButton';

const teal  = '#14B8A6';
const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const NAV_LINKS = [
  { label: 'Dashboard',  href: '/host' },
  { label: 'Properties', href: '/host/properties' },
  { label: 'Requests',   href: '/host/requests' },
  { label: 'Billing',    href: '/host/billing' },
];

// QR finder-pattern mark — three corners + teal module, echoes the product
export function PaxMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2"  y="2"  width="8" height="8" rx="2.5" stroke={teal} strokeWidth="1.8"/>
      <rect x="14" y="2"  width="8" height="8" rx="2.5" stroke="rgba(248,250,252,0.35)" strokeWidth="1.8"/>
      <rect x="2"  y="14" width="8" height="8" rx="2.5" stroke="rgba(248,250,252,0.35)" strokeWidth="1.8"/>
      <rect x="15" y="15" width="6" height="6" rx="2" fill={teal}/>
    </svg>
  );
}

export default function HostNav({ email, isMia }: { email: string; isMia: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/host' ? pathname === '/host' : pathname.startsWith(href);

  return (
    <nav style={{
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(12,13,18,0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto',
        padding: '0 clamp(14px, 4vw, 32px)',
        display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2.5vw, 28px)', height: '60px',
      }}>
        {/* Wordmark */}
        <a href="/host" style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          textDecoration: 'none', flexShrink: 0,
        }}>
          <PaxMark />
          <span style={{ fontFamily: serif, fontSize: '21px', color: white, letterSpacing: '0.2px' }}>
            Pax
          </span>
        </a>

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

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {isMia && (
            <a href="/dev" className="nav-link" style={{
              fontFamily: sans, fontSize: '11px', fontWeight: 600,
              color: teal, border: '1px solid rgba(20,184,166,0.22)',
              borderRadius: '8px', padding: '5px 12px',
              textDecoration: 'none', letterSpacing: '0.6px',
              textTransform: 'uppercase',
            }}>
              Dev
            </a>
          )}
          <span className="hide-sm" style={{
            fontFamily: sans, fontSize: '12px', fontWeight: 300,
            color: 'rgba(248,250,252,0.3)', letterSpacing: '0.1px',
          }}>
            {email}
          </span>
          <SignOutButton />
        </div>
      </div>
    </nav>
  );
}
