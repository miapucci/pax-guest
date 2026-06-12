import type { Metadata } from 'next';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import BillingClient, { type PayoutsState } from './_components/BillingClient';

export const metadata: Metadata = { title: 'Billing' };
export const revalidate = 0;

export default async function BillingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createServiceClient();
  const { data: profile } = await db
    .from('profiles')
    .select('subscription_status, plan, stripe_customer_id, stripe_account_id')
    .eq('id', user!.id)
    .maybeSingle();

  // Payout readiness: no account → none; account but onboarding unfinished → incomplete
  let payouts: PayoutsState = 'none';
  if (profile?.stripe_account_id) {
    payouts = 'incomplete';
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const account = await stripe.accounts.retrieve(profile.stripe_account_id);
      if (account.charges_enabled) payouts = 'active';
    } catch {
      // Stripe unreachable / key missing — leave as 'incomplete' so the CTA still shows
    }
  }

  const daysSinceSignup = Math.floor((Date.now() - new Date(user!.created_at).getTime()) / 86_400_000);
  const trialDaysLeft   = 14 - daysSinceSignup;

  return (
    <BillingClient
      status={profile?.subscription_status ?? null}
      plan={profile?.plan ?? null}
      hasStripeCustomer={!!profile?.stripe_customer_id}
      trialDaysLeft={trialDaysLeft}
      payouts={payouts}
    />
  );
}
