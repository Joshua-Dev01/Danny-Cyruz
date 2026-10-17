-- Run in Supabase: SQL Editor > New query > paste > Run. Safe to run more than once.
-- Only needed if you already ran setup.sql before client accounts were added.

-- ---------------------------------------------------------------- client accounts
-- Clients sign in with Google and see their own bookings. Guests can still book without an account.
alter table bookings add column if not exists user_id uuid references auth.users on delete set null;
create index if not exists bookings_user_id_idx on bookings (user_id);

-- A booking may carry the signed-in client's id, but never someone else's.
drop policy if exists "anyone can request booking" on bookings;
create policy "anyone can request booking" on bookings for insert to anon, authenticated
  with check (status = 'pending' and payment_status = 'unpaid' and deposit_amount = 5500 and (user_id is null or user_id = auth.uid()));

-- A signed-in client can read (not change) their own bookings.
drop policy if exists "clients read own bookings" on bookings;
create policy "clients read own bookings" on bookings for select to authenticated using (user_id = auth.uid());