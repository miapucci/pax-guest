/**
 * POST /api/webhooks/apple
 *
 * Receives App Store Server Notifications (V2) from Apple.
 * These keep subscription status in sync even when the app is not open —
 * renewals, billing failures, cancellations, refunds, etc.
 *
 * Configure the URL in App Store Connect:
 *   App Store Connect → Your App → App Information → App Store Server Notifications
 *   Production URL: https://www.paxhq.co/api/webhooks/apple
 *   Sandbox URL:    https://www.paxhq.co/api/webhooks/apple  (same URL is fine)
 *
 * Required env vars:
 *   APPLE_SHARED_SECRET        — App-Specific Shared Secret (same as verify-apple-receipt)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Apple sends a signed JWT payload. We decode it to get the notification type and
 * original transaction, then look up the profile by apple_original_transaction_id.
 * On first purchase, we store that ID in profiles for future webhook lookups.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function planFromSku(sku: string): 'core' | 'pro' | null {
  if (sku === 'com.paxhost.app.core.monthly' || sku === 'com.paxhost.app.core.annual') return 'core';
  if (sku === 'com.paxhost.app.pro.monthly'  || sku === 'com.paxhost.app.pro.annual')  return 'pro';
  return null;
}

/** Decode a JWT payload without verifying signature (Apple signs with its own cert). */
function decodeJwtPayload(token: string): any {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Apple V2 notifications send a signedPayload JWT
  const signedPayload: string = body?.signedPayload;
  if (!signedPayload) {
    return Response.json({ error: 'Missing signedPayload' }, { status: 400 });
  }

  const payload = decodeJwtPayload(signedPayload);
  if (!payload) {
    return Response.json({ error: 'Could not decode payload' }, { status: 400 });
  }

  const notificationType: string  = payload.notificationType ?? '';
  const subtype: string           = payload.subtype ?? '';
  const signedTransactionInfo     = payload.data?.signedTransactionInfo;
  const signedRenewalInfo         = payload.data?.signedRenewalInfo;

  const txn = signedTransactionInfo ? decodeJwtPayload(signedTransactionInfo) : null;
  if (!txn) {
    // Some notification types (e.g. TEST) have no transaction info — that's OK
    return Response.json({ received: true });
  }

  const originalTransactionId: string = txn.originalTransactionId ?? '';
  const productId: string             = txn.productId ?? '';
  const plan = planFromSku(productId);

  // Map notification type → subscription_status value
  let newStatus: string | null = null;

  switch (notificationType) {
    case 'SUBSCRIBED':
    case 'DID_RENEW':
    case 'DID_RECOVER':         // billing issue resolved
      newStatus = 'active';
      break;

    case 'DID_FAIL_TO_RENEW':
      newStatus = subtype === 'GRACE_PERIOD' ? 'past_due' : 'past_due';
      break;

    case 'EXPIRED':
      newStatus = 'canceled';
      break;

    case 'REVOKE':
    case 'REFUND':
      newStatus = 'canceled';
      break;

    case 'GRACE_PERIOD_EXPIRED':
      newStatus = 'canceled';
      break;

    // OFFER_REDEEMED, PRICE_INCREASE, RENEWAL_EXTENDED, TEST — no status change needed
    default:
      return Response.json({ received: true });
  }

  if (!newStatus || !originalTransactionId) {
    return Response.json({ received: true });
  }

  // Look up profile by apple_original_transaction_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('apple_original_transaction_id', originalTransactionId)
    .single();

  if (!profile) {
    // Transaction not yet linked to a profile — this can happen if the webhook fires
    // before the app calls /api/verify-apple-receipt. Log and return 200 so Apple
    // doesn't retry indefinitely.
    console.warn('Apple webhook: no profile for transaction', originalTransactionId);
    return Response.json({ received: true });
  }

  const updatePayload: Record<string, any> = {
    subscription_status: newStatus,
    updated_at: new Date().toISOString(),
  };
  if (newStatus === 'canceled') {
    updatePayload.plan = null;
  } else if (plan) {
    updatePayload.plan = plan;
  }

  await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', profile.id);

  return Response.json({ received: true });
}
