import { createClient } from "@/lib/supabase/server";
import { ProposalsTable } from "@/components/admin/ProposalsTable";

export default async function AdminProposalsPage() {
  const supabase = await createClient();

  const [
    { count: total },
    { count: pending },
    { count: reviewed },
  ] = await Promise.all([
    supabase.from("proposals").select("*", { count: "exact", head: true }),
    supabase.from("proposals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("proposals").select("*", { count: "exact", head: true }).eq("status", "reviewed"),
  ]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">기획안 피드백</h1>
        <p className="mt-0.5 text-sm text-gray-500">국원들의 기획안을 검토하고 피드백을 작성하세요</p>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-xs text-gray-500">전체 기획안</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{total ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs text-gray-500">검토 대기</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{pending ?? 0}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-blue-100">
          <p className="text-xs text-gray-500">검토 완료</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{reviewed ?? 0}</p>
        </div>
      </div>

      <ProposalsTable />
    </div>
  );
}
