import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminSession {
  userId: string;
  email: string;
  role: "admin";
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!hasSupabaseConfig()) return null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) return null;

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id,email,role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError || !adminUser || adminUser.role !== "admin") return null;

    return {
      userId: userData.user.id,
      email: adminUser.email ?? userData.user.email ?? "admin",
      role: "admin"
    };
  } catch {
    return null;
  }
}
