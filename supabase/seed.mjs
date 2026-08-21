// One-time script: pushes the existing data/*.json content into Supabase.
// Run locally AFTER you've created the tables (supabase/schema.sql) and
// added your Supabase keys to .env.local.
//
// Usage:
//   node supabase/seed.mjs

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

function readJson(file) {
  return JSON.parse(readFileSync(path.join(__dirname, "..", "data", file), "utf-8"));
}

async function seed() {
  const products = readJson("products.json");
  const categories = readJson("categories.json");
  const settings = readJson("settings.json");

  const productRows = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    category_slug: p.categorySlug,
    description: p.description,
    short_description: p.shortDescription,
    size: p.size,
    image: p.image,
    gallery_images: p.galleryImages,
    video_url: p.videoUrl || null,
    variants: p.variants,
    stock_status: p.stockStatus,
    is_featured: p.isFeatured,
    is_active: p.isActive,
    is_coming_soon: p.isComingSoon,
    created_at: p.createdAt,
    updated_at: p.updatedAt
  }));

  const categoryRows = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    active: c.active,
    coming_soon: c.comingSoon,
    sort_order: c.sortOrder
  }));

  const settingsRow = {
    id: 1,
    business_name: settings.businessName,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp_number: settings.whatsappNumber,
    email: settings.email,
    address: settings.address,
    business_hours: settings.businessHours,
    delivery_areas: settings.deliveryAreas,
    delivery_note: settings.deliveryNote,
    facebook_url: settings.facebookUrl,
    instagram_url: settings.instagramUrl
  };

  const { error: catErr } = await supabase.from("categories").upsert(categoryRows);
  if (catErr) throw catErr;
  console.log(`Seeded ${categoryRows.length} categories`);

  const { error: prodErr } = await supabase.from("products").upsert(productRows);
  if (prodErr) throw prodErr;
  console.log(`Seeded ${productRows.length} products`);

  const { error: settingsErr } = await supabase.from("site_settings").upsert(settingsRow);
  if (settingsErr) throw settingsErr;
  console.log("Seeded site settings");

  console.log("Done. Your Supabase database now matches the original data/*.json content.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
