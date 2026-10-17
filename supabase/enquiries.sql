-- Run in Supabase: SQL Editor > New query > paste > Run.
-- Stores messages from the Contact page form.
create table if not exists enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) <= 200),
  phone text not null check (char_length(phone) <= 40),
  service text,
  target_date date,
  message text not null check (char_length(message) between 5 and 3000),
  status text not null default 'new' check (status in ('new','replied','closed')),
  created_at timestamptz default now()
);

alter table enquiries enable row level security;

-- Visitors may send an enquiry, never read or change one
create policy "anyone can send enquiry" on enquiries for insert to anon, authenticated
  with check (status = 'new');
-- Admin full access
create policy "admin all enquiries" on enquiries for all using (is_admin()) with check (is_admin());