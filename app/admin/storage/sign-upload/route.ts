import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { createR2UploadUrl, getUploadRules } from "@/lib/storage/r2";

function normalizePrefix(value: unknown) {
  const prefix = typeof value === "string" ? value : "media";
  return prefix.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "media";
}

export async function POST(request: Request) {
  if (!await getAdminSession()) {
    return NextResponse.json({ message: "Tu sesion admin expiro. Vuelve a iniciar sesion." }, { status: 401 });
  }

  let body: { contentType?: string; fileSize?: number; prefix?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "La solicitud de subida no es valida." }, { status: 400 });
  }

  const contentType = body.contentType?.toLowerCase() ?? "";
  const rules = getUploadRules(contentType);
  const fileSize = Number(body.fileSize);

  if (!rules) {
    return NextResponse.json({ message: "Formato no permitido. Usa JPG, PNG, WebP, GIF, MP4, WebM o MOV." }, { status: 400 });
  }
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > rules.maxBytes) {
    return NextResponse.json({ message: `El archivo supera el limite de ${Math.round(rules.maxBytes / 1024 / 1024)} MB.` }, { status: 413 });
  }

  const path = `${new Date().getFullYear()}/${normalizePrefix(body.prefix)}-${randomUUID()}.${rules.extension}`;

  try {
    const uploadUrl = await createR2UploadUrl(path, contentType);
    return NextResponse.json({ path, uploadUrl, contentType, maxBytes: rules.maxBytes });
  } catch {
    return NextResponse.json({ message: "R2 no esta configurado o no pudo firmar la subida." }, { status: 503 });
  }
}
