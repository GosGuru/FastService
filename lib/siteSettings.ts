import type { SupabaseClient } from "@supabase/supabase-js";
import type { SiteSettings } from "@/types/settings";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cloneDefaultSiteSettings, normalizeSiteSettings } from "@/lib/homeSettings";

export async function loadSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig()) {
    return cloneDefaultSiteSettings();
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("content_items")
      .select("payload")
      .eq("content_type", "settings")
      .eq("content_id", "site-settings")
      .single();

    if (error || !data) {
      return cloneDefaultSiteSettings();
    }

    return normalizeSiteSettings(data.payload);
  } catch {
    return cloneDefaultSiteSettings();
  }
}

export async function loadPublicSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig()) {
    return cloneDefaultSiteSettings();
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("content_items")
      .select("payload")
      .eq("content_type", "settings")
      .eq("content_id", "site-settings")
      .eq("status", "published")
      .single();

    if (error || !data) {
      return cloneDefaultSiteSettings();
    }

    return normalizeSiteSettings(data.payload);
  } catch {
    return cloneDefaultSiteSettings();
  }
}

export async function saveSiteSettings(supabase: SupabaseClient, settings: SiteSettings): Promise<SiteSettings> {
  const normalizedSettings = normalizeSiteSettings(settings);
  const row = {
    content_type: "settings",
    content_id: "site-settings",
    payload: {
      ...normalizedSettings,
      updatedAt: new Date().toISOString()
    },
    status: "published",
    visibility: "listed",
    robots_index: true,
    sort_order: 0
  };

  const { error } = await supabase
    .from("content_items")
    .upsert(row, { onConflict: "content_type,content_id" });

  if (error) {
    throw new Error(`Supabase fallo al guardar settings: ${error.message}`);
  }

  return normalizedSettings;
}
