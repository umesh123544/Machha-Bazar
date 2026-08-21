// One-time script: creates (or updates) the owner admin account in the
// admin_users table, using ADMIN_USERNAME / ADMIN_PASSWORD from .env.local.
// Run this AFTER supabase/migration_2.sql has been applied.
//
// Usage:
//   node supabase/create-owner.mjs
//
// Safe to re-run: it upserts by username, so re-running after changing
// ADMIN_PASSWORD in .env.local updates the owner's password.

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const username = process.env.ADMIN_USERNAME || "admin";
const password = process.env.ADMIN_PASSWORD || "aquarealm2026";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function run() {
  const passwordHash = await bcrypt.hash(password, 10);

  const { data: existing, error: findErr } = await supabase
    .from("admin_users")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (findErr) throw findErr;

  if (existing) {
    const { error } = await supabase
      .from("admin_users")
      .update({ password_hash: passwordHash, is_owner: true, can_manage_products: true, can_manage_content: true, can_manage_users: true })
      .eq("id", existing.id);
    if (error) throw error;
    console.log(`Updated existing owner account "${username}".`);
  } else {
    const { error } = await supabase.from("admin_users").insert({
      id: `u${Date.now()}`,
      username,
      password_hash: passwordHash,
      is_owner: true,
      can_manage_products: true,
      can_manage_content: true,
      can_manage_users: true,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    console.log(`Created owner account "${username}".`);
  }

  console.log("Done. Log into /admin with this username and the ADMIN_PASSWORD from .env.local.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
