-- Maccha Bazar — migration 8: customer last login + order activity log for admin.
-- Run in Supabase SQL Editor.

alter table customers add column if not exists last_login_at timestamptz;

create table if not exists customer_orders (
  id text primary key,
  customer_id text,
  customer_name text not null default '',
  customer_phone text not null default '',
  customer_email text not null default '',
  customer_address text not null default '',
  delivery_area text not null default '',
  items jsonb not null default '[]'::jsonb,
  total_price integer not null default 0,
  item_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists customer_orders_customer_id_idx on customer_orders (customer_id);
create index if not exists customer_orders_created_at_idx on customer_orders (created_at desc);

alter table customer_orders enable row level security;
