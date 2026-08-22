-- Maccha Bazar — migration 7: customer accounts (signup/login, profile, delivery details).
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.

create table if not exists customers (
  id text primary key,
  name text not null default '',
  phone text not null default '',
  email text unique not null,
  password_hash text not null,
  address text not null default '',
  delivery_area text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customers enable row level security;
-- No public policies: only the Next.js server (service role) reads/writes this table.
