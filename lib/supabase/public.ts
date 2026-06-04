import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";

let publicClient: SupabaseClient | null = null;
let publicClientKey = "";

export function createSupabasePublicClient() {
  const config = getSupabaseConfig();
  const clientKey = `${config.url}:${config.publishableKey}`;

  if (!publicClient || publicClientKey !== clientKey) {
    publicClient = createClient(config.url, config.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false
      }
    });
    publicClientKey = clientKey;
  }

  return publicClient;
}
