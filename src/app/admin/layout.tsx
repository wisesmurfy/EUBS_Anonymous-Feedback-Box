import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // admin_profiles 확인
  const { data: profile } = await supabase
    .from("admin_profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar displayName={profile.display_name} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
