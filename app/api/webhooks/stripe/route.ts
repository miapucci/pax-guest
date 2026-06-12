import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function planFromPriceId(priceId: string): 'core' | 'pro' | null {
  const coreIds = [
    process.env.STRIPE_PRICE_CORE_MONTHLY,
    process.env.STRIPE_PRICE_CORE_ANNUAL,
  ].filter(Boolean);
  const proIds = [
    process.env.STRIPE_PRICE_PRO_MONTHLY,
    process.env.STRIPE_PRICE_PRO_ANNUAL,
  ].filter(Boolean);
  if (coreIds.includes(priceId)) return 'core';
  if (proIds.includes(priceId)) return 'pro';
  return null;
}

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return Response.json({ error: 'Missing signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (e: any) {
    return Response.json({ error: `Webhook error: ${e.message}` }, { status: 400 });
  }

  switch (event.type) {
    // Host completed checkout — subscription is now active
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const hostId = session.metadata?.hostId;
      if (!hostId) break;

      const tier = session.metadata?.tier ?? null;
      const plan = tier === 'core' || tier === 'pro' ? tier : null;

      await supabase
        .from('profiles')
        .upsert({
          id: hostId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          subscription_status: 'active',
          ...(plan ? { plan } : {}),
          updated_at: new Date().toISOString(),
        });
      break;
    }

    // Subscription renewed, changed (e.g. Core → Pro upgrade via portal), or payment failed
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const priceId = sub.items.data[0]?.price?.id;
      const plan = priceId ? planFromPriceId(priceId) : null;

      await supabase
        .from('profiles')
        .update({
          subscription_status: sub.status,
          ...(plan ? { plan } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id);
      break;
    }

    // Subscription renewal payment failed
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | { id: string } | null };
      const sub = invoice.subscription;
      const subId = typeof sub === 'string' ? sub : sub?.id;
      if (!subId) break;

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subId);
      break;
    }

    // Subscription cancelled
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;

      await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          plan: null,
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', sub.id);
      break;
    }
  }

  return Response.json({ received: true });
}
