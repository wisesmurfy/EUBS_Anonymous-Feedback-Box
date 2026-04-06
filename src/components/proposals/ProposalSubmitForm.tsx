"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { ProgramType } from "@/lib/types";

const PROGRAM_TYPES: { value: ProgramType; label: string; desc: string }[] = [
  { value: "radio", label: "라디오", desc: "음성 방송 프로그램" },
  { value: "tv", label: "TV", desc: "영상 방송 프로그램" },
  { value: "online", label: "온라인/SNS", desc: "인스타, 유튜브 등" },
  { value: "event", label: "이벤트", desc: "행사 기획" },
  { value: "other", label: "기타", desc: "위에 해당 없음" },
];

export function ProposalSubmitForm() {
  const router = useRouter();
  const [programType, setProgramType] = useState<ProgramType>("radio");
  const [title, setTitle] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!submitterName.trim()) { setError("이름을 입력해주세요."); return; }
    if (!submitterEmail.trim()) { setError("이메일을 입력해주세요."); return; }
    if (content.trim().length < 50) { setError("기획안 내용을 최소 50자 이상 작성해주세요."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          program_type: programType,
          submitter_name: submitterName.trim(),
          submitter_email: submitterEmail.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "제출 중 오류가 발생했습니다."); return; }

      router.push(`/proposals/submitted?token=${data.view_token}`);
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
        <div className="grid grid-cols-5 gap-1.5">
          {PROGRAM_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setProgramType(pt.value)}
              className={cn(
                "flex flex-col items-center rounded-xl p-2.5 text-center transition-all",
                programType === pt.value
                  ? "bg-ewha-700 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-ewha-50 hover:text-ewha-700"
              )}
            >
              <span className="text-sm font-semibold">{pt.label}</span>
              <span className={cn("mt-0.5 text-[10px] leading-tight", programType === pt.value ? "text-ewha-100" : "text-gray-400")}>
                {pt.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 기획안 제목 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">기획안 제목</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="기획안 제목을 입력해주세요"
          maxLength={100}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      {/* 제출자 정보 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 space-y-3">
        <label className="block text-sm font-semibold text-gray-700">제출자 정보</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">이름</label>
            <input
              type="text"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              placeholder="홍길동"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">이메일</label>
            <input
              type="email"
              value={submitterEmail}
              onChange={(e) => setSubmitterEmail(e.target.value)}
              placeholder="email@ewha.ac.kr"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">피드백 완료 시 이메일로 안내받을 수 있습니다</p>
      </div>

      {/* 기획안 내용 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">기획안 내용</label>
          <span className="text-xs text-gray-400">{content.length.toLocaleString()} / 10,000</span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`기획 의도, 프로그램 구성, 예상 출연진/섭외, 예산 등을 포함하여 작성해주세요.\n\n최소 50자 이상 작성해야 합니다.`}
          rows={10}
          maxLength={10000}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <Button type="submit" loading={loading} size="lg" className="w-full">
        기획안 제출하기
      </Button>
    </form>
  );
}
