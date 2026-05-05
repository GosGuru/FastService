export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const supabaseGalleryBucket = process.env.NEXT_PUBLIC_SUPABASE_GALLERY_BUCKET ?? "fastservice-gallery";

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function getSupabaseConfig() {
  if (!hasSupabaseConfig()) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  return {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    galleryBucket: supabaseGalleryBucket
  };
}
