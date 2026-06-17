import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultSiteSettings, type SiteSettings } from "@/types/settings";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loadSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig()) {
    return defaultSiteSettings;
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
      return defaultSiteSettings;
    }

    const payload = data.payload as SiteSettings;
    return {
      ...defaultSiteSettings,
      ...payload,
      whatsappNumbers: {
        ...defaultSiteSettings.whatsappNumbers,
        ...payload.whatsappNumbers
      }
    };
  } catch {
    return defaultSiteSettings;
  }
}

export async function loadPublicSiteSettings(): Promise<SiteSettings> {
  if (!hasSupabaseConfig()) {
    return defaultSiteSettings;
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
      return defaultSiteSettings;
    }

    const payload = data.payload as SiteSettings;
    return {
      ...defaultSiteSettings,
      ...payload,
      whatsappNumbers: {
        ...defaultSiteSettings.whatsappNumbers,
        ...payload.whatsappNumbers
      }
    };
  } catch {
    return defaultSiteSettings;
  }
}

export async function saveSiteSettings(supabase: SupabaseClient, settings: SiteSettings): Promise<SiteSettings> {
  const row = {
    content_type: "settings",
    content_id: "site-settings",
    payload: {
      ...settings,
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

  return settings;
}
