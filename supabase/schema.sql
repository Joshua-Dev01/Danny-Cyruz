-- Run in Supabase: SQL Editor > New query > paste > Run.
create extension if not exists pgcrypto;

create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);
create or replace function is_admin() returns boolean language sql stable security definer as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

create table if not exists services (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, blurb text,
  image_url text, price_from integer, includes text[] default '{}', extras jsonb default '[]', sort int default 0, active boolean default true
);
create table if not exists portfolio_items (
  id uuid primary key default gen_random_uuid(), title text not null,
  category text not null check (category in ('Weddings','Portraits','Events','Fashion','Commercial')),
  cover_url text not null, description text, gallery text[] default '{}', featured boolean default false, created_at timestamptz default now()
);
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(), client_name text not null, role text, quote text not null, published boolean default true
);
create table if not exists albums (
  id uuid primary key default gen_random_uuid(), client_name text not null, title text not null, cover_url text,
  passcode_hash text not null, photos jsonb default '[]', favourites text[] default '{}', allow_download boolean default true, created_at timestamptz default now()
);
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(), full_name text not null, email text not null, phone text not null,
  service text not null, package_name text, event_date date not null, event_time time, location text, notes text,
  deposit_amount integer not null default 5500,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  created_at timestamptz default now()
);

alter table admins enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;
alter table testimonials enable row level security;
alter table albums enable row level security;
alter table bookings enable row level security;

-- Public site reads
create policy "public read services" on services for select using (active);
create policy "public read portfolio" on portfolio_items for select using (true);
create policy "public read testimonials" on testimonials for select using (published);
-- Visitors may create bookings, never read or change them
create policy "anyone can request booking" on bookings for insert to anon, authenticated
  with check (status = 'pending' and payment_status = 'unpaid' and deposit_amount = 5500);
-- Admin full access
create policy "admin all services" on services for all using (is_admin()) with check (is_admin());
create policy "admin all portfolio" on portfolio_items for all using (is_admin()) with check (is_admin());
create policy "admin all testimonials" on testimonials for all using (is_admin()) with check (is_admin());
create policy "admin all albums" on albums for all using (is_admin()) with check (is_admin());
create policy "admin all bookings" on bookings for all using (is_admin()) with check (is_admin());
-- Albums are opened only through a server route that checks the passcode, so they have no public policy.
