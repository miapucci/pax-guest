#!/usr/bin/env node
/**
 * Pax — Vercel env vars setup script
 *
 * Run AFTER stripe-setup.js:
 *   node scripts/vercel-setup.js
 *
 * Requires: vercel CLI logged in (`vercel login`)
 * Reads values from: scripts/.stripe-output.json (created by stripe-setup.js)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '.stripe-output.json');

if (!fs.existsSync(outPath)) {
  console.error('\n❌  No stripe output found. Run stripe-setup.js first.\n');
  process.exit(1);
}

// Check vercel CLI is available
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch {
  console.error('\n❌  Vercel CLI not found. Run: npm i -g vercel\n');
  process.exit(1);
}

const stripeVars = JSON.parse(fs.readFileSync(outPath, 'utf8'));

// All env vars to set — stripe ones from the file + existing ones that need to be present
const allVars = {
  ...stripeVars,
  // Remind about the other required vars (won't overwrite if already set)
};

const environments = ['production', 'preview', 'development'];

console.log('\n🚀  Pax Vercel env setup\n');
console.log('Setting variables:', Object.keys(stripeVars).join(', '));
console.log('Environments: production, preview, development\n');

let success = 0;
let failed = 0;

for (const [key, value] of Object.entries(stripeVars)) {
  for (const env of environments) {
    try {
      // Use --force to overwrite if already exists
      execSync(
        `echo "${value}" | vercel env add ${key} ${env} --force`,
        { stdio: 'pipe', cwd: path.join(__dirname, '..') }
      );
      console.log(`  ✅  ${key} → ${env}`);
      success++;
    } catch (err) {
      console.log(`  ⚠️   ${key} → ${env} (${err.stderr?.toString().trim() ?? 'error'})`);
      failed++;
    }
  }
  console.log('');
}

// Clean up the temp file
fs.unlinkSync(outPath);
console.log('  🗑️   Cleaned up temp file\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
if (failed === 0) {
  console.log(`  ✅  All ${success} env vars set successfully`);
  console.log('\n  Next: redeploy Vercel so the new vars take effect.');
  console.log('  Run: vercel --prod\n');
} else {
  console.log(`  ⚠️   ${success} succeeded, ${failed} failed — check errors above`);
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
