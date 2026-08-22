-- Maccha Bazar — migration 11: product comments/reviews from logged-in customers.
-- Run this in the Supabase SQL Editor after the earlier migrations.

create table if not exists product_comments (
  id text primary key,
  product_id text not null references products(id) on delete cascade,
  customer_id text not null references customers(id) on delete cascade,
  customer_name text not null default '',
  customer_avatar text not null default '',
  rating integer not null default 5 check (rating >= 1 and rating <= 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_comments_product_id_idx
  on product_comments (product_id, created_at desc);
create index if not exists product_comments_customer_id_idx
  on product_comments (customer_id);

-- One review per customer per product — they can edit or delete it instead
-- of leaving duplicates.
create unique index if not exists product_comments_unique_customer_product
  on product_comments (product_id, customer_id);

alter table product_comments enable row level security;

create policy "Public can read product comments" on product_comments for select using (true);

-- No insert/update/delete policy for the anon role on purpose — all writes
-- go through the service role key from the Next.js server (API routes),
-- which bypasses RLS, same as every other table in this project.
