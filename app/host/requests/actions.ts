'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export type RequestRow = {
  id: string;
  property_id: string;
  property_nickname: string;
  type: 'late_checkout' | 'early_checkin';
  guest_name: string;
  guest_email: string;
  note: string | null;
  status: 'pending' | 'approved' | 'declined';
  payment_intent_id: string | null;
  amount: number | null;
  created_at: string;
};

export async function fetchHostRequests(): Promise<{ requests: RequestRow[]; propertyIds: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { requests: [], propertyIds: [] };

  const db = createServiceClient();

  const { data: properties } = await db
    .from('properties')
    .select('id, nickname')
    .eq('host_id', user.id);

  const propertyIds = (properties ?? []).map((p: { id: string }) => p.id);
  const propertyMap = Object.fromEntries(
    (properties ?? []).map((p: { id: string; nickname: string }) => [p.id, p.nickname])
  );

  if (propertyIds.length === 0) return { requests: [], propertyIds: [] };

  const { data: rows } = await db
    .from('upsell_requests')
    .select('id, property_id, type, guest_name, guest_email, note, status, payment_intent_id, amount, created_at')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false });

  const requests: RequestRow[] = (rows ?? []).map((r: any) => ({
    ...r,
    property_nickname: propertyMap[r.property_id] ?? 'Unknown property',
  }));

  return { requests, propertyIds };
}
