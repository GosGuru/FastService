import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createInitialAdminSnapshot, normalizeAdminContentSnapshot, type AdminContentKey, type AdminContentSnapshot } from "@/lib/admin/snapshot";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type AdminItem = AdminContentSnapshot["content"][AdminContentKey][number];

type ContentRow = {
  content_type: string;
  content_id: string;
  payload: AdminItem;
  sort_order: number;
};

export type ContentSource = "supabase" | "static";

export interface ContentSnapshotResult {
  snapshot: AdminContentSnapshot;
  source: ContentSource;
  message?: string;
}

const contentKeys = ["boatCollections", "boats", "servicePages", "vehicles", "waterToys", "seoPages", "faqs"] as const satisfies AdminContentKey[];

const contentLabels: Record<AdminContentKey, string> = {
  boatCollections: "colecciones de barcos",
  boats: "barcos",
  servicePages: "servicios",
  vehicles: "vehiculos",
  waterToys: "juguetes nauticos",
  seoPages: "paginas SEO",
  faqs: "FAQs"
};

function isContentKey(value: string): value is AdminContentKey {
  return contentKeys.includes(value as AdminContentKey);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getSupabaseErrorText(error: unknown) {
  if (!error || typeof error !== "object") return "Error desconocido.";

  const supabaseError = error as { message?: string; code?: string; details?: string; hint?: string };
  return [supabaseError.message, supabaseError.details, supabaseError.hint, supabaseError.code ? `Codigo ${supabaseError.code}` : undefined]
    .filter(Boolean)
    .join(" ");
}

function createContentSaveError(action: "leer" | "eliminar" | "guardar", key: AdminContentKey, error: unknown) {
  const rawMessage = getSupabaseErrorText(error);
  const normalizedMessage = rawMessage.toLowerCase();
  const label = contentLabels[key];

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("rls")) {
    return new Error(`Supabase bloqueo ${action} ${label} por permisos RLS. Confirma que tu usuario esta en admin_users y que ejecutaste las politicas de supabase/schema.sql.`);
  }

  if (normalizedMessage.includes("permission denied") || normalizedMessage.includes("not authorized")) {
    return new Error(`Supabase rechazo ${action} ${label} por permisos. Revisa la sesion admin y las politicas de content_items.`);
  }

  if (normalizedMessage.includes("content_items") && (normalizedMessage.includes("does not exist") || normalizedMessage.includes("relation"))) {
    return new Error("No encuentro la tabla content_items en Supabase. Ejecuta supabase/schema.sql y vuelve a guardar.");
  }

  return new Error(`Supabase fallo al ${action} ${label}: ${rawMessage}`);
}

function createEmptySnapshot(): AdminContentSnapshot {
  const snapshot = createInitialAdminSnapshot();

  contentKeys.forEach((key) => {
    snapshot.content[key] = [] as never;
  });

  return snapshot;
}

function createPublicFallbackSnapshot(): AdminContentSnapshot {
  const snapshot = createInitialAdminSnapshot();

  contentKeys.forEach((key) => {
    if (key === "faqs") return;

    snapshot.content[key] = (snapshot.content[key] as AdminItem[]).filter((item) => getItemStatus(item) === "published") as never;
  });

  return snapshot;
}

function getItemStatus(item: AdminItem) {
  return "status" in item ? item.status : "published";
}

function snapshotFromRows(rows: ContentRow[], fallback = createInitialAdminSnapshot()): AdminContentSnapshot {
  if (!rows.length) return fallback;

  const content = clone(fallback.content);
  const keysWithRows = new Set<AdminContentKey>();

  rows.forEach((row) => {
    if (isContentKey(row.content_type)) keysWithRows.add(row.content_type);
  });

  keysWithRows.forEach((key) => {
    content[key] = [] as never;
  });

  rows
    .filter((row) => isContentKey(row.content_type))
    .sort((first, second) => first.content_type.localeCompare(second.content_type) || first.sort_order - second.sort_order)
    .forEach((row) => {
      const key = row.content_type as AdminContentKey;
      (content[key] as AdminItem[]).push(row.payload);
    });

  return normalizeAdminContentSnapshot({
    version: 1,
    exportedAt: new Date().toISOString(),
    content
  });
}

async function loadRows(selectAll: boolean): Promise<ContentSnapshotResult> {
  const fallback = selectAll ? createInitialAdminSnapshot() : createPublicFallbackSnapshot();

  if (!hasSupabaseConfig()) {
    return { snapshot: fallback, source: "static", message: "Supabase no esta configurado; usando contenido local." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    let query = supabase.from("content_items").select("content_type,content_id,payload,sort_order").order("content_type").order("sort_order");

    if (!selectAll) {
      query = query.eq("status", "published");
    }

    const { data, error } = await query;

    if (error) {
      return { snapshot: fallback, source: "static", message: `Supabase no pudo leer content_items: ${getSupabaseErrorText(error)}` };
    }

    if (!data?.length) {
      return { snapshot: fallback, source: "static", message: "Supabase esta vacio; usando seed local hasta guardar el contenido." };
    }

    return { snapshot: snapshotFromRows(data as ContentRow[], selectAll ? fallback : createEmptySnapshot()), source: "supabase" };
  } catch (error) {
    return { snapshot: fallback, source: "static", message: error instanceof Error ? error.message : "No se pudo leer Supabase." };
  }
}

export async function loadAdminContentSnapshot() {
  return loadRows(true);
}

export const loadPublicContentSnapshot = cache(async () => loadRows(false));

export async function saveAdminSnapshotToSupabase(supabase: SupabaseClient, snapshot: AdminContentSnapshot) {
  const normalizedSnapshot = normalizeAdminContentSnapshot(snapshot);

  for (const key of contentKeys) {
    const items = normalizedSnapshot.content[key] as AdminItem[];
    const rows = items.map((item, index) => ({
      content_type: key,
      content_id: item.id,
      payload: item,
      status: "published",
      visibility: key === "seoPages" ? "hidden" : "listed",
      robots_index: true,
      sort_order: index
    }));

    const { data: existingRows, error: existingError } = await supabase.from("content_items").select("content_id").eq("content_type", key);

    if (existingError) throw createContentSaveError("leer", key, existingError);

    const nextIds = new Set(rows.map((row) => row.content_id));
    const staleIds = (existingRows ?? []).map((row) => row.content_id as string).filter((contentId) => !nextIds.has(contentId));

    if (staleIds.length) {
      const { error: deleteError } = await supabase.from("content_items").delete().eq("content_type", key).in("content_id", staleIds);
      if (deleteError) throw createContentSaveError("eliminar", key, deleteError);
    }

    if (rows.length) {
      const { error: upsertError } = await supabase.from("content_items").upsert(rows, { onConflict: "content_type,content_id" });
      if (upsertError) throw createContentSaveError("guardar", key, upsertError);
    }
  }

  return {
    ...normalizedSnapshot,
    exportedAt: new Date().toISOString()
  };
}
