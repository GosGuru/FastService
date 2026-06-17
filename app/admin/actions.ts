"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { saveAdminSnapshotToSupabase } from "@/lib/supabase/content";
import { saveSiteSettings } from "@/lib/siteSettings";
import type { AdminContentSnapshot } from "@/lib/admin/snapshot";
import { translateItem, type AdminItem } from "@/lib/admin/deepseek";
import type { Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/types/settings";

export interface AdminMutationResult {
  ok: boolean;
  message: string;
  snapshot?: AdminContentSnapshot;
  details?: string[];
}

function explainSaveError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "No se pudo guardar en Supabase.";
  const normalizedMessage = rawMessage.toLowerCase();

  if (rawMessage.startsWith("Supabase") || rawMessage.startsWith("No encuentro")) {
    return rawMessage;
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("rls")) {
    return "Supabase bloqueo el guardado por permisos RLS. Confirma que tu usuario esta en admin_users y que ejecutaste supabase/schema.sql.";
  }

  if (normalizedMessage.includes("permission denied") || normalizedMessage.includes("not authorized")) {
    return "Supabase rechazo el guardado por permisos. Revisa que la sesion sea admin y que las politicas de content_items permitan insert/update/delete.";
  }

  if (normalizedMessage.includes("content_items") && (normalizedMessage.includes("does not exist") || normalizedMessage.includes("relation"))) {
    return "No encuentro la tabla content_items en Supabase. Ejecuta supabase/schema.sql antes de guardar contenido.";
  }

  if (normalizedMessage.includes("duplicate key")) {
    return "Supabase detecto IDs duplicados al guardar. Revisa que el contenido nuevo no repita slug o ID interno.";
  }

  return `No se pudo guardar en Supabase: ${rawMessage}`;
}

export async function saveAdminSnapshotAction(snapshot: AdminContentSnapshot): Promise<AdminMutationResult> {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return {
      ok: false,
      message: "Tu sesion no tiene permisos de administrador.",
      details: ["Vuelve a iniciar sesion desde /admin/login con un usuario incluido en admin_users."]
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const savedSnapshot = await saveAdminSnapshotToSupabase(supabase, snapshot);

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Contenido guardado en Supabase. El frontend usara estos datos publicados.",
      snapshot: savedSnapshot,
      details: ["Se revalidaron las rutas publicas y el panel admin."]
    };
  } catch (error) {
    const message = explainSaveError(error);

    return {
      ok: false,
      message,
      details: error instanceof Error && error.message !== message ? [error.message] : undefined
    };
  }
}

export async function saveSiteSettingsAction(settings: SiteSettings): Promise<AdminMutationResult> {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return {
      ok: false,
      message: "Tu sesion no tiene permisos de administrador.",
      details: ["Vuelve a iniciar sesion desde /admin/login con un usuario incluido en admin_users."]
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    await saveSiteSettings(supabase, settings);

    revalidatePath("/", "layout");
    revalidatePath("/admin");

    return {
      ok: true,
      message: "Configuración guardada en Supabase. El frontend usara estos datos publicados.",
      details: ["Se revalidaron las rutas publicas y el panel admin."]
    };
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "No se pudo guardar la configuración.";
    return {
      ok: false,
      message: rawMessage
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

export async function translateItemAction(
  item: AdminItem,
  sourceLocale: Locale,
  targetLocale: Locale
): Promise<{ ok: boolean; message: string; item?: AdminItem }> {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return {
      ok: false,
      message: "Tu sesion no tiene permisos de administrador para realizar traducciones."
    };
  }

  try {
    const translatedItem = await translateItem(item, sourceLocale, targetLocale);
    return {
      ok: true,
      message: `Traducción al ${targetLocale.toUpperCase()} completada con éxito.`,
      item: translatedItem
    };
  } catch (error) {
    console.error(`Error en translateItemAction para ${targetLocale}:`, error);
    const rawMessage = error instanceof Error ? error.message : "Error desconocido.";
    return {
      ok: false,
      message: `Fallo al traducir al ${targetLocale.toUpperCase()}: ${rawMessage}`
    };
  }
}
