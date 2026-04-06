"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProposalStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { PROGRAM_TYPE_LABELS, type Proposal, type ProposalStatus, type ProgramType } from "@/lib/types";

const STATUS_FILTERS = [
  { value: "all", label: "전체" },
  { value: "pending", label: "검토 대기" },
  { value: "reviewed", label: "검토 완료" },
  { value: "approved", label: "승인" },
  { value: "rejected", label: "반려" },
];

export function ProposalsTable() {
  const router = useRouter();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      ...(statusFilter !== "all" && { status: statusFilter }),
    });
    const res = await fetch(`/api/admin/proposals?${params}`);
    const data = await res.json();
    setProposals(data.proposals ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-4 flex rounded-lg bg-white ring-1 ring-gray-100 overflow-hidden w-fit">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={cn(
              "px-3 py-1.5 text-xs font-medium transition-colors",
              statusFilter === f.value ? "bg-ewha-700 text-white" : "text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ewha-700 border-t-transparent" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">기획안이 없습니다</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                <th className="px-4 py-3">제목</th>
                <th className="px-4 py-3 hidden sm:table-cell">유형</th>
                <th className="px-4 py-3">제출자</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 hidden md:table-cell">제출일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proposals.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/admin/proposals/${p.id}`)}
                  className="cursor-pointer hover:bg-ewha-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">
                      {PROGRAM_TYPE_LABELS[p.program_type as ProgramType]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{p.submitter_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ProposalStatusBadge status={p.status as ProposalStatus} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{formatRelativeTime(p.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>총 {total}건</span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              이전
            </Button>
            <span className="flex items-center px-2 text-xs">{page} / {totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
