-- Maccha Bazar — migration 4: swipeable banner carousel, theme colors, site font.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run even if some parts already exist.

alter table site_settings add column if not exists banner_slides jsonb default '[]'::jsonb;
alter table site_settings add column if not exists primary_color text default '#2B1B33';
alter table site_settings add column if not exists accent_color text default '#D65E8C';
alter table site_settings add column if not exists highlight_color text default '#F0B84C';
alter table site_settings add column if not exists site_font text default 'Inter';
