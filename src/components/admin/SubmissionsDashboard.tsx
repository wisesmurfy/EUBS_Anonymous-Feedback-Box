"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime, truncate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { Submission, SubmissionType, SubmissionStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const TYPE_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "feedback", label: "피드백" },
  { value: "report", label: "신고" },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "unread", label: "미확인" },
  { value: "read", label: "확인" },
  { value: "in_progress", label: "처리중" },
  { value: "resolved", label: "완료" },
];

export function SubmissionsDashboard() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      ...(typeFilter !== "all" && { type: typeFilter }),
      ...(statusFilter !== "all" && { status: statusFilter }),
      ...(search && { search }),
    });

    const res = await fetch(`/api/admin/submissions?${params}`);
    const data = await res.json();
    setSubmissions(data.submissions ?? []);
    setTotal(data.total ?? 0);
    setTotalPages(data.totalPages ?? 1);
    setLoading(false);
  }, [page, typeFilter, statusFilter, search]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Realtime 구독
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("submissions-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "submissions" }, () => {
        setToast("새 소리함이 도착했습니다 🔔");
        setTimeout(() => setToast(null), 4000);
        fetchSubmissions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchSubmissions]);

  async function handleExport() {
    const res = await fetch("/api/admin/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: typeFilter, status: statusFilter }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eubs-submissions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-ewha-700 px-4 py-3 text-sm font-medium text-white shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* Type */}
        <div className="flex rounded-lg bg-white ring-1 ring-gray-100 overflow-hidden">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => { setTypeFilter(f.value); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-xs font-medium transition-colors",
                typeFilter === f.value ? "bg-ewha-700 text-white" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex rounded-lg bg-white ring-1 ring-gray-100 overflow-hidden">
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

        {/* Search */}
        <div className="flex-1 min-w-40">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="내용 검색..."
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs placeholder-gray-400 outline-none focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
        </div>

        <button
          onClick={handleExport}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          CSV 내보내기
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ewha-700 border-t-transparent" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            해당하는 소리함이 없습니다
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-400">
                <th className="px-4 py-3">유형</th>
                <th className="px-4 py-3 hidden sm:table-cell">카테고리</th>
                <th className="px-4 py-3">내용</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 hidden md:table-cell">제출일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissions.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => router.push(`/admin/${s.id}`)}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-ewha-50",
                    s.status === "unread" && "bg-red-50/30"
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <TypeBadge type={s.type as SubmissionType} />
                      {s.is_urgent && (
                        <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                          긴급
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-xs text-gray-500">{s.category ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className={cn("text-sm", s.status === "unread" ? "font-medium text-gray-900" : "text-gray-600")}>
                      {truncate(s.content, 60)}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status as SubmissionStatus} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{formatRelativeTime(s.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
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
