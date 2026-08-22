-- Maccha Bazar — migration 9: customer profile photo (avatar).
alter table customers add column if not exists avatar_url text default '';
