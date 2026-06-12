import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // Web host portal: session cookie. Legacy iOS app: Authorization bearer token.
    let userId: string | null = null;

    const cookieClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return req.cookies.getAll(); }, setAll() {} } }
    );
    const { data: { user: cookieUser } } = await cookieClient.auth.getUser();
    if (cookieUser) {
      userId = cookieUser.id;
    } else {
      const authHeader = req.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const { data: { user: tokenUser } } = await supabase.auth.getUser(authHeader.slice(7));
        if (tokenUser) userId = tokenUser.id;
      }
    }

    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Cancel any active Stripe subscription BEFORE deleting the profile —
    // otherwise the host keeps getting billed with no row left to map the webhook to.
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_subscription_id')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.stripe_subscription_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        await stripe.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (e: any) {
        // Already-canceled subscriptions throw — that's fine. Anything else must
        // block the deletion so we never orphan a live billing relationship.
        if (e?.code !== 'resource_missing' && !`${e?.message}`.includes('canceled')) {
          return Response.json(
            { error: 'Could not cancel your subscription — contact support before deleting.' },
            { status: 500 }
          );
        }
      }
    }

    // Delete all properties (cascades to upsell_requests via FK)
    await supabase.from('properties').delete().eq('host_id', userId);

    // Delete profile
    await supabase.from('profiles').delete().eq('id', userId);

    // Delete the auth user
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteError) {
      return Response.json({ error: deleteError.message }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
