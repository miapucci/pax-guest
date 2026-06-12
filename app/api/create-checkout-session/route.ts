import Stripe from 'stripe';
import { createServerClient } from '@supabase/ssr';
import { createServiceClient } from '@/lib/supabase/service';
import { getBaseUrl } from '@/lib/base-url';
import { type NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Price IDs from your Stripe dashboard — add these to Vercel env vars
const PRICES: Record<string, string | undefined> = {
  core_monthly: process.env.STRIPE_PRICE_CORE_MONTHLY,
  core_annual:  process.env.STRIPE_PRICE_CORE_ANNUAL,
  pro_monthly:  process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual:   process.env.STRIPE_PRICE_PRO_ANNUAL,
};

export async function POST(req: NextRequest) {
  try {
    const { tier, billing, email: bodyEmail, hostId: bodyHostId } = await req.json();

    if (!tier || !billing) {
      return Response.json({ error: 'Missing tier or billing' }, { status: 400 });
    }

    // Prefer the logged-in session (web host portal); fall back to body values (legacy iOS app)
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return req.cookies.getAll(); }, setAll() {} } }
    );
    const { data: { user } } = await authClient.auth.getUser();

    const email  = user?.email ?? bodyEmail;
    const hostId = user?.id ?? bodyHostId;

    if (!email) {
      return Response.json({ error: 'Missing email' }, { status: 400 });
    }

    // Never create a second subscription for an already-subscribed host —
    // plan changes go through the Stripe billing portal, not a new checkout.
    if (hostId) {
      const db = createServiceClient();
      const { data: profile } = await db
        .from('profiles')
        .select('subscription_status')
        .eq('id', hostId)
        .maybeSingle();
      if (profile?.subscription_status === 'active') {
        return Response.json(
          { error: 'You already have an active subscription. Use “Manage subscription” to change plans.' },
          { status: 400 }
        );
      }
    }

    const priceId = PRICES[`${tier}_${billing}`];
    if (!priceId) {
      return Response.json(
        { error: `No price configured for ${tier}/${billing}. Add STRIPE_PRICE_${tier.toUpperCase()}_${billing.toUpperCase()} to env vars.` },
        { status: 400 }
      );
    }

    const base = getBaseUrl();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/host/billing`,
      metadata: { hostId: hostId ?? '', tier: tier ?? '' },
    });

    return Response.json({ url: session.url });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
