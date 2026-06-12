'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { redirect } from 'next/navigation';

export type PropertyInput = {
  nickname: string;
  address: string;
  welcome_message: string;
  review_url: string;
  wifi_name: string;
  wifi_password: string;
  checkin_instructions: string;
  house_rules: string;
  late_checkout_enabled: boolean;
  late_checkout_price: number;
  early_checkin_enabled: boolean;
  early_checkin_price: number;
  cover_photo_url: string | null;
  local_recommendations: Array<{ name: string; category: string; note: string }>;
  property_videos: Array<{ title: string; url: string }>;
};

async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

// Server actions are public POST endpoints — a crafted payload could smuggle
// host_id / total_earned / id alongside the form fields, and the service-role
// client would write them. Only these exact fields ever reach the database.
function sanitize(data: PropertyInput) {
  return {
    nickname:              String(data.nickname ?? '').trim(),
    address:               String(data.address ?? ''),
    welcome_message:       String(data.welcome_message ?? ''),
    review_url:            String(data.review_url ?? ''),
    wifi_name:             String(data.wifi_name ?? ''),
    wifi_password:         String(data.wifi_password ?? ''),
    checkin_instructions:  String(data.checkin_instructions ?? ''),
    house_rules:           String(data.house_rules ?? ''),
    late_checkout_enabled: Boolean(data.late_checkout_enabled),
    late_checkout_price:   Math.max(0, Number(data.late_checkout_price) || 0),
    early_checkin_enabled: Boolean(data.early_checkin_enabled),
    early_checkin_price:   Math.max(0, Number(data.early_checkin_price) || 0),
    cover_photo_url:       data.cover_photo_url ? String(data.cover_photo_url) : null,
    local_recommendations: (Array.isArray(data.local_recommendations) ? data.local_recommendations : [])
      .map(r => ({ name: String(r.name ?? ''), category: String(r.category ?? 'food'), note: String(r.note ?? '') })),
    property_videos: (Array.isArray(data.property_videos) ? data.property_videos : [])
      .map(v => ({ title: String(v.title ?? ''), url: String(v.url ?? '') })),
  };
}

export async function createProperty(data: PropertyInput): Promise<{ error?: string } | void> {
  const user = await getAuthUser();
  const clean = sanitize(data);
  if (!clean.nickname) return { error: 'Property name is required' };

  const db = createServiceClient();
  const { data: property, error } = await db
    .from('properties')
    .insert({ ...clean, host_id: user.id })
    .select('id')
    .single();

  if (error) return { error: error.message };
  redirect(`/host/properties/${property.id}/qr`);
}

export async function updateProperty(id: string, data: PropertyInput): Promise<{ error?: string } | void> {
  const user = await getAuthUser();
  const clean = sanitize(data);
  if (!clean.nickname) return { error: 'Property name is required' };

  const db = createServiceClient();
  const { data: existing } = await db
    .from('properties')
    .select('host_id')
    .eq('id', id)
    .single();

  if (!existing || existing.host_id !== user.id) return { error: 'Property not found' };

  const { error } = await db.from('properties').update(clean).eq('id', id);
  if (error) return { error: error.message };

  redirect('/host/properties');
}

export async function deleteProperty(id: string): Promise<{ error?: string } | void> {
  const user = await getAuthUser();
  const db = createServiceClient();

  const { data: existing } = await db
    .from('properties')
    .select('host_id')
    .eq('id', id)
    .single();

  if (!existing || existing.host_id !== user.id) return { error: 'Property not found' };

  const { error } = await db.from('properties').delete().eq('id', id);
  if (error) return { error: error.message };

  redirect('/host/properties');
}
