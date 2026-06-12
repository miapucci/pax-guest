import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const supabase = createClient(
    'https://vkuwtrgiccizasjwkidi.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  // Verify the request is from Supabase webhook
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const record = body.record;

  if (!record?.property_id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // Get the property and its host
  const { data: property } = await supabase
    .from('properties')
    .select('host_id, nickname, late_checkout_price, early_checkin_price')
    .eq('id', record.property_id)
    .single();

  if (!property) {
    return NextResponse.json({ message: 'Property not found' }, { status: 200 });
  }

  // Get the host's push token from their user metadata
  const { data: { user } } = await supabase.auth.admin.getUserById(property.host_id);
  const pushToken = user?.user_metadata?.push_token;

  if (!pushToken) {
    return NextResponse.json({ message: 'No push token registered' }, { status: 200 });
  }

  // Send Expo push notification
  const type = record.type === 'late_checkout' ? 'Late Checkout' : 'Early Check-in';
  const price = record.type === 'late_checkout'
    ? property.late_checkout_price
    : property.early_checkin_price;

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      title: `New ${type} Request — $${price}`,
      body: `${record.guest_name} at ${property.nickname} — tap to approve`,
      sound: 'default',
      badge: 1,
      data: { requestId: record.id, type: record.type },
    }),
  });

  const result = await response.json();
  return NextResponse.json({ success: true, result });
}
