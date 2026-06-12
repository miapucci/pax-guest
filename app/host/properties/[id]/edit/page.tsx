import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import PropertyForm from '../../_components/PropertyForm';

export const metadata: Metadata = { title: 'Edit property — Pax' };

const white = '#F8FAFC';
const serif = "var(--font-playfair), 'Playfair Display', Georgia, serif";
const sans  = "var(--font-inter), -apple-system, 'Inter', sans-serif";
const muted = 'rgba(248,250,252,0.42)';

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();
  const { data: property } = await db
    .from('properties')
    .select('id, host_id, nickname, address, welcome_message, review_url, wifi_name, wifi_password, checkin_instructions, house_rules, late_checkout_enabled, late_checkout_price, early_checkin_enabled, early_checkin_price, cover_photo_url, local_recommendations, property_videos')
    .eq('id', id)
    .single();

  if (!property || property.host_id !== user!.id) notFound();

  return (
    <div style={{ maxWidth: '760px' }}>
      <div style={{ marginBottom: '32px' }}>
        <a href="/host/properties" style={{ fontFamily: sans, fontSize: '13px', color: muted, textDecoration: 'none' }}>
          ← Properties
        </a>
        <h1 style={{ fontFamily: serif, fontSize: '30px', fontWeight: 400, color: white, margin: '12px 0 4px', letterSpacing: '-0.4px' }}>
          Edit property
        </h1>
        <p style={{ fontFamily: sans, fontSize: '14px', fontWeight: 300, color: muted, margin: 0 }}>
          {property.nickname}
        </p>
      </div>
      <PropertyForm property={property} />
    </div>
  );
}
