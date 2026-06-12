'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MeshGradient } from './_components/MeshGradient';
import { PaxMark } from './host/_components/HostNav';

const teal    = '#14B8A6';
const tealD   = '#0D9488';
const white   = '#F8FAFC';
const muted   = 'rgba(248,250,252,0.42)';
const border  = 'rgba(255,255,255,0.07)';
const serif   = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans    = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/host');
      router.refresh();
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#0c0d12', color: white,
      fontFamily: sans, display: 'flex', flexDirection: 'column',
      position: 'relative', overflowX: 'hidden',
    }}>
      <MeshGradient />

      {/* Nav */}
      <nav style={{
        position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        maxWidth: '1100px', margin: '0 auto', padding: '28px 32px', width: '100%',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PaxMark size={22} />
          <span style={{ fontFamily: serif, fontSize: '24px', color: white, letterSpacing: '0.3px' }}>
            Pax
          </span>
        </span>
        <a href="/marketing" className="nav-link" style={{
          fontFamily: sans, fontSize: '13px', fontWeight: 400, color: muted,
          textDecoration: 'none', letterSpacing: '0.1px', padding: '6px 12px',
        }}>
          About Pax
        </a>
      </nav>

      {/* Login card */}
      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px',
      }}>
        <div className="fade-up hairline-top" style={{
          width: '100%', maxWidth: '420px',
          background: 'rgba(16,18,24,0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${border}`,
          borderRadius: '24px',
          padding: '48px 44px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{
              fontFamily: serif, fontSize: '32px', fontWeight: 400,
              color: white, margin: '0 0 8px', letterSpacing: '-0.5px',
            }}>
              Welcome back
            </h1>
            <p style={{
              fontFamily: sans, fontSize: '14px', fontWeight: 300,
              color: muted, margin: 0, lineHeight: 1.6,
            }}>
              Sign in to your Pax host account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: 'rgba(248,250,252,0.55)', letterSpacing: '0.3px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '12px',
                  padding: '13px 16px',
                  fontFamily: sans, fontSize: '14px', fontWeight: 300,
                  color: white, width: '100%',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: 'rgba(248,250,252,0.55)', letterSpacing: '0.3px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: '12px',
                  padding: '13px 16px',
                  fontFamily: sans, fontSize: '14px', fontWeight: 300,
                  color: white, width: '100%',
                  transition: 'border-color 0.2s',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '10px',
                padding: '12px 14px',
                fontFamily: sans, fontSize: '13px', fontWeight: 300,
                color: '#FCA5A5', lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="lift"
              style={{
                marginTop: '8px',
                background: loading
                  ? 'rgba(20,184,166,0.4)'
                  : `linear-gradient(135deg, ${tealD}, #10B981)`,
                color: white, fontFamily: sans, fontWeight: 600,
                fontSize: '15px', letterSpacing: '0.1px',
                padding: '15px', borderRadius: '12px',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(13,148,136,0.25)',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p style={{
            fontFamily: sans, fontSize: '12px', fontWeight: 300,
            color: 'rgba(248,250,252,0.25)', textAlign: 'center',
            margin: '28px 0 0', lineHeight: 1.6,
          }}>
            New to Pax?{' '}
            <a href="/signup" style={{ color: teal, textDecoration: 'none' }}>
              Start your free trial
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
