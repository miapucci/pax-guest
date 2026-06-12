import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Pax',
  description: 'How Pax collects, uses, and protects your information.',
};

const bg      = '#0c0d12';
const white   = '#F8FAFC';
const muted   = 'rgba(248,250,252,0.5)';
const border  = 'rgba(255,255,255,0.07)';
const teal    = '#14B8A6';
const serif   = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans    = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default function PrivacyPage() {
  return (
    <div style={{ background: bg, minHeight: '100dvh', color: white, fontFamily: sans }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 32px 100px' }}>

        {/* Back */}
        <a href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontFamily: sans, fontSize: '13px', color: muted,
          textDecoration: 'none', marginBottom: '56px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Pax
        </a>

        <p style={{ fontFamily: sans, fontSize: '12px', fontWeight: 500, color: teal, letterSpacing: '1.2px', textTransform: 'uppercase', marginBottom: '16px' }}>
          Legal
        </p>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(36px, 5vw, 54px)', fontWeight: 400, color: white, margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', color: muted, margin: '0 0 56px' }}>
          Last updated: March 23, 2026
        </p>

        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          <Section title="Overview">
            Zuzi Development LLC ("Pax," "we," "us," or "our") operates a software platform that allows short-term rental hosts to create digital property guides and offer optional upsell services to their guests. This Privacy Policy explains how we collect, use, and protect information in connection with our mobile application and web portal (collectively, the "Service").
          </Section>

          <Section title="Information We Collect">
            <Strong>From hosts:</Strong> When you create an account, we collect your email address and any property information you choose to enter, including property name, address, Wi-Fi credentials, house rules, welcome messages, and media uploads. We also collect your Stripe customer ID and subscription status to manage billing.
            <br/><br/>
            <Strong>From guests:</Strong> Guests access the Service by scanning a QR code provided by a host. We collect only the information necessary to process an upsell request: the guest's name and email address if they submit a checkout or check-in request. We do not require guests to create an account.
            <br/><br/>
            <Strong>Automatically:</Strong> We collect standard usage data including IP addresses, device type, browser information, and pages visited, for security and analytics purposes.
          </Section>

          <Section title="How We Use Your Information">
            We use the information we collect to:
            <List items={[
              'Provide, operate, and improve the Service',
              'Process upsell payments through our payment processor, Stripe',
              'Send transactional emails (booking confirmations, request notifications) via Resend',
              'Send push notifications to host devices via Expo',
              'Respond to support requests',
              'Detect and prevent fraud or abuse',
            ]} />
            We do not sell your personal information to third parties.
          </Section>

          <Section title="Guest Data Retention">
            Guest data — including names, email addresses, and upsell request details — is automatically deleted from our systems 14 days after a request is submitted. Hosts do not have the ability to export or retain guest data beyond what is visible in the app during the active period.
          </Section>

          <Section title="Third-Party Services">
            Pax uses the following third-party service providers, each subject to their own privacy policies:
            <List items={[
              'Stripe — payment processing (stripe.com/privacy)',
              'Supabase — database and authentication infrastructure (supabase.com/privacy)',
              'Resend — transactional email delivery (resend.com/privacy)',
              'Expo / Expo Push Notifications — push notification delivery (expo.dev/privacy)',
              'Vercel — web hosting (vercel.com/legal/privacy-policy)',
            ]} />
          </Section>

          <Section title="Data Security">
            We implement industry-standard security measures including encrypted data transmission (TLS), row-level security on our database, and scoped API keys. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </Section>

          <Section title="Children's Privacy">
            The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected such information, please contact us and we will delete it promptly.
          </Section>

          <Section title="Your Rights">
            You may request access to, correction of, or deletion of your personal data at any time by contacting us at the address below. Host accounts can be deleted by contacting us directly, which will result in the removal of all associated property and profile data.
          </Section>

          <Section title="Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify registered hosts of material changes via email. Continued use of the Service after changes are posted constitutes your acceptance of the updated policy.
          </Section>

          <Section title="Contact">
            Zuzi Development LLC<br/>
            <a href="mailto:support@paxhq.co" style={{ color: teal, textDecoration: 'none' }}>support@paxhq.co</a>
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{
        fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        fontSize: '22px', fontWeight: 400, color: '#F8FAFC',
        margin: '0 0 14px', letterSpacing: '-0.2px',
      }}>
        {title}
      </h2>
      <p style={{
        fontFamily: "var(--font-inter), -apple-system, 'Inter', sans-serif",
        fontSize: '15px', fontWeight: 300,
        color: 'rgba(248,250,252,0.6)', lineHeight: 1.85, margin: 0,
      }}>
        {children}
      </p>
    </div>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#F8FAFC', fontWeight: 400 }}>{children}</span>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: '14px 0 0', paddingLeft: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {items.map(item => (
        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span style={{ color: '#14B8A6', marginTop: '2px', flexShrink: 0 }}>–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
