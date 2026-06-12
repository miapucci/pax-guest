#!/usr/bin/env node
/**
 * Pax — Stripe setup script (test mode)
 *
 * Run:
 *   export STRIPE_SECRET_KEY=sk_test_...
 *   node scripts/stripe-setup.js
 */

const Stripe = require('stripe');

const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  console.error('\n❌  Missing STRIPE_SECRET_KEY\n');
  console.error('Run: export STRIPE_SECRET_KEY=sk_test_...\n');
  process.exit(1);
}

if (!key.startsWith('sk_test_')) {
  console.error('\n❌  This script is for TEST mode only.');
  console.error('Your key should start with sk_test_\n');
  process.exit(1);
}

const stripe = new Stripe(key);

async function run() {
  console.log('\n🚀  Pax Stripe setup — TEST MODE\n');

  // ── 1. Webhook endpoint ──────────────────────────────────────────────────────
  console.log('1/3  Creating webhook endpoint...');

  const webhook = await stripe.webhookEndpoints.create({
    url: 'https://paxhq.co/api/webhooks/stripe',
    enabled_events: [
      'checkout.session.completed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_failed',
    ],
    description: 'Pax host subscription events',
  });

  console.log('     ✅  Webhook created\n');

  // ── 2. Pax Core ──────────────────────────────────────────────────────────────
  console.log('2/3  Creating Pax Core product + prices...');

  const core = await stripe.products.create({
    name: 'Pax Core',
    description: 'Late checkout & early check-in upsells for Airbnb/VRBO hosts.',
  });

  const coreMonthly = await stripe.prices.create({
    product: core.id,
    unit_amount: 1900,       // $19.00
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Core Monthly',
  });

  const coreAnnual = await stripe.prices.create({
    product: core.id,
    unit_amount: 19000,      // $190.00
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Core Annual',
  });

  console.log('     ✅  Pax Core done\n');

  // ── 3. Pax Pro ───────────────────────────────────────────────────────────────
  console.log('3/3  Creating Pax Pro product + prices...');

  const pro = await stripe.products.create({
    name: 'Pax Pro',
    description: 'Pax Core plus advanced analytics and priority support.',
  });

  const proMonthly = await stripe.prices.create({
    product: pro.id,
    unit_amount: 2900,       // $29.00
    currency: 'usd',
    recurring: { interval: 'month' },
    nickname: 'Pro Monthly',
  });

  const proAnnual = await stripe.prices.create({
    product: pro.id,
    unit_amount: 29000,      // $290.00
    currency: 'usd',
    recurring: { interval: 'year' },
    nickname: 'Pro Annual',
  });

  console.log('     ✅  Pax Pro done\n');

  // ── Save output for vercel-setup.js ─────────────────────────────────────────
  const output = {
    STRIPE_WEBHOOK_SECRET:     webhook.secret,
    STRIPE_PRICE_CORE_MONTHLY: coreMonthly.id,
    STRIPE_PRICE_CORE_ANNUAL:  coreAnnual.id,
    STRIPE_PRICE_PRO_MONTHLY:  proMonthly.id,
    STRIPE_PRICE_PRO_ANNUAL:   proAnnual.id,
  };

  const fs = require('fs');
  const outPath = require('path').join(__dirname, '.stripe-output.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  STRIPE SETUP COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`  STRIPE_WEBHOOK_SECRET       = ${webhook.secret}`);
  console.log(`  STRIPE_PRICE_CORE_MONTHLY   = ${coreMonthly.id}`);
  console.log(`  STRIPE_PRICE_CORE_ANNUAL    = ${coreAnnual.id}`);
  console.log(`  STRIPE_PRICE_PRO_MONTHLY    = ${proMonthly.id}`);
  console.log(`  STRIPE_PRICE_PRO_ANNUAL     = ${proAnnual.id}`);
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅  Values saved. Now run: node scripts/vercel-setup.js\n');
}

run().catch(err => {
  console.error('\n❌  Error:', err.message, '\n');
  process.exit(1);
});
