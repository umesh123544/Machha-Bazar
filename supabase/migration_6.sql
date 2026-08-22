-- Maccha Bazar — migration 6: show/hide About and Delivery pages from admin.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.
-- Safe to run even if some parts already exist.

alter table site_settings add column if not exists show_about_page boolean default true;
alter table site_settings add column if not exists show_delivery_page boolean default true;
