import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { type NextRequest } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
        if (tokenUser) userId = tokenUser.id;
      }
    }

    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_account_id')
      .eq('id', userId)
      .single();

    let accountId = profile?.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'express' });
      accountId = account.id;
      // upsert: hosts may not have a profiles row yet — update alone would silently no-op
      await supabase
        .from('profiles')
        .upsert({ id: userId, stripe_account_id: accountId });
    }

    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.paxhq.co';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${base}/connect/refresh`,
      return_url: `${base}/connect/success`,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url });
  } catch (e: any) {
    return Response.json({ error: e.message ?? 'Internal error' }, { status: 500 });
  }
}
