import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!,
);

export async function POST(req: NextRequest) {
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
    .select('host_id, nickname')
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
    ? user?.user_metadata?.late_checkout_price
    : user?.user_metadata?.early_checkin_price;

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      to: pushToken,
      title: `New ${type} Request`,
      body: `${record.guest_name} at ${property.nickname} — open app to approve`,
      sound: 'default',
      badge: 1,
      data: { requestId: record.id, type: record.type },
    }),
  });

  const result = await response.json();
  return NextResponse.json({ success: true, result });
}
