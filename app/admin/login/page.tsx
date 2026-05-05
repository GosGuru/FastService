import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { getAdminSession } from "@/lib/supabase/admin-auth";

type Props = { searchParams: Promise<{ next?: string }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const adminSession = await getAdminSession();
  const { next } = await searchParams;
  const nextPath = next?.startsWith("/admin") && next !== "/admin/login" ? next : "/admin";

  if (adminSession) redirect(nextPath);

  return (
    <main className="admin-login-page">
      <AdminLoginForm nextPath={nextPath} />
    </main>
  );
}
