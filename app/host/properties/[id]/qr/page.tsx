import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import QRDisplay from '../../_components/QRDisplay';

export const metadata: Metadata = { title: 'QR Code — Pax' };

const white = '#F8FAFC';
const muted = 'rgba(248,250,252,0.42)';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";

export default async function QRPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();
  const { data: property } = await db
    .from('properties')
    .select('id, host_id, nickname')
    .eq('id', id)
    .single();

  if (!property || property.host_id !== user!.id) notFound();

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <a href="/host/properties" style={{ fontFamily: sans, fontSize: '13px', color: muted, textDecoration: 'none' }}>
          ← Properties
        </a>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '12px 0 4px', letterSpacing: '-0.4px' }}>
          QR Code
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
          {property.nickname}
        </p>
      </div>

      <QRDisplay propertyId={property.id} propertyName={property.nickname} />

      <div style={{ marginTop: '28px' }}>
        <a href={`/host/properties/${property.id}/edit`} style={{
          fontFamily: sans, fontSize: '13px', color: muted, textDecoration: 'none',
        }}>
          Edit property details →
        </a>
      </div>
    </div>
  );
}
