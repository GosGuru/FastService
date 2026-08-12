import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { deleteR2Object, isValidStoragePath } from "@/lib/storage/r2";

export async function POST(request: Request) {
  if (!await getAdminSession()) return NextResponse.json({ message: "Tu sesion admin expiro." }, { status: 401 });
  let body: { path?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ message: "La solicitud de borrado no es valida." }, { status: 400 });
  }
  const path = body.path ?? "";
  if (!isValidStoragePath(path)) return NextResponse.json({ message: "La ruta del archivo no es valida." }, { status: 400 });
  try {
    await deleteR2Object(path);
    return NextResponse.json({ deleted: true });
  } catch {
    return NextResponse.json({ message: "No se pudo borrar el archivo de R2." }, { status: 502 });
  }
}
