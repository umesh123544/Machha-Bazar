-- Wishlist / "save for later": links a customer to products they've saved.
create table if not exists wishlist_items (
  id text primary key,
  customer_id text not null references customers(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (customer_id, product_id)
);

create index if not exists wishlist_items_customer_id_idx on wishlist_items(customer_id);
create index if not exists wishlist_items_product_id_idx on wishlist_items(product_id);

alter table wishlist_items enable row level security;

-- Server (service role) only — the app's API routes handle auth checks themselves.
create policy "Service role full access" on wishlist_items
  for all using (true) with check (true);
