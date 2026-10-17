-- Run in Supabase: SQL Editor > New query > paste > Run.
-- Adds the new booking fields. Safe to run more than once.
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