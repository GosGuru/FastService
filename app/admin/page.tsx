import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { saveAdminSnapshotAction, saveSiteSettingsAction, signOutAction } from "@/app/admin/actions";
import { getAdminSession } from "@/lib/supabase/admin-auth";
import { loadAdminContentSnapshot } from "@/lib/supabase/content";
import { loadSiteSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const adminSession = await getAdminSession();

  if (!adminSession) redirect("/admin/login?next=/admin");

  const snapshotResult = await loadAdminContentSnapshot();
  const settings = await loadSiteSettings();

  return (
    <AdminDashboard
      adminEmail={adminSession.email}
      initialSnapshot={snapshotResult.snapshot}
      initialSource={snapshotResult.source}
      initialMessage={snapshotResult.message}
      initialSettings={settings}
      saveSnapshotAction={saveAdminSnapshotAction}
      saveSettingsAction={saveSiteSettingsAction}
      signOutAction={signOutAction}
    />
  );
}
