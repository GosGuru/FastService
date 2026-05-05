import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const config = getSupabaseConfig();
  browserClient = createBrowserClient(config.url, config.publishableKey);

  return browserClient;
}
