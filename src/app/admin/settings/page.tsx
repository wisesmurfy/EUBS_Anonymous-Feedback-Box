import { createClient } from "@/lib/supabase/server";
import { AdminSettingsForm } from "./AdminSettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">설정</h1>
        <p className="mt-0.5 text-sm text-gray-500">계정 정보 및 알림 설정을 변경합니다</p>
      </div>

      <div className="max-w-lg">
        <AdminSettingsForm
          displayName={profile?.display_name ?? ""}
          emailNotify={profile?.email_notify ?? true}
          email={user.email ?? ""}
        />
      </div>
    </div>
  );
}
