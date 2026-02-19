import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { requestId } = await req.json();
    if (!requestId) return Response.json({ error: 'Missing requestId' }, { status: 400 });

    const { data: request, error } = await supabase
      .from('upsell_requests')
      .select('*, properties(total_earned, checkout_count, early_checkin_count)')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    if (!request.payment_intent_id) {
      return Response.json({ error: 'No payment intent on this request' }, { status: 400 });
    }

    // Capture the authorized payment — this is when the guest's card is charged
    const pi = await stripe.paymentIntents.capture(request.payment_intent_id);

    if (pi.status !== 'succeeded') {
      return Response.json({ error: `Capture failed: ${pi.status}` }, { status: 402 });
    }

    // Mark request approved
    await supabase
      .from('upsell_requests')
      .update({ status: 'approved' })
      .eq('id', requestId);

    // Update property earnings
    const prop = request.properties;
    const earned = pi.amount / 100;
    await supabase
      .from('properties')
      .update({
        total_earned: (prop.total_earned ?? 0) + earned,
        ...(request.type === 'late_checkout'
          ? { checkout_count: (prop.checkout_count ?? 0) + 1 }
          : { early_checkin_count: (prop.early_checkin_count ?? 0) + 1 }),
      })
      .eq('id', request.property_id);

    return Response.json({ success: true, earned });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
