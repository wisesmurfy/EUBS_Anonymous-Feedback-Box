import { createClient } from "@/lib/supabase/server";
import { SubmissionsDashboard } from "@/components/admin/SubmissionsDashboard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 통계 쿼리
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalThisMonth },
    { count: unreadCount },
    { count: feedbackCount },
    { count: reportCount },
  ] = await Promise.all([
    supabase.from("submissions").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("status", "unread"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("type", "feedback"),
    supabase.from("submissions").select("*", { count: "exact", head: true }).eq("type", "report"),
  ]);

  const stats = {
    totalThisMonth: totalThisMonth ?? 0,
    unread: unreadCount ?? 0,
    feedback: feedbackCount ?? 0,
    report: reportCount ?? 0,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">익명 소리함</h1>
        <p className="mt-0.5 text-sm text-gray-500">국원들의 피드백과 신고를 확인하세요</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="이번 달 접수" value={stats.totalThisMonth} />
        <StatCard label="미확인" value={stats.unread} highlight={stats.unread > 0} />
        <StatCard label="피드백" value={stats.feedback} />
        <StatCard label="신고" value={stats.report} />
      </div>

      <SubmissionsDashboard />
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ${highlight ? "ring-red-100" : "ring-gray-100"}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
