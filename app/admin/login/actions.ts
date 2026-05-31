"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminLoginState {
  message: string;
  email: string;
}

function normalizeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "";

  return nextPath.startsWith("/admin") && nextPath !== "/admin/login" ? nextPath : "/admin";
}

function explainLoginError(error: unknown) {
  const rawMessage = error instanceof Error ? error.message : "No se pudo iniciar sesion.";
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("failed to fetch") || normalizedMessage.includes("fetch failed") || normalizedMessage.includes("network")) {
    return "No se pudo conectar con Supabase. Revisa que NEXT_PUBLIC_SUPABASE_URL apunte al proyecto activo y vuelve a intentar.";
  }

  if (normalizedMessage.includes("faltan next_public_supabase")) {
    return "Falta configurar Supabase para poder iniciar sesion.";
  }

  return "No se pudo iniciar sesion. Intentalo de nuevo en unos segundos.";
}

export async function signInAdminAction(_state: AdminLoginState, formData: FormData): Promise<AdminLoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = normalizeNextPath(formData.get("nextPath"));
  let shouldRedirect = false;

  if (!email || !password) {
    return {
      message: "Completa email y contrasena.",
      email
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return {
        message: "Email o contrasena incorrectos.",
        email
      };
    }

    const { data: adminUser, error: adminError } = await supabase
      .from("admin_users")
      .select("user_id,role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (adminError || !adminUser || adminUser.role !== "admin") {
      await supabase.auth.signOut();

      return {
        message: "Este usuario no tiene permisos de administrador.",
        email
      };
    }

    shouldRedirect = true;
  } catch (error) {
    return {
      message: explainLoginError(error),
      email
    };
  }

  if (shouldRedirect) {
    redirect(nextPath);
  }

  return {
    message: "Sesion iniciada.",
    email
  };
}
