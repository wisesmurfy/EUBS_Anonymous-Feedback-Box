"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { SubmissionType, FeedbackCategory, ReportCategory } from "@/lib/types";

const FEEDBACK_CATEGORIES: { value: FeedbackCategory; label: string }[] = [
  { value: "program", label: "프로그램" },
  { value: "equipment", label: "장비/시설" },
  { value: "operations", label: "운영" },
  { value: "culture", label: "동아리 문화" },
  { value: "other", label: "기타" },
];

const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "conflict", label: "갈등/분쟁" },
  { value: "misconduct", label: "부적절한 행동" },
  { value: "safety", label: "안전 문제" },
  { value: "other", label: "기타" },
];

export function SubmissionForm() {
  const router = useRouter();
  const [type, setType] = useState<SubmissionType>("feedback");
  const [category, setCategory] = useState<string>("");
  const [content, setContent] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [answerEmail, setAnswerEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const categories = type === "feedback" ? FEEDBACK_CATEGORIES : REPORT_CATEGORIES;
  const maxLength = 2000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (content.trim().length < 10) {
      setError("최소 10자 이상 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        type,
        content: content.trim(),
        is_urgent: isUrgent,
      };
      if (category) payload.category = category;
      if (type === "report" && answerEmail.trim()) {
        payload.answer_email = answerEmail.trim();
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "제출 중 오류가 발생했습니다.");
        return;
      }

      router.push("/submit/complete");
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 타입 선택 */}
      <div className="rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
        <div className="grid grid-cols-2 gap-1">
          {(["feedback", "report"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setCategory("");
                setIsUrgent(false);
                setAnswerEmail("");
              }}
              className={cn(
                "flex flex-col items-center rounded-xl py-4 px-4 text-center transition-all duration-150",
                type === t
                  ? "bg-ewha-700 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="mb-1 text-xl">
                {t === "feedback" ? "💬" : "🚨"}
              </span>
              <span className="text-sm font-semibold">
                {t === "feedback" ? "피드백" : "신고"}
              </span>
              <span className={cn("mt-0.5 text-xs", type === t ? "text-ewha-100" : "text-gray-400")}>
                {t === "feedback" ? "의견 & 건의사항" : "갈등 & 문제 상황"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 카테고리 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <label className="mb-3 block text-sm font-semibold text-gray-700">
          카테고리 <span className="font-normal text-gray-400">(선택)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(category === cat.value ? "" : cat.value)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                category === cat.value
                  ? "bg-ewha-700 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-ewha-50 hover:text-ewha-700"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 신고 옵션 */}
      {type === "report" && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 space-y-4">
          {/* 긴급 토글 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-700">긴급 신고</p>
              <p className="text-xs text-gray-400">긴급 상황일 경우 우선 처리됩니다</p>
            </div>
            <button
              type="button"
              onClick={() => setIsUrgent(!isUrgent)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                isUrgent ? "bg-red-500" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                  isUrgent ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>

          {/* 답변 이메일 */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              답변 수신 이메일 <span className="font-normal text-gray-400">(선택)</span>
            </label>
            <input
              type="email"
              value={answerEmail}
              onChange={(e) => setAnswerEmail(e.target.value)}
              placeholder="답변을 받으실 이메일을 입력해주세요"
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
            <p className="mt-1 text-xs text-gray-400">
              입력하지 않으면 완전 익명으로 처리됩니다
            </p>
          </div>
        </div>
      )}

      {/* 내용 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-semibold text-gray-700">내용</label>
          <span className={cn("text-xs", content.length > maxLength * 0.9 ? "text-red-500" : "text-gray-400")}>
            {content.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            type === "feedback"
              ? "EUBS 운영에 대한 의견이나 건의사항을 자유롭게 작성해주세요."
              : "발생한 상황을 최대한 구체적으로 작성해주세요."
          }
          rows={6}
          maxLength={maxLength}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      {/* 익명 안내 */}
      <div className="flex items-start gap-2 rounded-xl bg-ewha-50 px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-ewha-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-xs leading-relaxed text-ewha-700">
          {type === "feedback"
            ? "이 피드백은 완전히 익명으로 처리됩니다. IP 주소, 기기 정보 등 어떠한 정보도 저장되지 않습니다."
            : "신고 내용은 국부국(관리자)만 확인할 수 있으며, 이메일을 입력하지 않으면 완전 익명으로 처리됩니다."}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button type="submit" loading={loading} size="lg" className="w-full">
        {loading ? "제출 중..." : "제출하기"}
      </Button>
    </form>
  );
}
