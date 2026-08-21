import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (see .env.example)."
  );
}

// Server-only client using the service role key, so admin writes bypass RLS.
// This file must never be imported from a "use client" component.
export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false }
});
