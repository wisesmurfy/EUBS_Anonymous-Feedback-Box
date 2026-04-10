"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { formatRelativeTime } from "@/lib/utils/format";
import { Button } from "@/components/ui/Button";
import { QUESTIONER_ROLE_LABELS, type QuestionerRole, type ProposalQuestion } from "@/lib/types";

const ROLES: QuestionerRole[] = ["기자", "PD", "기타"];

export function QuestionBoard() {
  const [questions, setQuestions] = useState<ProposalQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // 질문 폼 상태
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<QuestionerRole>("기자");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function fetchQuestions() {
    setLoading(true);
    const res = await fetch("/api/proposals/questions");
    const data = await res.json();
    setQuestions(data.questions ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchQuestions();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) { setFormError("이름을 입력해주세요."); return; }
    if (!email.trim()) { setFormError("이메일을 입력해주세요."); return; }
    if (content.trim().length < 5) { setFormError("질문 내용을 5자 이상 입력해주세요."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/proposals/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questioner_name: name.trim(),
          questioner_role: role,
          email: email.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "제출 중 오류가 발생했습니다."); return; }

      setName("");
      setEmail("");
      setContent("");
      setRole("기자");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      fetchQuestions();
    } catch {
      setFormError("네트워크 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 질문 작성 폼 */}
      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
        <h2 className="mb-4 text-sm font-bold text-gray-900">질문 작성</h2>

        {/* 이름 + 직책 */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              maxLength={50}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">직책</label>
            <div className="flex gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 rounded-lg border py-2.5 text-xs font-medium transition-all",
                    role === r
                      ? "border-ewha-700 bg-ewha-700 text-white"
                      : "border-gray-200 text-gray-600 hover:border-ewha-300 hover:text-ewha-700"
                  )}
                >
                  {QUESTIONER_ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 이메일 */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="국부국에 등록된 이메일 주소"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
          <p className="mt-1 text-xs text-gray-400">이메일은 제출 후 공개되지 않습니다.</p>
        </div>

        {/* 질문 내용 */}
        <div className="mb-3">
          <label className="mb-1 block text-xs font-medium text-gray-500">질문 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="국부국에게 질문하고 싶은 내용을 작성해주세요. 이름과 직책이 공개됩니다."
            rows={4}
            maxLength={2000}
            className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
          <p className="mt-1 text-right text-xs text-gray-400">{content.length} / 2,000</p>
        </div>

        {formError && (
          <div className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>
        )}

        {submitted && (
          <div className="mb-3 rounded-xl bg-ewha-50 px-4 py-3 text-sm text-ewha-700 font-medium">
            질문이 등록되었습니다. 국부국의 답변을 기다려주세요.
          </div>
        )}

        <p className="mb-3 text-xs text-gray-400">
          이름과 직책이 공개됩니다. 국부국 답변도 모든 국원이 볼 수 있습니다.
        </p>

        <Button type="submit" loading={submitting} className="w-full">
          질문 등록
        </Button>
      </form>

      {/* 질문 목록 */}
      <div>
        <h2 className="mb-3 text-sm font-bold text-gray-700">
          전체 질문 {!loading && `(${questions.length})`}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-ewha-700 border-t-transparent" />
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <p className="text-sm text-gray-400">아직 질문이 없습니다. 첫 번째 질문을 남겨보세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard key={q.id} question={q} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuestionCard({ question }: { question: ProposalQuestion }) {
  const reply = question.proposal_question_replies?.[0];

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
      {/* 질문 */}
      <div className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
            {question.questioner_name}
          </span>
          <span className="rounded-full bg-ewha-50 px-2 py-0.5 text-xs text-ewha-700">
            {question.questioner_role}
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {formatRelativeTime(question.created_at)}
          </span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
          {question.content}
        </p>
      </div>

      {/* 국부국 답변 */}
      {reply ? (
        <div className="border-t border-ewha-100 bg-ewha-50 p-5">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-ewha-700 px-2.5 py-0.5 text-xs font-semibold text-white">
              국부국
            </span>
            <span className="ml-auto text-xs text-ewha-600">
              {formatRelativeTime(reply.created_at)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ewha-900">
            {reply.content}
          </p>
        </div>
      ) : (
        <div className="border-t border-gray-100 bg-gray-50 px-5 py-3">
          <p className="text-xs text-gray-400">국부국 답변 대기 중</p>
        </div>
      )}
    </div>
  );
}
