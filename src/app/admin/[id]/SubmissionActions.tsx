"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { SubmissionStatus } from "@/lib/types";

const STATUSES: { value: SubmissionStatus; label: string }[] = [
  { value: "unread", label: "미확인" },
  { value: "read", label: "확인" },
  { value: "in_progress", label: "처리중" },
  { value: "resolved", label: "완료" },
];

interface SubmissionActionsProps {
  submissionId: string;
  currentStatus: SubmissionStatus;
  adminNote: string;
  hasAnswerEmail: boolean;
}

export function SubmissionActions({
  submissionId,
  currentStatus,
  adminNote: initialNote,
  hasAnswerEmail,
}: SubmissionActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<SubmissionStatus>(currentStatus);
  const [note, setNote] = useState(initialNote);
  const [replyContent, setReplyContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [replying, setReplying] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);

  async function updateStatus(newStatus: SubmissionStatus) {
    setStatus(newStatus);
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  }

  async function saveNote() {
    setSaving(true);
    await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_note: note }),
    });
    setSaving(false);
    router.refresh();
  }

  async function sendReply() {
    if (!replyContent.trim()) return;
    setReplying(true);
    const res = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply_content: replyContent }),
    });
    if (res.ok) {
      setShowReplyForm(false);
      setReplyContent("");
      router.refresh();
    }
    setReplying(false);
  }

  return (
    <div className="space-y-4">
      {/* 상태 변경 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">상태</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateStatus(s.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                status === s.value
                  ? "bg-ewha-700 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-ewha-50 hover:text-ewha-700"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 관리자 메모 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
        <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">내부 메모</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="비공개 메모를 작성하세요..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-xs placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={saveNote}
          loading={saving}
        >
          메모 저장
        </Button>
      </div>

      {/* 답변 이메일 (신고 + 이메일 있을 때만) */}
      {hasAnswerEmail && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">답변 발송</h3>
          {!showReplyForm ? (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setShowReplyForm(true)}
            >
              답변 작성하기
            </Button>
          ) : (
            <>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="제출자에게 보낼 답변을 작성하세요..."
                rows={5}
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-xs placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
              />
              <p className="mt-1 text-[10px] text-gray-400">
                발송 후 수신 이메일 주소는 즉시 삭제됩니다.
              </p>
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={sendReply}
                  loading={replying}
                >
                  발송
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(false)}
                >
                  취소
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
