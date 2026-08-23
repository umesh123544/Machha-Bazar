-- Maccha Bazar — migration 13: forgot-password support for customers.
alter table customers add column if not exists reset_code_hash text;
alter table customers add column if not exists reset_expires_at timestamptz;
alter table customers add column if not exists reset_sent_at timestamptz;
