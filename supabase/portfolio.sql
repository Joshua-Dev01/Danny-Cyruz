-- Run in Supabase: SQL Editor > New query > paste > Run. Safe to run more than once.
-- Only needed if you already ran setup.sql before the live portfolio was added.

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