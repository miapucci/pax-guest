-- Changelog for the dev portal — Mia's private record of what shipped
-- Apply via: Supabase dashboard → SQL Editor (run after 20260609_events_table.sql)

create table if not exists public.changelog (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null,
  body        text,
  tag         text not null default 'feature'  -- 'feature' | 'fix' | 'infra' | 'content'
);

create index if not exists changelog_created_at_idx on public.changelog (created_at desc);

-- RLS: locked to service role only, same as events
alter table public.changelog enable row level security;

-- Seed with the build history so far
insert into public.changelog (created_at, title, body, tag) values
  ('2026-06-09T12:00:00Z', 'Host portal foundation (Phase 1)', 'SSR auth with @supabase/ssr, middleware gating /host and /dev, root login page, marketing moved to /marketing, dev portal scaffold with events audit table.', 'infra'),
  ('2026-06-09T18:00:00Z', 'Properties CRUD + QR codes (Phase 2)', 'Property list/add/edit/delete, cover photo upload to property-photos bucket, printable QR code page with qrcode.react.', 'feature'),
  ('2026-06-10T10:00:00Z', 'Requests + upsell loop (Phase 3)', 'Host requests page with pending/approved/declined tabs, 30s auto-poll, optimistic approve/decline. Approve/decline API routes hardened with auth + ownership checks.', 'feature'),
  ('2026-06-10T16:00:00Z', 'Signup, onboarding, trial + billing (Phase 4)', 'Public /signup, 3-step onboarding wizard ending at live QR, TrialGate with 14-day countdown and expiry hard wall showing trial earnings, billing page with Stripe Checkout + customer portal.', 'feature'),
  ('2026-06-11T10:00:00Z', 'Full audit + design elevation', 'Fixed admin-paywall lockout, gold focus leak, Chrome autofill flash, shared page titles. Added nav active states, PaxMark logo, rebuilt dashboard with completion checklist and pending-requests panel, film grain, staggered entrances, Playfair italics.', 'fix'),
  ('2026-06-11T14:00:00Z', 'Stripe Connect surfaced + payment gating', 'Payouts card on Billing with connect flow, dashboard checklist step, onboarding copy. Guests no longer see upgrade options unless the host''s Stripe account can actually receive transfers (charges_enabled verified server-side). Payment intent route blocks unconnected hosts so funds can''t land in the platform balance.', 'feature'),
  ('2026-06-11T16:00:00Z', 'CRITICAL: delete-account billing orphan fixed', 'Deleting an account now cancels the Stripe subscription first and blocks deletion if cancellation fails. Previously a paying host who deleted their account would be billed forever with no profile row left to map the webhook to.', 'fix'),
  ('2026-06-11T18:00:00Z', 'Security + money-path hardening sweep', 'Approve/decline now use atomic pending-claim (no double-capture race), capture failure releases the claim, email failures no longer fail completed approvals. Blocked double subscriptions (active hosts route through billing portal). Server actions whitelist fields (mass-assignment fix). Upload route bucket whitelist. Payment intents refuse sub-$0.50 amounts.', 'fix');
