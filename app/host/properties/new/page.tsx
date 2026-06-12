import type { Metadata } from 'next';
import PropertyForm from '../_components/PropertyForm';

export const metadata: Metadata = { title: 'Add property — Pax' };

const white = '#F8FAFC';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";
const muted = 'rgba(248,250,252,0.42)';

export default function NewPropertyPage() {
  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '32px' }}>
        <a href="/host/properties" style={{ fontFamily: sans, fontSize: '13px', color: muted, textDecoration: 'none' }}>
          ← Properties
        </a>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '12px 0 4px', letterSpacing: '-0.4px' }}>
          Add property
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
          Fill in the details — you can always edit later.
        </p>
      </div>
      <PropertyForm />
    </div>
  );
}
