import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { StatusBadge, TypeBadge } from "@/components/ui/Badge";
import { SubmissionActions } from "./SubmissionActions";
import { formatDateTime, formatRelativeTime } from "@/lib/utils/format";
import {
  FEEDBACK_CATEGORY_LABELS,
  REPORT_CATEGORY_LABELS,
  type FeedbackCategory,
  type ReportCategory,
  type SubmissionType,
  type SubmissionStatus,
} from "@/lib/types";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  // 상세 + 열람 처리를 API를 통해
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/admin/submissions/${id}`, {
    headers: { Cookie: "" }, // server-side fetch - middleware handles auth
    cache: "no-store",
  });

  // Fallback: direct DB query for server components
  const { data: submission } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (!submission) notFound();

  // Mark as read if unread
  if (!submission.read_at) {
    await supabase
      .from("submissions")
      .update({ read_at: new Date().toISOString(), status: "read" })
      .eq("id", id);

    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      submission_id: id,
      action: "read",
    });
  }

  const { data: activityLog } = await supabase
    .from("admin_activity_log")
    .select("*, admin_profiles(display_name)")
    .eq("submission_id", id)
    .order("created_at", { ascending: true });

  const categoryLabel =
    submission.category
      ? submission.type === "feedback"
        ? FEEDBACK_CATEGORY_LABELS[submission.category as FeedbackCategory]
        : REPORT_CATEGORY_LABELS[submission.category as ReportCategory]
      : null;

  return (
    <div className="p-6">
      {/* Back */}
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <TypeBadge type={submission.type as SubmissionType} />
              {submission.is_urgent && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">
                  긴급
                </span>
              )}
              {categoryLabel && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {categoryLabel}
                </span>
              )}
              <StatusBadge status={submission.status as SubmissionStatus} />
              {submission.answer_email && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                  답변 이메일 있음
                </span>
              )}
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {submission.content}
            </p>
            <p className="mt-4 text-xs text-gray-400">
              {formatDateTime(submission.created_at)}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <SubmissionActions
            submissionId={id}
            currentStatus={submission.status as SubmissionStatus}
            adminNote={submission.admin_note ?? ""}
            hasAnswerEmail={!!submission.answer_email}
          />

          {/* Activity Log */}
          {activityLog && activityLog.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <h3 className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">활동 기록</h3>
              <div className="space-y-2">
                {activityLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-xs text-gray-500">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-ewha-300" />
                    <div>
                      <span className="font-medium text-gray-700">
                        {log.admin_profiles?.display_name ?? "관리자"}
                      </span>
                      {" "}
                      {log.action === "read" && "열람"}
                      {log.action === "status_change" && `상태 변경 (${log.meta?.from} → ${log.meta?.to})`}
                      {log.action === "note_added" && "메모 저장"}
                      {log.action === "replied" && "답변 이메일 발송"}
                      <br />
                      <span className="text-gray-400">{formatRelativeTime(log.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
