import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { deleteR2Object, getPublicObjectUrl, getR2Config, getUploadRules, inspectR2Object, isValidStoragePath } from "@/lib/storage/r2";

export async function POST(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ message: "Tu sesion admin expiro." }, { status: 401 });

  let body: { path?: string; contentType?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "La confirmacion de subida no es valida." }, { status: 400 });
  }

  const path = body.path ?? "";
  const contentType = body.contentType?.toLowerCase() ?? "";
  const rules = getUploadRules(contentType);
  if (!rules || !isValidStoragePath(path)) return NextResponse.json({ message: "El archivo firmado no es valido." }, { status: 400 });

  try {
    const object = await inspectR2Object(path);
    const actualType = object.ContentType?.toLowerCase();
    const actualSize = object.ContentLength ?? 0;
    if (actualType !== contentType || actualSize <= 0 || actualSize > rules.maxBytes) {
      await deleteR2Object(path);
      return NextResponse.json({ message: "R2 rechazo el archivo por tipo o tamano; el objeto fue eliminado." }, { status: 422 });
    }
    const { publicUrl } = getR2Config();
    return NextResponse.json({ path, publicUrl: getPublicObjectUrl(publicUrl, path) });
  } catch {
    return NextResponse.json({ message: "No se pudo verificar la subida en R2." }, { status: 502 });
  }
}
