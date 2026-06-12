/**
 * POST /api/verify-apple-receipt
 *
 * Called by the iOS host app immediately after a StoreKit purchase completes.
 * Validates the receipt with Apple's servers, then updates profiles.subscription_status
 * and profiles.plan in Supabase.
 *
 * Required env vars:
 *   APPLE_SHARED_SECRET   — App-Specific Shared Secret from App Store Connect
 *                           (App Store Connect → Your App → In-App Purchases → Shared Secret)
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Body: { receipt: string, userId: string, sku: string }
 * Auth: Bearer <supabase access token>  (verified server-side)
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vkuwtrgiccizasjwkidi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const APPLE_VERIFY_URL_PROD    = 'https://buy.itunes.apple.com/verifyReceipt';
const APPLE_VERIFY_URL_SANDBOX = 'https://sandbox.itunes.apple.com/verifyReceipt';

// Map App Store product IDs → subscription plan
function planFromSku(sku: string): 'core' | 'pro' | null {
  if (sku === 'com.paxhost.app.core.monthly' || sku === 'com.paxhost.app.core.annual') return 'core';
  if (sku === 'com.paxhost.app.pro.monthly'  || sku === 'com.paxhost.app.pro.annual')  return 'pro';
  return null;
}

async function verifyWithApple(receipt: string, sandbox: boolean): Promise<{
  status: number;
  latestReceipt: any[];
}> {
  const url = sandbox ? APPLE_VERIFY_URL_SANDBOX : APPLE_VERIFY_URL_PROD;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'receipt-data': receipt,
      password: process.env.APPLE_SHARED_SECRET!,
      'exclude-old-transactions': true,
    }),
  });

  const json = await res.json();
  return {
    status: json.status,
    latestReceipt: json.latest_receipt_info ?? [],
  };
}

export async function POST(req: Request) {
  // ── Auth check ─────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return Response.json({ error: 'Missing authorization' }, { status: 401 });
  }

  // Verify the Supabase JWT and confirm the userId matches the token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let receipt: string, userId: string, sku: string;
  try {
    ({ receipt, userId, sku } = await req.json());
  } catch {
    return Response.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!receipt || !userId || !sku) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (user.id !== userId) {
    return Response.json({ error: 'User ID mismatch' }, { status: 403 });
  }

  const plan = planFromSku(sku);
  if (!plan) {
    return Response.json({ error: 'Unknown product SKU' }, { status: 400 });
  }

  // ── Validate receipt with Apple ────────────────────────────────────────────
  let result = await verifyWithApple(receipt, false);

  // status 21007 = sandbox receipt sent to production, retry sandbox
  if (result.status === 21007) {
    result = await verifyWithApple(receipt, true);
  }

  // status 0 = valid
  if (result.status !== 0) {
    console.error('Apple receipt validation failed:', result.status);
    return Response.json({ error: `Apple validation failed: ${result.status}` }, { status: 422 });
  }

  // Confirm at least one transaction for this product
  const hasValidTransaction = result.latestReceipt.some(
    (t: any) => t.product_id === sku && parseInt(t.expires_date_ms, 10) > Date.now()
  );

  if (!hasValidTransaction) {
    return Response.json({ error: 'No active transaction found for product' }, { status: 422 });
  }

  // Grab the original transaction ID so the Apple webhook can look up this profile
  const originalTransactionId: string =
    result.latestReceipt[0]?.original_transaction_id ?? '';

  // ── Update Supabase ────────────────────────────────────────────────────────
  const { error: upsertError } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      subscription_status: 'active',
      plan,
      ...(originalTransactionId ? { apple_original_transaction_id: originalTransactionId } : {}),
      updated_at: new Date().toISOString(),
    });

  if (upsertError) {
    console.error('Supabase upsert error:', upsertError);
    return Response.json({ error: 'Database error' }, { status: 500 });
  }

  return Response.json({ success: true, plan });
}
