import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "./resend";
import { NewSubmissionEmail } from "./templates/new-submission";
import { NewQuestionEmail } from "./templates/new-question";
import { render } from "@react-email/render";
import React from "react";
import {
  FEEDBACK_CATEGORY_LABELS,
  REPORT_CATEGORY_LABELS,
  type FeedbackCategory,
  type ReportCategory,
} from "@/lib/types";

// notification_settings 테이블에서 국장/부국장 이메일 가져오기
async function getNotificationEmails(): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("notification_settings")
    .select("email")
    .not("email", "is", null);

  return (data ?? []).map((d) => d.email).filter(Boolean) as string[];
}

// 익명 소리함 새 제출 알림
export async function notifyNewSubmission(
  data: { type: "feedback" | "report"; category?: string; content: string; is_urgent?: boolean },
  submission: { id: string }
) {
  const emails = await getNotificationEmails();
  if (emails.length === 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  let categoryLabel: string | undefined;
  if (data.category) {
    categoryLabel =
      data.type === "feedback"
        ? FEEDBACK_CATEGORY_LABELS[data.category as FeedbackCategory]
        : REPORT_CATEGORY_LABELS[data.category as ReportCategory];
  }

  const contentPreview =
    data.type === "feedback"
      ? data.content.slice(0, 200) + (data.content.length > 200 ? "..." : "")
      : undefined;

  const isUrgent = data.is_urgent ?? false;
  const typeName = data.type === "feedback" ? "피드백" : "신고";
  const subject = isUrgent
    ? `[긴급] [EUBS 소리함] 새로운 ${typeName}이 접수되었습니다`
    : `[EUBS 소리함] 새로운 ${typeName}이 접수되었습니다`;

  const html = await render(
    React.createElement(NewSubmissionEmail, {
      type: data.type,
      category: categoryLabel,
      contentPreview,
      isUrgent,
      appUrl,
    })
  );

  await getResend().emails.send({ from: FROM_EMAIL, to: emails, subject, html });
}

// 기획안 Q&A 새 질문 알림
export async function notifyNewQuestion(question: {
  questioner_name: string;
  questioner_role: string;
  content: string;
}) {
  const emails = await getNotificationEmails();
  if (emails.length === 0) return;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const html = await render(
    React.createElement(NewQuestionEmail, {
      questioner_name: question.questioner_name,
      questioner_role: question.questioner_role,
      content: question.content,
      appUrl,
    })
  );

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: emails,
    subject: `[EUBS] 기획안 Q&A에 새 질문이 등록되었습니다`,
    html,
  });
}
