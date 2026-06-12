import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { createServiceClient } from '@/lib/supabase/service';
import { notFound } from 'next/navigation';
import GuestClient from './GuestClient';

export interface Property {
  id: string;
  nickname: string;
  address: string;
  cover_photo_url: string | null;
  welcome_message: string | null;
  wifi_name: string;
  wifi_password: string;
  late_checkout_enabled: boolean;
  late_checkout_price: number;
  early_checkin_enabled: boolean;
  early_checkin_price: number;
  checkin_instructions: string | null;
  house_rules: string | null;
  local_recommendations: Array<{ name: string; category: string; note: string }> | null;
  property_videos: Array<{ title: string; url: string }> | null;
  review_url: string | null;
}

// A host can only take upgrade payments with a fully onboarded Stripe account.
// If they can't, guests must not see the upgrade options at all.
async function hostCanReceivePayouts(hostId: string | null): Promise<boolean> {
  if (!hostId) return false;
  try {
    const db = createServiceClient();
    const { data: profile } = await db
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', hostId)
      .maybeSingle();
    if (!profile?.stripe_account_id) return false;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const account = await stripe.accounts.retrieve(profile.stripe_account_id);
    return !!account.charges_enabled;
  } catch {
    return false;
  }
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  const { data: property, error } = await supabase
    .from('properties')
    .select('id, host_id, nickname, address, cover_photo_url, welcome_message, wifi_name, wifi_password, late_checkout_enabled, late_checkout_price, early_checkin_enabled, early_checkin_price, checkin_instructions, house_rules, local_recommendations, property_videos, review_url')
    .eq('id', propertyId)
    .single();

  if (error || !property) notFound();

  // Suppress upgrades entirely when the host can't be paid — anything else misleads the guest
  const upsellsWanted = property.late_checkout_enabled || property.early_checkin_enabled;
  if (upsellsWanted && !(await hostCanReceivePayouts(property.host_id))) {
    property.late_checkout_enabled = false;
    property.early_checkin_enabled = false;
  }

  // Traffic logging for the dev portal — must never break the guest experience
  try {
    const db = createServiceClient();
    await db.from('events').insert({
      event_type: 'guest.portal_view',
      entity_type: 'property',
      entity_id: propertyId,
      metadata: { nickname: property.nickname },
      severity: 'info',
    });
  } catch {}

  return <GuestClient property={property as Property} />;
}
