import type { Metadata } from 'next';
import { FadeIn } from '../_components/LandingClient';
import { MeshGradient } from '../_components/MeshGradient';
import { PaxMark } from '../host/_components/HostNav';

export const metadata: Metadata = {
  title: 'Pax — Better stays for guests, less work for you',
  description: 'Pax gives guests instant answers and a better stay — so you spend less time on messages.',
};

const surface = 'rgba(255,255,255,0.032)';
const border  = 'rgba(255,255,255,0.07)';
const teal    = '#14B8A6';
const tealD   = '#0D9488';
const white   = '#F8FAFC';
const muted   = 'rgba(248,250,252,0.42)';
const serif   = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans    = "var(--font-inter), -apple-system, 'Inter', sans-serif";

const IconSetup = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
  </svg>
);

const IconPlay = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8" fill={teal} stroke="none"/>
  </svg>
);

const IconShare = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3z"/>
  </svg>
);

const IconWin = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const Check = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke={teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function MarketingPage() {
  return (
    <div style={{ minHeight: '100dvh', color: white, fontFamily: sans, overflowX: 'hidden', position: 'relative', background: '#0c0d12' }}>

      <MeshGradient />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          maxWidth: '1100px', margin: '0 auto', padding: '28px 32px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PaxMark size={22} />
            <span style={{ fontFamily: serif, fontSize: '24px', color: white, letterSpacing: '0.3px' }}>
              Pax
            </span>
          </span>
          <a href="/" className="lift" style={{
            fontFamily: sans, fontSize: '13px', fontWeight: 500,
            color: teal, border: `1px solid rgba(20,184,166,0.25)`,
            borderRadius: '10px', padding: '9px 20px',
            textDecoration: 'none', letterSpacing: '0.1px',
          }}>
            Log in
          </a>
        </nav>

        {/* ── Hero ── */}
        <section style={{
          maxWidth: '820px', margin: '0 auto',
          padding: '90px 32px 110px',
          textAlign: 'center',
        }}>
          <FadeIn>
            <div style={{
              display: 'inline-block',
              background: 'rgba(20,184,166,0.08)',
              border: `1px solid rgba(20,184,166,0.18)`,
              borderRadius: '100px', padding: '6px 18px',
              fontSize: '11px', fontWeight: 500, color: teal,
              letterSpacing: '1.2px', textTransform: 'uppercase',
              marginBottom: '40px',
            }}>
              For short-term rental hosts
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(44px, 7.5vw, 80px)',
              fontWeight: 400, color: white,
              lineHeight: 1.1, margin: '0 0 28px',
              letterSpacing: '-1px',
            }}>
              Give guests more.{' '}
              <br />
              <span className="teal-shimmer" style={{ fontStyle: 'italic' }}>Earn more doing it.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={160}>
            <p style={{
              fontFamily: sans, fontSize: 'clamp(16px, 2vw, 18px)',
              fontWeight: 300, color: muted, lineHeight: 1.8,
              margin: '0 auto 52px', maxWidth: '540px',
              letterSpacing: '0.1px',
            }}>
              Pax gives your guests instant answers and a better stay —
              so you spend less time fielding the same questions and more time
              on what actually matters.
            </p>
          </FadeIn>

          <FadeIn delay={240} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div id="download" style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-8px',
                borderRadius: '22px',
                background: 'radial-gradient(ellipse, rgba(20,184,166,0.35) 0%, transparent 70%)',
                filter: 'blur(12px)',
                pointerEvents: 'none',
              }} />
              <a href="/signup" className="lift" style={{
                position: 'relative',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: `linear-gradient(135deg, ${tealD}, #10B981)`,
                color: white, fontFamily: sans, fontWeight: 600,
                fontSize: '15px', letterSpacing: '0.2px',
                padding: '17px 38px', borderRadius: '14px',
                textDecoration: 'none',
                boxShadow: `0 0 60px rgba(13,148,136,0.4), 0 4px 24px rgba(0,0,0,0.4)`,
              }}>
                Get started — it&apos;s free
              </a>
            </div>
            <span style={{
              fontFamily: sans, fontSize: '12px', color: 'rgba(248,250,252,0.28)',
              letterSpacing: '0.4px',
            }}>
              14-day free trial · No credit card required
            </span>
          </FadeIn>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', borderTop: `1px solid ${border}` }} />

        {/* ── How it works ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 32px' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 400, color: white, textAlign: 'center',
              margin: '0 0 72px', letterSpacing: '-0.5px',
            }}>
              How it works
            </h2>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '20px',
          }}>
            {([
              {
                icon: <IconSetup />,
                step: '01',
                title: 'Set up your property',
                body: 'Add your property details, house rules, local tips, and preferences. Takes minutes — you get a unique QR code.',
                delay: 0,
              },
              {
                icon: <IconShare />,
                step: '02',
                title: 'Share the QR code',
                body: 'Place it in your space. Guests scan it to access a personalized guide built for their stay.',
                delay: 100,
              },
              {
                icon: <IconWin />,
                step: '03',
                title: 'Everyone wins',
                body: 'Guests get instant answers. You stop fielding the same messages. When guests want a flexible checkout, you decide — and earn if you say yes.',
                delay: 200,
              },
            ] as const).map((s) => (
              <FadeIn key={s.step} delay={s.delay}>
                <div className="step-card" style={{
                  background: surface, border: `1px solid ${border}`,
                  borderRadius: '20px', padding: '36px 32px',
                  height: '100%',
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px',
                    background: 'rgba(20,184,166,0.08)',
                    border: `1px solid rgba(20,184,166,0.15)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '24px',
                  }}>
                    {s.icon}
                  </div>
                  <div style={{
                    fontFamily: sans, fontSize: '10px', fontWeight: 600,
                    color: 'rgba(20,184,166,0.6)', letterSpacing: '1.5px',
                    textTransform: 'uppercase', marginBottom: '10px',
                  }}>
                    {s.step}
                  </div>
                  <h3 style={{
                    fontFamily: serif, fontSize: '22px', fontWeight: 400,
                    color: white, margin: '0 0 14px', letterSpacing: '-0.2px',
                  }}>
                    {s.title}
                  </h3>
                  <p style={{
                    fontFamily: sans, fontSize: '15px', fontWeight: 300,
                    color: muted, lineHeight: 1.75, margin: 0,
                  }}>
                    {s.body}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', borderTop: `1px solid ${border}` }} />

        {/* ── Video Tutorials ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 32px' }}>
          <FadeIn>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(20,184,166,0.07)',
                  border: `1px solid rgba(20,184,166,0.15)`,
                  borderRadius: '100px', padding: '5px 14px 5px 10px',
                  marginBottom: '28px',
                }}>
                  <IconPlay />
                  <span style={{ fontFamily: sans, fontSize: '11px', fontWeight: 500, color: teal, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                    Video walkthroughs
                  </span>
                </div>
                <h2 style={{
                  fontFamily: serif, fontSize: 'clamp(28px, 3.5vw, 42px)',
                  fontWeight: 400, color: white,
                  margin: '0 0 20px', letterSpacing: '-0.5px', lineHeight: 1.15,
                }}>
                  Show guests exactly what to do.
                </h2>
                <p style={{
                  fontFamily: sans, fontSize: '16px', fontWeight: 300,
                  color: muted, lineHeight: 1.8, margin: '0 0 32px',
                }}>
                  Upload short videos — check-in instructions, appliance walkthroughs, parking tips — and guests watch them right in the app.
                  No more confusion, no more calls.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    'Attach videos to any section of your guide',
                    'Guests watch inline — no app download needed',
                    'Works for check-in, check-out, and house rules',
                  ].map(item => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                        background: 'rgba(20,184,166,0.08)', border: `1px solid rgba(20,184,166,0.2)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke={teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: 'rgba(248,250,252,0.65)', lineHeight: 1.6 }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <div style={{
                  background: surface,
                  border: `1px solid ${border}`,
                  borderRadius: '24px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '220px',
                    background: 'linear-gradient(135deg, rgba(20,184,166,0.12) 0%, rgba(5,150,105,0.08) 50%, rgba(6,182,212,0.06) 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative',
                    borderBottom: `1px solid ${border}`,
                  }}>
                    <div style={{
                      width: '64px', height: '64px', borderRadius: '50%',
                      background: 'rgba(20,184,166,0.15)',
                      border: `1px solid rgba(20,184,166,0.3)`,
                      backdropFilter: 'blur(8px)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill={teal}>
                        <polygon points="8 5 19 12 8 19 8 5"/>
                      </svg>
                    </div>
                    <div style={{
                      position: 'absolute', bottom: '12px', right: '12px',
                      background: 'rgba(0,0,0,0.6)', borderRadius: '6px',
                      padding: '3px 8px',
                      fontFamily: sans, fontSize: '11px', fontWeight: 500, color: white,
                    }}>
                      0:48
                    </div>
                  </div>
                  <div style={{ padding: '18px 20px' }}>
                    <div style={{ fontFamily: serif, fontSize: '16px', color: white, marginBottom: '5px' }}>
                      Check-in walkthrough
                    </div>
                    <div style={{ fontFamily: sans, fontSize: '12px', fontWeight: 300, color: muted }}>
                      Front door code, parking, and Wi-Fi — 48 seconds
                    </div>
                  </div>
                </div>
                <div style={{
                  position: 'absolute', bottom: '-20px', left: '10%', right: '10%', height: '40px',
                  background: 'radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%)',
                  filter: 'blur(12px)',
                  pointerEvents: 'none',
                }} />
              </div>
            </div>
          </FadeIn>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', borderTop: `1px solid ${border}` }} />

        {/* ── Pricing ── */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 32px' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(30px, 4vw, 46px)',
              fontWeight: 400, color: white, textAlign: 'center',
              margin: '0 0 12px', letterSpacing: '-0.5px',
            }}>
              Simple pricing
            </h2>
            <p style={{
              fontFamily: sans, fontSize: '15px', fontWeight: 300, color: muted,
              textAlign: 'center', margin: '0 0 64px',
            }}>
              14-day free trial on all plans. No credit card required to start.
            </p>
          </FadeIn>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px', maxWidth: '780px', margin: '0 auto',
          }}>
            <FadeIn delay={0}>
              <div className="pricing-card" style={{
                background: surface, border: `1px solid ${border}`,
                borderRadius: '24px', padding: '44px 36px', height: '100%',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ fontFamily: serif, fontSize: '26px', color: white, marginBottom: '6px' }}>Core</div>
                <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, marginBottom: '32px' }}>
                  For hosts with up to 5 properties
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: serif, fontSize: '52px', color: white, fontWeight: 400, lineHeight: 1 }}>$19</span>
                  <span style={{ fontFamily: sans, fontSize: '14px', color: muted, marginLeft: '4px' }}>/month</span>
                </div>
                <div style={{ fontFamily: sans, fontSize: '12px', color: teal, marginBottom: '36px', letterSpacing: '0.2px' }}>
                  or $190/year — save $38
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flex: 1 }}>
                  {['Guest portal with QR code', 'House rules, Wi-Fi & local guide', 'Flexible checkout requests', 'Push notifications', 'Email confirmations', 'Up to 5 properties'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(20,184,166,0.08)', border: `1px solid rgba(20,184,166,0.2)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check />
                      </div>
                      <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: 'rgba(248,250,252,0.65)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/signup" className="lift" style={{
                  display: 'block', textAlign: 'center',
                  background: `linear-gradient(135deg, ${tealD}, #10B981)`,
                  color: white, fontFamily: sans, fontWeight: 600,
                  fontSize: '14px', padding: '15px',
                  borderRadius: '12px', textDecoration: 'none',
                  boxShadow: `0 4px 24px rgba(13,148,136,0.2)`,
                  letterSpacing: '0.2px',
                }}>
                  Start free trial
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="pricing-card" style={{
                background: 'rgba(20,184,166,0.04)',
                border: `1px solid rgba(20,184,166,0.18)`,
                borderRadius: '24px', padding: '44px 36px', height: '100%',
                display: 'flex', flexDirection: 'column',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(90deg, transparent, rgba(20,184,166,0.4), transparent)`,
                }} />
                <div style={{
                  position: 'absolute', top: '20px', right: '20px',
                  background: 'rgba(20,184,166,0.1)', border: `1px solid rgba(20,184,166,0.2)`,
                  borderRadius: '100px', padding: '4px 12px',
                  fontFamily: sans, fontSize: '10px', fontWeight: 600,
                  color: teal, letterSpacing: '0.8px', textTransform: 'uppercase',
                }}>
                  Property Managers
                </div>
                <div style={{ fontFamily: serif, fontSize: '26px', color: white, marginBottom: '6px' }}>Pro</div>
                <div style={{ fontFamily: sans, fontSize: '13px', fontWeight: 300, color: muted, marginBottom: '32px' }}>
                  For hosts with 5+ properties
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: serif, fontSize: '52px', color: white, fontWeight: 400, lineHeight: 1 }}>$29</span>
                  <span style={{ fontFamily: sans, fontSize: '14px', color: muted, marginLeft: '4px' }}>/month</span>
                </div>
                <div style={{ fontFamily: sans, fontSize: '12px', color: teal, marginBottom: '36px', letterSpacing: '0.2px' }}>
                  or $290/year — save $58
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px', flex: 1 }}>
                  {['Everything in Core', 'Unlimited properties', 'Priority support'].map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(20,184,166,0.08)', border: `1px solid rgba(20,184,166,0.2)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check />
                      </div>
                      <span style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: 'rgba(248,250,252,0.65)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <a href="/signup" className="lift" style={{
                  display: 'block', textAlign: 'center',
                  background: 'transparent',
                  border: `1px solid rgba(20,184,166,0.35)`,
                  color: teal, fontFamily: sans, fontWeight: 600,
                  fontSize: '14px', padding: '15px',
                  borderRadius: '12px', textDecoration: 'none',
                  letterSpacing: '0.2px',
                }}>
                  Start free trial
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ── Divider ── */}
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px', borderTop: `1px solid ${border}` }} />

        {/* ── Final CTA ── */}
        <section style={{ maxWidth: '720px', margin: '0 auto', padding: '110px 32px', textAlign: 'center' }}>
          <FadeIn>
            <h2 style={{
              fontFamily: serif, fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 400, color: white,
              margin: '0 0 18px', letterSpacing: '-0.8px', lineHeight: 1.15,
            }}>
              Your next guest could be{' '}
              <span className="teal-shimmer" style={{ fontStyle: 'italic' }}>scanning in minutes.</span>
            </h2>
            <p style={{
              fontFamily: sans, fontSize: '16px', fontWeight: 300, color: muted,
              lineHeight: 1.8, margin: '0 auto 40px', maxWidth: '440px',
            }}>
              Set up your first property, print the QR code, and give your guests
              a stay they&apos;ll remember — all before checkout time.
            </p>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{
                position: 'absolute', inset: '-8px', borderRadius: '22px',
                background: 'radial-gradient(ellipse, rgba(20,184,166,0.35) 0%, transparent 70%)',
                filter: 'blur(12px)', pointerEvents: 'none',
              }} />
              <a href="/signup" className="lift" style={{
                position: 'relative',
                display: 'inline-block',
                background: `linear-gradient(135deg, ${tealD}, #10B981)`,
                color: white, fontFamily: sans, fontWeight: 600,
                fontSize: '15px', letterSpacing: '0.2px',
                padding: '17px 42px', borderRadius: '14px',
                textDecoration: 'none',
                boxShadow: `0 0 60px rgba(13,148,136,0.4), 0 4px 24px rgba(0,0,0,0.4)`,
              }}>
                Start your free trial
              </a>
            </div>
            <div style={{ fontFamily: sans, fontSize: '12px', color: 'rgba(248,250,252,0.28)', marginTop: '16px', letterSpacing: '0.4px' }}>
              14 days free · No credit card required
            </div>
          </FadeIn>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          borderTop: `1px solid ${border}`,
          maxWidth: '1100px', margin: '0 auto',
          padding: '36px 32px',
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>
          <span style={{ fontFamily: serif, fontSize: '18px', color: 'rgba(248,250,252,0.3)' }}>Pax</span>
          <div style={{ display: 'flex', gap: '28px' }}>
            {[['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, href]) => (
              <a key={href} href={href} style={{
                fontFamily: sans, fontSize: '12px', color: muted,
                textDecoration: 'none', letterSpacing: '0.2px',
              }}>
                {label}
              </a>
            ))}
          </div>
          <p style={{
            fontFamily: sans, fontSize: '11px', color: 'rgba(248,250,252,0.18)',
            margin: 0, width: '100%', lineHeight: 1.6,
          }}>
            Pax is an independent product and is not affiliated with, endorsed by, or connected to any booking or rental platform.
          </p>
        </footer>

      </div>
    </div>
  );
}
