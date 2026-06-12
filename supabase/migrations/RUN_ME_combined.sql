-- Audit log for platform-level events (dev portal activity feed)
-- Apply via: Supabase dashboard → SQL Editor, or `supabase db push`

create table if not exists public.events (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  event_type   text not null,            -- e.g. 'host.signup', 'property.created', 'request.approved'
  actor_id     uuid,                     -- auth.users.id of the user who triggered the event
  actor_email  text,                     -- denormalised for fast reads
  entity_type  text,                     -- 'property' | 'upsell_request' | 'profile' | etc.
  entity_id    text,                     -- uuid or string id of the affected row
  metadata     jsonb not null default '{}',
  severity     text not null default 'info'  -- 'info' | 'warning' | 'error'
);

-- Index for time-series reads (most common query in the dev portal)
create index if not exists events_created_at_idx on public.events (created_at desc);

-- Index for filtering by actor
create index if not exists events_actor_id_idx on public.events (actor_id);

-- Index for filtering by event_type
create index if not exists events_event_type_idx on public.events (event_type);

-- RLS: public reads are blocked; only service role can insert/select
alter table public.events enable row level security;

-- No policies = total lockdown for anon/authenticated roles
-- The dev portal reads via the service role key (bypasses RLS), so this is correct.
-- To add writes from API routes, use the service role client in those routes.
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
-- Security hardening: guest-side insert integrity
-- Apply via: Supabase dashboard → SQL Editor
--
-- Guests create upsell requests with the anon key. Without this, a crafted
-- request could insert status='approved' directly — making a request look
-- approved (and the upgrade granted) without any card hold or payment.
-- RESTRICTIVE policies AND together with existing permissive ones, so this is
-- safe to apply regardless of current policy shape. The approve/decline API
-- routes use the service role, which bypasses RLS, so they are unaffected.

drop policy if exists "client_inserts_must_be_pending" on public.upsell_requests;

create policy "client_inserts_must_be_pending"
  on public.upsell_requests
  as restrictive
  for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and payment_intent_id is not null
  );
