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
