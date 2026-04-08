"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { PROGRAM_TYPES, PROGRAM_TYPE_LABELS, type ProgramType } from "@/lib/types";

export function ProposalCreateForm() {
  const router = useRouter();
  const [programType, setProgramType] = useState<ProgramType>("뉴스");
  const [title, setTitle] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [broadcastDate, setBroadcastDate] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("기획안 제목을 입력해주세요."); return; }
    if (!submitterName.trim()) { setError("제출자 이름을 입력해주세요."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          program_type: programType,
          submitter_name: submitterName.trim(),
          submitter_email: submitterEmail.trim() || undefined,
          broadcast_date: broadcastDate || undefined,
          content: content.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "저장 중 오류가 발생했습니다."); return; }

      router.push(`/admin/proposals/${data.id}`);
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 프로그램 유형 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <label className="mb-3 block text-sm font-semibold text-gray-700">프로그램 유형</label>
        <div className="flex flex-wrap gap-2">
          {PROGRAM_TYPES.map((pt) => (
            <button
              key={pt}
              type="button"
              onClick={() => setProgramType(pt)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-all",
                programType === pt
                  ? "bg-ewha-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-ewha-50 hover:text-ewha-700"
              )}
            >
              {PROGRAM_TYPE_LABELS[pt]}
            </button>
          ))}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 space-y-3">
        <label className="block text-sm font-semibold text-gray-700">기획안 정보</label>

        <div>
          <label className="mb-1 block text-xs text-gray-500">기획안 제목 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="기획안 제목"
            maxLength={100}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">제출자 이름 *</label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="홍길동"
              maxLength={50}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">방송 날짜</label>
            <input
              type="date"
              value={broadcastDate}
              onChange={(e) => setBroadcastDate(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-500">제출자 이메일 (선택 — 입력 시 피드백 완료 후 알림 발송)</label>
          <input
            type="email"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            placeholder="email@ewha.ac.kr"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
        </div>
      </div>

      {/* 메모 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">기획안 메모 (선택)</label>
          <span className="text-xs text-gray-400">{content.length} / 10,000</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="기획안 주요 내용이나 참고 사항을 간략하게 메모할 수 있습니다."
          rows={5}
          maxLength={10000}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
          className="flex-1"
        >
          취소
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          기획안 등록
        </Button>
      </div>
    </form>
  );
}
