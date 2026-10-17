-- ONE-TIME SETUP for the Danny Cyruz site.
-- Supabase dashboard > SQL Editor > New query > paste all of this > Run.
-- Safe to run more than once. Replaces running schema.sql, Bookingsupgrade.sql,
-- enquiries.sql and realtime.sql separately.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- admins
create table if not exists admins (user_id uuid primary key references auth.users on delete cascade);
create or replace function is_admin() returns boolean language sql stable security definer as
$$ select exists (select 1 from admins where user_id = auth.uid()) $$;

-- ---------------------------------------------------------------- tables
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

-- Newer booking fields (reference code, picture price, session type, group size)
alter table bookings add column if not exists reference text;
alter table bookings add column if not exists instagram text;
alter table bookings add column if not exists package_price integer;
alter table bookings add column if not exists session_type text;
alter table bookings add column if not exists people integer not null default 1;
alter table bookings add column if not exists terms_accepted boolean not null default false;
create unique index if not exists bookings_reference_key on bookings (reference);

-- Basic limits so the public form cannot store junk
alter table bookings drop constraint if exists bookings_people_check;
alter table bookings add constraint bookings_people_check check (people between 1 and 50);
alter table bookings drop constraint if exists bookings_notes_len;
alter table bookings add constraint bookings_notes_len check (notes is null or char_length(notes) <= 3000);
alter table bookings drop constraint if exists bookings_session_type_check;
alter table bookings add constraint bookings_session_type_check check (session_type is null or session_type in ('studio','outdoor'));

-- ---------------------------------------------------------------- security (RLS)
alter table admins enable row level security;
alter table services enable row level security;
alter table portfolio_items enable row level security;
alter table testimonials enable row level security;
alter table albums enable row level security;
alter table bookings enable row level security;
alter table enquiries enable row level security;

-- Public site reads
drop policy if exists "public read services" on services;
create policy "public read services" on services for select using (active);
drop policy if exists "public read portfolio" on portfolio_items;
create policy "public read portfolio" on portfolio_items for select using (true);
drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials for select using (published);

-- Visitors may create a booking or enquiry, never read or change one
drop policy if exists "anyone can request booking" on bookings;
create policy "anyone can request booking" on bookings for insert to anon, authenticated
  with check (status = 'pending' and payment_status = 'unpaid' and deposit_amount = 5500);
drop policy if exists "anyone can send enquiry" on enquiries;
create policy "anyone can send enquiry" on enquiries for insert to anon, authenticated
  with check (status = 'new');

-- Admin full access
drop policy if exists "admin all services" on services;
create policy "admin all services" on services for all using (is_admin()) with check (is_admin());
drop policy if exists "admin all portfolio" on portfolio_items;
create policy "admin all portfolio" on portfolio_items for all using (is_admin()) with check (is_admin());
drop policy if exists "admin all testimonials" on testimonials;
create policy "admin all testimonials" on testimonials for all using (is_admin()) with check (is_admin());
drop policy if exists "admin all albums" on albums;
create policy "admin all albums" on albums for all using (is_admin()) with check (is_admin());
drop policy if exists "admin all bookings" on bookings;
create policy "admin all bookings" on bookings for all using (is_admin()) with check (is_admin());
drop policy if exists "admin all enquiries" on enquiries;
create policy "admin all enquiries" on enquiries for all using (is_admin()) with check (is_admin());
-- Albums are opened only through a server route that checks the passcode, so they have no public policy.

-- ---------------------------------------------------------------- realtime
-- Live updates for the admin dashboard. Realtime follows RLS, so only a signed-in admin receives events.
alter table bookings replica identity full;
alter table enquiries replica identity full;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings') then
    alter publication supabase_realtime add table public.bookings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'enquiries') then
    alter publication supabase_realtime add table public.enquiries;
  end if;
end $$;

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

-- ---------------------------------------------------------------- live portfolio
-- Portfolio items can now be photos or videos, in any category you like.
alter table portfolio_items drop constraint if exists portfolio_items_category_check;
alter table portfolio_items alter column cover_url drop not null;
alter table portfolio_items add column if not exists media_type text not null default 'photo';
alter table portfolio_items add column if not exists video_url text;
alter table portfolio_items add column if not exists youtube_id text;
alter table portfolio_items add column if not exists vertical boolean not null default false;
alter table portfolio_items add column if not exists sort integer not null default 0;
alter table portfolio_items drop constraint if exists portfolio_items_media_check;
alter table portfolio_items add constraint portfolio_items_media_check check (
  (media_type = 'photo' and cover_url is not null)
  or (media_type = 'video' and (video_url is not null or youtube_id is not null))
);

-- Live updates for the public site. Everyone can read the portfolio, so everyone receives changes.
alter table portfolio_items replica identity full;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'portfolio_items') then
    alter publication supabase_realtime add table public.portfolio_items;
  end if;
end $$;

-- Your current six photos, added once (only if the portfolio is empty).
insert into portfolio_items (title, category, cover_url, media_type, sort)
select * from (values
  ('Lagos atelier', 'Portrait',   '/1img.jpeg',    'photo', 1),
  ('Eko nuptials',  'Wedding',    '/2img.jpeg',    'photo', 2),
  ('Golden hour',   'Portrait',   '/3img.jpeg',    'photo', 3),
  ('Ikoyi morning', 'Wedding',    '/4img.jpeg',    'photo', 4),
  ('Soundstage',    'Event',      '/hero.jpeg',    'photo', 5),
  ('Still life',    'Commercial', '/hero2.jpeg',   'photo', 6)
) as v(title, category, cover_url, media_type, sort)
where not exists (select 1 from portfolio_items);

-- ---------------------------------------------------------------- make yourself admin
-- 1. Supabase > Authentication > Users > Add user (your email + a password, tick "Auto Confirm User").
-- 2. Then run this one line in a NEW query, with your real email:
--
--    insert into admins (user_id) select id from auth.users where email = 'YOUR-EMAIL' on conflict do nothing;