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
