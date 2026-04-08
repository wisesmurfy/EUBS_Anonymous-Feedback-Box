"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { FeedbackSection } from "@/lib/types";

const DEFAULT_SECTIONS: FeedbackSection[] = [
  { title: "기획 의도", score: 3, max_score: 5, comment: "" },
  { title: "구성 및 흐름", score: 3, max_score: 5, comment: "" },
  { title: "실현 가능성", score: 3, max_score: 5, comment: "" },
  { title: "창의성", score: 3, max_score: 5, comment: "" },
];

interface ProposalFeedbackEditorProps {
  proposalId: string;
  hasEmail: boolean;
  existingFeedback: {
    sections: FeedbackSection[];
    overall_comment: string;
  } | null;
}

export function ProposalFeedbackEditor({
  proposalId,
  hasEmail,
  existingFeedback,
}: ProposalFeedbackEditorProps) {
  const router = useRouter();
  const [sections, setSections] = useState<FeedbackSection[]>(
    existingFeedback?.sections ?? DEFAULT_SECTIONS
  );
  const [overallComment, setOverallComment] = useState(
    existingFeedback?.overall_comment ?? ""
  );
  const [notifySubmitter, setNotifySubmitter] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function updateSection(index: number, field: keyof FeedbackSection, value: string | number) {
    setSections((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/proposals/${proposalId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sections,
        overall_comment: overallComment,
        notify_submitter: notifySubmitter,
      }),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      router.refresh();
    }
    setSaving(false);
  }

  const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
  const maxScore = sections.reduce((sum, s) => sum + s.max_score, 0);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">피드백 작성</h2>
        <div className="text-right">
          <span className="text-lg font-bold text-ewha-700">{totalScore}</span>
          <span className="text-xs text-gray-400"> / {maxScore}점</span>
        </div>
      </div>

      {/* 섹션별 피드백 */}
      <div className="space-y-5">
        {sections.map((section, i) => (
          <div key={i} className="rounded-xl bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{section.title}</h3>
              <div className="flex items-center gap-1">
                {Array.from({ length: section.max_score }).map((_, j) => (
                  <button
                    key={j}
                    type="button"
                    onClick={() => updateSection(i, "score", j + 1)}
                    className={cn(
                      "h-6 w-6 rounded-full text-xs font-semibold transition-all",
                      j < section.score
                        ? "bg-ewha-700 text-white"
                        : "bg-gray-200 text-gray-400 hover:bg-ewha-100 hover:text-ewha-700"
                    )}
                  >
                    {j + 1}
                  </button>
                ))}
              </div>
            </div>
            {/* Score bar */}
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-ewha-700 transition-all duration-300"
                style={{ width: `${(section.score / section.max_score) * 100}%` }}
              />
            </div>
            <textarea
              value={section.comment}
              onChange={(e) => updateSection(i, "comment", e.target.value)}
              placeholder={`${section.title}에 대한 피드백을 작성하세요...`}
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
        ))}
      </div>

      {/* 종합 의견 */}
      <div className="mt-5">
        <label className="mb-1.5 block text-sm font-semibold text-gray-800">종합 의견</label>
        <textarea
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
          placeholder="전반적인 피드백과 제안사항을 작성해주세요..."
          rows={5}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      {/* 이메일 알림 옵션 — 이메일이 있을 때만 표시 */}
      {hasEmail && (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifySubmitter(!notifySubmitter)}
            className={cn(
              "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
              notifySubmitter ? "bg-ewha-700" : "bg-gray-200"
            )}
          >
            <span
              className={cn(
                "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform",
                notifySubmitter ? "translate-x-4.5" : "translate-x-0.5"
              )}
            />
          </button>
          <span className="text-xs text-gray-600">저장 시 제출자에게 이메일 알림 발송</span>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <Button
          onClick={handleSave}
          loading={saving}
          className="flex-1"
        >
          {existingFeedback ? "피드백 수정 저장" : "피드백 저장"}
        </Button>
        {saved && (
          <span className="text-xs text-ewha-700 font-medium">✓ 저장되었습니다</span>
        )}
      </div>
    </div>
  );
}
