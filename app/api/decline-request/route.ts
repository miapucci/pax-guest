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
      .select('payment_intent_id, status')
      .eq('id', requestId)
      .single();

    if (error || !request) {
      return Response.json({ error: 'Request not found' }, { status: 404 });
    }

    if (request.status !== 'pending') {
      return Response.json({ error: 'Request already handled' }, { status: 400 });
    }

    // Cancel the PaymentIntent — releases the hold on the guest's card
    if (request.payment_intent_id) {
      await stripe.paymentIntents.cancel(request.payment_intent_id);
    }

    await supabase
      .from('upsell_requests')
      .update({ status: 'declined' })
      .eq('id', requestId);

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
