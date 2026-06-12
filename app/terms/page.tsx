import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Pax',
  description: 'Terms governing your use of the Pax platform.',
};

const bg    = '#0c0d12';
const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.5)';
const border = 'rgba(255,255,255,0.07)';
const teal  = '#14B8A6';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', color: muted, margin: '0 0 56px' }}>
          Last updated: March 23, 2026
        </p>

        <div style={{ borderTop: `1px solid ${border}`, paddingTop: '48px', display: 'flex', flexDirection: 'column', gap: '48px' }}>

          <Section title="Acceptance of Terms">
            By downloading, installing, or using the Pax mobile application or web portal (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and Zuzi Development LLC ("Pax," "we," "us," or "our").
          </Section>

          <Section title="No Affiliation with Booking Platforms">
            <Strong>Pax is an independent software product. Zuzi Development LLC is not affiliated with, endorsed by, sponsored by, or in any way connected to Airbnb, Vrbo, Booking.com, or any other short-term rental platform, booking service, or marketplace (collectively, "Booking Platforms").</Strong>
            <br/><br/>
            The Pax name, branding, and Service are entirely independent. Any reference to Airbnb, Vrbo, or similar platforms within the Service is solely for the purpose of describing compatible use cases and does not imply any relationship, partnership, or approval by those platforms.
          </Section>

          <Section title="Host Responsibility for Platform Compliance">
            <Strong>This is critical. Please read carefully.</Strong>
            <br/><br/>
            Pax provides software tools that enable hosts to offer optional upsell services (such as late checkout and early check-in) directly to their guests. These transactions occur outside of and independently from any Booking Platform.
            <br/><br/>
            Many Booking Platforms, including Airbnb, have terms of service that govern or restrict off-platform payments, additional charges to guests, and direct financial transactions between hosts and guests. <Strong>It is your sole responsibility as a host to review and comply with the terms of service of any Booking Platform you use.</Strong>
            <br/><br/>
            By using Pax, you acknowledge and agree that:
            <List items={[
              'Pax does not represent, warrant, or guarantee that your use of the Service is permitted under the terms of any Booking Platform',
              'Pax has no obligation to monitor, enforce, or advise you on Booking Platform compliance',
              'Pax bears no liability whatsoever for any consequences arising from your use of the Service in connection with a Booking Platform, including but not limited to account suspension, removal, financial penalties, or legal action by a Booking Platform',
              'You are solely responsible for obtaining any consents or approvals required by your Booking Platform before using Pax features with guests from that platform',
              'Pax strongly recommends consulting the terms of service of any Booking Platform you use before activating upsell features',
            ]} />
          </Section>

          <Section title="Guest Upsell Transactions">
            When a guest submits a late checkout or early check-in request through Pax, the resulting transaction is a direct, voluntary agreement between the host and the guest. Pax facilitates payment processing through Stripe on behalf of the host but is not a party to the underlying agreement.
            <br/><br/>
            Hosts are responsible for honoring any approved requests and for resolving any disputes with guests directly. Pax may reverse or cancel payments in cases of fraud, chargebacks, or violations of these Terms but is not obligated to mediate host-guest disputes.
          </Section>

          <Section title="Subscription and Billing">
            Pax offers paid subscription plans (Core and Pro) billed monthly or annually. All billing is processed through Stripe. By subscribing, you authorize recurring charges to your payment method at the selected billing interval.
            <br/><br/>
            Subscriptions may be cancelled at any time before the next billing date. Cancellation takes effect at the end of the current billing period — no prorated refunds are issued for unused time. Pax reserves the right to modify pricing with 30 days' notice to active subscribers.
            <br/><br/>
            The Core plan is limited to 5 properties. Exceeding this limit requires upgrading to the Pro plan. Pax reserves the right to suspend access to properties beyond the plan limit if the host does not upgrade.
          </Section>

          <Section title="Acceptable Use">
            You agree not to use the Service to:
            <List items={[
              'Violate any applicable law or regulation',
              'Defraud, deceive, or mislead guests',
              'Collect payments for services you do not intend to provide',
              'Attempt to reverse-engineer, scrape, or otherwise access the Service in unauthorized ways',
              'Use the Service in any manner that could damage, disable, or impair our infrastructure',
            ]} />
          </Section>

          <Section title="Intellectual Property">
            All content, design, code, and materials comprising the Service are the property of Zuzi Development LLC and are protected by applicable intellectual property laws. You are granted a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. You may not reproduce, distribute, or create derivative works from any part of the Service without our written consent.
          </Section>

          <Section title="Disclaimer of Warranties">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. PAX DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
          </Section>

          <Section title="Limitation of Liability">
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, PAX TECHNOLOGIES LLC AND ITS OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING LOSS OF REVENUE, LOSS OF DATA, OR ACCOUNT SUSPENSION BY A THIRD-PARTY PLATFORM — ARISING FROM YOUR USE OF THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            <br/><br/>
            OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID TO PAX IN THE THREE MONTHS PRECEDING THE CLAIM.
          </Section>

          <Section title="Indemnification">
            You agree to indemnify, defend, and hold harmless Zuzi Development LLC and its officers, employees, and agents from and against any claims, liabilities, damages, losses, and expenses — including reasonable legal fees — arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party platform's terms of service; or (d) any dispute between you and a guest.
          </Section>

          <Section title="Termination">
            Pax reserves the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or any reason we determine poses a risk to the Service or other users. You may terminate your account at any time by contacting us.
          </Section>

          <Section title="Governing Law">
            These Terms are governed by the laws of the State of Delaware, without regard to conflict of law principles. Any disputes arising under these Terms shall be resolved exclusively in the state or federal courts located in Delaware, and you consent to personal jurisdiction in those courts.
          </Section>

          <Section title="Changes to These Terms">
            We may update these Terms from time to time. Material changes will be communicated to registered hosts via email at least 14 days before taking effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
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
