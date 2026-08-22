-- Maccha Bazar — migration 10: offer banner settings (JSON on site_settings).
alter table site_settings add column if not exists offer_settings jsonb default '{}'::jsonb;
