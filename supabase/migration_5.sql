-- Maccha Bazar — migration 5: adjustable logo size.
-- Run this in Supabase Dashboard -> SQL Editor -> New query -> Run.

alter table site_settings add column if not exists logo_size text default 'medium';
