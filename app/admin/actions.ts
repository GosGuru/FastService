"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveAdminSnapshotToSupabase } from "@/lib/supabase/content";
import type { AdminContentSnapshot } from "@/lib/admin/snapshot";

export interface AdminMutationResult {
  ok: boolean;
  message: string;
  snapshot?: AdminContentSnapshot;
}

export async function saveAdminSnapshotAction(snapshot: AdminContentSnapshot): Promise<AdminMutationResult> {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return { ok: false, message: "Tu sesion no tiene permisos de administrador." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const savedSnapshot = await saveAdminSnapshotToSupabase(supabase, snapshot);

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Contenido guardado en Supabase. El frontend usara estos datos publicados.",
      snapshot: savedSnapshot
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "No se pudo guardar en Supabase."
    };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // Redirect below still clears the admin surface for the user.
  }

  redirect("/admin/login");
}
