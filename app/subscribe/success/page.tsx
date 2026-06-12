export default function SubscribeSuccess() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#09080c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        maxWidth: 480,
        textAlign: 'center',
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          border: '1px solid rgba(201,169,110,0.3)',
          background: 'rgba(201,169,110,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: 28,
        }}>
          ✓
        </div>

        <p style={{
          margin: '0 0 8px',
          fontSize: 12,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'rgba(201,169,110,0.7)',
        }}>
          Subscription Active
        </p>

        <h1 style={{
          margin: '0 0 20px',
          fontSize: 32,
          fontWeight: 400,
          color: '#EDE6D3',
          lineHeight: 1.3,
        }}>
          Welcome to Pax.
        </h1>

        <p style={{
          margin: '0 0 32px',
          fontSize: 15,
          color: 'rgba(237,230,211,0.55)',
          lineHeight: 1.8,
        }}>
          Your subscription is live. Your guest portal and upsell tools are fully unlocked.
        </p>

        <a href="/host" style={{
          display: 'inline-block',
          margin: '0 0 32px',
          padding: '14px 32px',
          borderRadius: 14,
          background: 'linear-gradient(135deg, #0D9488, #10B981)',
          color: '#F8FAFC',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
          textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(13,148,136,0.3)',
        }}>
          Go to your dashboard
        </a>

        <p style={{
          margin: 0,
          fontSize: 12,
          color: 'rgba(237,230,211,0.2)',
          lineHeight: 1.6,
        }}>
          Zuzi Development LLC · Manage your subscription anytime from Billing.
        </p>
      </div>
    </main>
  );
}
