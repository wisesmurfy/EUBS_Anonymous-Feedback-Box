"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import type { ProposalQuestion, ProposalQuestionReply } from "@/lib/types";

type QuestionWithReplies = ProposalQuestion & {
  proposal_question_replies: ProposalQuestionReply[];
};

interface AdminQuestionListProps {
  initialQuestions: QuestionWithReplies[];
}

export function AdminQuestionList({ initialQuestions }: AdminQuestionListProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function refresh() {
    // 서버 컴포넌트 재렌더 트리거
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-400">아직 질문이 없습니다</p>
        </div>
      ) : (
        questions.map((q) => (
          <AdminQuestionCard
            key={q.id}
            question={q}
            isExpanded={expandedId === q.id}
            onToggle={() => setExpandedId(expandedId === q.id ? null : q.id)}
            onReplied={refresh}
          />
        ))
      )}
    </div>
  );
}

interface AdminQuestionCardProps {
  question: QuestionWithReplies;
  isExpanded: boolean;
  onToggle: () => void;
  onReplied: () => void;
}

function AdminQuestionCard({ question, isExpanded, onToggle, onReplied }: AdminQuestionCardProps) {
  const reply = question.proposal_question_replies?.[0];
  const [replyContent, setReplyContent] = useState(reply?.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveReply() {
    if (!replyContent.trim()) { setError("답변 내용을 입력해주세요."); return; }
    setError(null);
    setSaving(true);

    const res = await fetch(`/api/admin/proposals/questions/${question.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyContent.trim() }),
    });

    if (res.ok) {
      onReplied();
    } else {
      const data = await res.json();
      setError(data.error ?? "저장 오류");
    }
    setSaving(false);
  }

  async function handleDeleteReply() {
    if (!confirm("답변을 삭제하시겠습니까?")) return;
    setSaving(true);

    const res = await fetch(`/api/admin/proposals/questions/${question.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReplyContent("");
      onReplied();
    }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* 질문 헤더 */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                {question.questioner_name}
              </span>
              <span className="rounded-full bg-ewha-50 px-2 py-0.5 text-xs text-ewha-700">
                {question.questioner_role}
              </span>
              {reply ? (
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                  답변 완료
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  답변 대기
                </span>
              )}
              <span className="ml-auto text-xs text-gray-400 shrink-0">
                {formatRelativeTime(question.created_at)}
              </span>
            </div>
            <p className={cn(
              "text-sm text-gray-700",
              !isExpanded && "line-clamp-2"
            )}>
              {question.content}
            </p>
          </div>
          <svg
            className={cn("h-4 w-4 text-gray-400 shrink-0 transition-transform mt-0.5", isExpanded && "rotate-180")}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 답변 에디터 (펼쳐졌을 때) */}
      {isExpanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <label className="mb-2 block text-xs font-semibold text-gray-600">
            국부국 답변 {reply && <span className="text-green-600">(작성됨 — 수정 가능)</span>}
          </label>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="답변을 작성해주세요. 저장 즉시 공개됩니다."
            rows={5}
            maxLength={2000}
            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
          {error && (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          )}
          <div className="mt-3 flex gap-2">
            <Button onClick={handleSaveReply} loading={saving} size="sm" className="flex-1">
              {reply ? "답변 수정" : "답변 등록"}
            </Button>
            {reply && (
              <Button
                onClick={handleDeleteReply}
                variant="secondary"
                size="sm"
                loading={saving}
                className="text-red-600 hover:text-red-700"
              >
                삭제
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
