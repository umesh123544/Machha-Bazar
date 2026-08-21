-- Maccha Bazar — migration 2: banner fields, admin users, image storage.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run even if some parts already exist.

-- Banner fields on site_settings
alter table site_settings add column if not exists banner_image text;
alter table site_settings add column if not exists banner_badge text default 'Kathmandu Valley delivery';
alter table site_settings add column if not exists banner_headline text default 'Bring home something beautiful.';
alter table site_settings add column if not exists banner_subheading text default 'Healthy, carefully raised aquarium fish for your home.';

-- Multiple admin logins with per-user permissions
create table if not exists admin_users (
  id text primary key,
  username text unique not null,
  password_hash text not null,
  is_owner boolean not null default false,
  can_manage_products boolean not null default true,
  can_manage_content boolean not null default false,
  can_manage_users boolean not null default false,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;
-- No select/insert/update policies on purpose: only the server (service role
-- key) reads/writes this table, bypassing RLS. The public/anon key can never
-- read admin usernames or password hashes.

-- Public bucket for uploaded product photos and the homepage banner image
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;
