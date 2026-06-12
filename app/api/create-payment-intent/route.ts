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
      .select('late_checkout_price, early_checkin_price, late_checkout_enabled, early_checkin_enabled, host_id')
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

    // Stripe's minimum charge is $0.50 — a zero/negative price means the host
    // misconfigured the upsell, so refuse rather than error mid-payment.
    if (!Number.isFinite(amountCents) || amountCents < 50) {
      return Response.json({ error: 'This upgrade is not available right now' }, { status: 400 });
    }

    // Look up host's connected Stripe account for direct payouts
    let stripeAccountId: string | null = null;
    if (property.host_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_account_id')
        .eq('id', property.host_id)
        .single();
      stripeAccountId = profile?.stripe_account_id ?? null;
    }

    // Hard requirement: without a connected account the funds would land in the
    // platform balance instead of the host's — block rather than misroute money.
    if (!stripeAccountId) {
      return Response.json(
        { error: 'This host has not finished setting up payouts yet. Please contact them directly.' },
        { status: 400 }
      );
    }

    // An Express account that never finished onboarding can't receive transfers —
    // catch it here rather than failing at capture time when the host approves.
    const account = await stripe.accounts.retrieve(stripeAccountId);
    if (!account.charges_enabled) {
      return Response.json(
        { error: 'This host has not finished setting up payouts yet. Please contact them directly.' },
        { status: 400 }
      );
    }

    // capture_method: 'manual' means the card is authorized (held) now,
    // but only charged when the host explicitly approves (capture).
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      capture_method: 'manual',
      metadata: { propertyId, type },
      transfer_data: { destination: stripeAccountId },
    });

    return Response.json({ clientSecret: paymentIntent.client_secret });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
