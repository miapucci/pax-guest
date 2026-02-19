import { supabase } from '@/lib/supabase';
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

export default async function GuestPage({
  params,
}: {
  params: Promise<{ propertyId: string }>;
}) {
  const { propertyId } = await params;

  const { data: property, error } = await supabase
    .from('properties')
    .select('id, nickname, address, cover_photo_url, welcome_message, wifi_name, wifi_password, late_checkout_enabled, late_checkout_price, early_checkin_enabled, early_checkin_price, checkin_instructions, house_rules, local_recommendations, property_videos, review_url')
    .eq('id', propertyId)
    .single();

  if (error || !property) notFound();

  return <GuestClient property={property as Property} />;
}
