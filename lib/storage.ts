import { supabaseAdmin } from "./supabaseClient";

const BUCKET = "site-images";

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/-+/g, "-");
}

export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder: "products" | "banner" | "logo"
): Promise<string> {
  const path = `${folder}/${Date.now()}-${sanitizeFilename(originalName || "image")}`;

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType,
    upsert: true
  });
  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
