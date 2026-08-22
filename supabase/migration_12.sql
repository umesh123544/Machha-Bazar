-- Maccha Bazar — migration 12: email verification + phone country code for customers.
-- Run this in the Supabase Dashboard -> SQL Editor after the earlier migrations.

alter table customers add column if not exists email_verified boolean not null default false;
alter table customers add column if not exists verification_code_hash text;
alter table customers add column if not exists verification_expires_at timestamptz;
alter table customers add column if not exists verification_sent_at timestamptz;
alter table customers add column if not exists phone_country_code text not null default '+977';

-- Any customers created before this migration are treated as already verified
-- so existing accounts are not locked out.
update customers set email_verified = true where email_verified is distinct from true;
