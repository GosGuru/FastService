import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { supabaseGalleryBucket } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const mimeToExtension = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["video/mp4", "mp4"],
  ["video/webm", "webm"],
  ["video/quicktime", "mov"]
]);

const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "mp4", "webm", "mov"]);

function getErrorText(error: unknown) {
  if (!error || typeof error !== "object") return "Error desconocido.";

  const storageError = error as { message?: string; status?: number; statusCode?: string; code?: string; error?: string };

  return [storageError.message, storageError.error, storageError.code, storageError.statusCode, storageError.status ? `Status ${storageError.status}` : undefined]
    .filter(Boolean)
    .join(" ");
}

function explainStorageError(error: unknown) {
  const rawMessage = getErrorText(error);
  const normalizedMessage = rawMessage.toLowerCase();

  if (normalizedMessage.includes("bucket") && (normalizedMessage.includes("not found") || normalizedMessage.includes("does not exist"))) {
    return `No encuentro el bucket ${supabaseGalleryBucket}. Ejecuta completo supabase/schema.sql en Supabase y vuelve a subir la imagen.`;
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("rls")) {
    return "Supabase bloqueo Storage por RLS. Ejecuta las policies de Storage de supabase/schema.sql y confirma que tu usuario esta en admin_users.";
  }

  if (normalizedMessage.includes("permission") || normalizedMessage.includes("not authorized") || normalizedMessage.includes("unauthorized")) {
    return "Supabase rechazo la subida por permisos. Vuelve a iniciar sesion en /admin/login y confirma que ese usuario sigue en admin_users.";
  }

  if (normalizedMessage.includes("mime") || normalizedMessage.includes("not allowed")) {
    return "Supabase rechazo el tipo de archivo. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV.";
  }

  return `Supabase Storage no pudo preparar la subida: ${rawMessage}`;
}

function getExtension(fileName: string, contentType: string) {
  const normalizedType = contentType.toLowerCase();
  const mimeExtension = mimeToExtension.get(normalizedType);
  if (mimeExtension) return mimeExtension;

  const nameExtension = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (allowedExtensions.has(nameExtension)) return nameExtension === "jpeg" ? "jpg" : nameExtension;

  return "";
}

function normalizePrefix(value: unknown) {
  const prefix = typeof value === "string" ? value : "media";

  return prefix
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64) || "media";
}

export async function POST(request: Request) {
  const adminSession = await getAdminSession();

  if (!adminSession) {
    return NextResponse.json({ message: "Tu sesion admin expiro. Vuelve a iniciar sesion y sube la imagen otra vez." }, { status: 401 });
  }

  let body: { fileName?: string; contentType?: string; prefix?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "La solicitud de subida no es valida." }, { status: 400 });
  }

  const fileName = body.fileName ?? "";
  const contentType = body.contentType ?? "";
  const extension = getExtension(fileName, contentType);

  if (!extension) {
    return NextResponse.json({ message: "Formato no permitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV." }, { status: 400 });
  }

  const storagePath = `${new Date().getFullYear()}/${normalizePrefix(body.prefix)}-${randomUUID()}.${extension}`;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.storage.from(supabaseGalleryBucket).createSignedUploadUrl(storagePath);

    if (error || !data?.token) {
      return NextResponse.json({ message: explainStorageError(error) }, { status: 400 });
    }

    const { data: publicData } = supabase.storage.from(supabaseGalleryBucket).getPublicUrl(storagePath);

    return NextResponse.json({
      path: storagePath,
      token: data.token,
      publicUrl: publicData.publicUrl
    });
  } catch (error) {
    return NextResponse.json({ message: explainStorageError(error) }, { status: 500 });
  }
}
