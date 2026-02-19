import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { propertyId, type } = await req.json();

    if (!propertyId || !type) {
      return Response.json({ error: 'Missing propertyId or type' }, { status: 400 });
    }

    const { data: property, error } = await supabase
      .from('properties')
      .select('late_checkout_price, early_checkin_price, late_checkout_enabled, early_checkin_enabled')
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    const isLate = type === 'late_checkout';
    const enabled = isLate ? property.late_checkout_enabled : property.early_checkin_enabled;
    if (!enabled) {
      return Response.json({ error: 'This upsell is not available' }, { status: 400 });
    }

    const price = isLate ? property.late_checkout_price : property.early_checkin_price;
    const amountCents = Math.round(price * 100);

    // capture_method: 'manual' means the card is authorized (held) now,
    // but only charged when the host explicitly approves (capture).
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      capture_method: 'manual',
      metadata: { propertyId, type },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
