import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { saveAdminSnapshotAction, signOutAction } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { loadAdminContentSnapshot } from "@/lib/supabase/content";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminSession = await getAdminSession();

  if (!adminSession) redirect("/admin/login?next=/admin");

  const snapshotResult = await loadAdminContentSnapshot();

  return (
    <AdminDashboard
      adminEmail={adminSession.email}
      initialSnapshot={snapshotResult.snapshot}
      initialSource={snapshotResult.source}
      initialMessage={snapshotResult.message}
      saveSnapshotAction={saveAdminSnapshotAction}
      signOutAction={signOutAction}
    />
  );
}