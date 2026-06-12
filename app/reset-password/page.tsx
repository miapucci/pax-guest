'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { MeshGradient } from '../_components/MeshGradient';
import { PaxMark } from '../host/_components/HostNav';

const teal   = '#14B8A6';
const tealD  = '#0D9488';
const white  = '#F8FAFC';
const muted  = 'rgba(248,250,252,0.42)';
const border = 'rgba(255,255,255,0.07)';
const serif  = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans   = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const fieldStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  padding: '13px 16px',
  fontFamily: sans, fontSize: '14px', fontWeight: 300,
  color: white, width: '100%',
};

type Phase = 'verifying' | 'ready' | 'invalid' | 'done';

export default function ResetPasswordPage() {
  const [phase, setPhase]       = useState<Phase>('verifying');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);
  const router = useRouter();

  // Establish a session from the recovery link (PKCE code in the URL),
  // or accept an already-active session.
  useEffect(() => {
    const supabase = createClient();

    async function verify() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) { setPhase('invalid'); return; }
        // Clean the code out of the URL so refreshes don't re-exchange
        window.history.replaceState({}, '', '/reset-password');
        setPhase('ready');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      setPhase(user ? 'ready' : 'invalid');
    }

    verify();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords don’t match.'); return; }

    setSaving(true);
    setError('');

    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setPhase('done');
    setTimeout(() => { router.push('/host'); router.refresh(); }, 1600);
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
          <span style={{ fontFamily: serif, fontSize: '24px', color: white, letterSpacing: '0.3px' }}>Pax</span>
        </span>
      </nav>

      {/* Card */}
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
          borderRadius: '24px', padding: '48px 44px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          {phase === 'verifying' && (
            <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, textAlign: 'center', margin: 0 }}>
              Verifying your reset link…
            </p>
          )}

          {phase === 'invalid' && (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontFamily: serif, fontSize: '26px', fontWeight: 400, color: white, margin: '0 0 12px' }}>
                Link expired or invalid
              </h1>
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: '0 0 28px', lineHeight: 1.7 }}>
                Reset links are single-use and must be opened in the same browser
                you requested them from.
              </p>
              <a href="/forgot-password" className="lift" style={{
                display: 'inline-block',
                background: `linear-gradient(135deg, ${tealD}, #10B981)`,
                color: white, fontFamily: sans, fontWeight: 600,
                fontSize: '14px', padding: '13px 28px', borderRadius: '12px',
                textDecoration: 'none',
                boxShadow: '0 4px 24px rgba(13,148,136,0.25)',
              }}>
                Request a new link
              </a>
            </div>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '20px' }}>✓</div>
              <h1 style={{ fontFamily: serif, fontSize: '26px', fontWeight: 400, color: white, margin: '0 0 12px' }}>
                Password updated
              </h1>
              <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0, lineHeight: 1.7 }}>
                Taking you to your dashboard…
              </p>
            </div>
          )}

          {phase === 'ready' && (
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
                  Set a new password
                </h1>
                <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0, lineHeight: 1.6 }}>
                  Choose something you&apos;ll remember — 8+ characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: 'rgba(248,250,252,0.55)', letterSpacing: '0.3px' }}>
                    New password
                  </label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required autoComplete="new-password" placeholder="••••••••" autoFocus style={fieldStyle} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: 'rgba(248,250,252,0.55)', letterSpacing: '0.3px' }}>
                    Confirm password
                  </label>
                  <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                    required autoComplete="new-password" placeholder="••••••••" style={fieldStyle} />
                </div>

                {error && (
                  <div style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '10px', padding: '12px 14px',
                    fontFamily: sans, fontSize: '13px', fontWeight: 300, color: '#FCA5A5', lineHeight: 1.5,
                  }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={saving} className="lift" style={{
                  marginTop: '8px',
                  background: saving ? 'rgba(20,184,166,0.4)' : `linear-gradient(135deg, ${tealD}, #10B981)`,
                  color: white, fontFamily: sans, fontWeight: 600,
                  fontSize: '15px', padding: '15px', borderRadius: '12px',
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving ? 'none' : '0 4px 24px rgba(13,148,136,0.25)',
                }}>
                  {saving ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
