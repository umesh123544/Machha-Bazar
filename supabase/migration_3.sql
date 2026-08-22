-- Maccha Bazar — migration 3: business logo + banner template choice.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run even if some parts already exist.

alter table site_settings add column if not exists logo_url text;
alter table site_settings add column if not exists banner_template text default 'classic';
