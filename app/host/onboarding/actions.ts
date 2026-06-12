'use server';

import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';

export type OnboardingInput = {
  nickname: string;
  address: string;
  wifi_name: string;
  wifi_password: string;
  welcome_message: string;
  late_checkout_enabled: boolean;
  late_checkout_price: number;
  early_checkin_enabled: boolean;
  early_checkin_price: number;
};

export async function completeOnboarding(
  data: OnboardingInput
): Promise<{ propertyId?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized' };

  // Whitelist fields — server actions are public endpoints, so never spread
  // client data straight into a service-role insert.
  const clean = {
    nickname:              String(data.nickname ?? '').trim(),
    address:               String(data.address ?? ''),
    wifi_name:             String(data.wifi_name ?? ''),
    wifi_password:         String(data.wifi_password ?? ''),
    welcome_message:       String(data.welcome_message ?? ''),
    late_checkout_enabled: Boolean(data.late_checkout_enabled),
    late_checkout_price:   Math.max(0, Number(data.late_checkout_price) || 0),
    early_checkin_enabled: Boolean(data.early_checkin_enabled),
    early_checkin_price:   Math.max(0, Number(data.early_checkin_price) || 0),
  };

  if (!clean.nickname) return { error: 'Property name is required' };

  const db = createServiceClient();
  const { data: property, error } = await db
    .from('properties')
    .insert({ ...clean, host_id: user.id })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { propertyId: property.id };
}
