import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record; // the new upsell_request row

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get the property and its host
    const { data: property } = await supabase
      .from('properties')
      .select('host_id, nickname')
      .eq('id', record.property_id)
      .single();

    if (!property) return new Response('Property not found', { status: 200 });

    // Get the host's Expo push token from their user metadata
    const { data: { user } } = await supabase.auth.admin.getUserById(property.host_id);
    const pushToken = user?.user_metadata?.push_token;

    if (!pushToken) return new Response('No push token', { status: 200 });

    const typeLabel = record.type === 'late_checkout' ? 'Late Checkout' : 'Early Check-in';
    const price = record.amount ? `· $${record.amount / 100}` : '';

    // Send the Expo push notification
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: pushToken,
        title: `New Request · ${property.nickname}`,
        body: `${record.guest_name} requested ${typeLabel} ${price}`.trim(),
        sound: 'default',
        data: { requestId: record.id, propertyId: record.property_id },
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    return new Response(String(e), { status: 500 });
  }
});
