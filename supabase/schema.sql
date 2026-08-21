-- Maccha Bazar — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

create table if not exists products (
  id text primary key,
  name text not null,
  slug text unique not null,
  category text not null,
  category_slug text not null,
  description text not null default '',
  short_description text not null default '',
  size text not null default '',
  image text not null default '/icons/fish-placeholder.svg',
  gallery_images jsonb not null default '[]'::jsonb,
  video_url text,
  variants jsonb not null default '[]'::jsonb,
  stock_status text not null default 'in_stock',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  is_coming_soon boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  description text not null default '',
  active boolean not null default true,
  coming_soon boolean not null default false,
  sort_order integer not null default 0
);

create table if not exists site_settings (
  id integer primary key default 1,
  business_name text not null default 'Maccha Bazar',
  tagline text not null default '',
  phone text not null default '',
  whatsapp_number text not null default '',
  email text not null default '',
  address text not null default '',
  business_hours text not null default '',
  delivery_areas jsonb not null default '[]'::jsonb,
  delivery_note text not null default '',
  facebook_url text not null default '',
  instagram_url text not null default '',
  banner_image text,
  banner_badge text default 'Kathmandu Valley delivery',
  banner_headline text default 'Bring home something beautiful.',
  banner_subheading text default 'Healthy, carefully raised aquarium fish for your home.',
  constraint single_row check (id = 1)
);

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

-- Public bucket for product photos and the homepage banner image, uploaded
-- from the admin panel. Files are written using the service role key from
-- the server, so RLS on storage.objects is bypassed for uploads; the
-- `public` flag below is what makes uploaded files viewable on the site.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Row Level Security: public can read, only server (service role) can write.
-- The app never talks to Supabase from the browser with these tables, so this
-- mainly protects against someone hitting the anon key directly.
alter table products enable row level security;
alter table categories enable row level security;
alter table site_settings enable row level security;
alter table admin_users enable row level security;

create policy "Public can read products" on products for select using (true);
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read settings" on site_settings for select using (true);

-- No insert/update/delete policies for the anon role on purpose — all writes
-- go through the service role key from the Next.js server (admin API routes),
-- which bypasses RLS.
