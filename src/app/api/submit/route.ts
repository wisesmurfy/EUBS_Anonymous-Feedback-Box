import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { NewSubmissionEmail } from "@/lib/email/templates/new-submission";
import { submissionSchema } from "@/lib/utils/validation";
import {
  FEEDBACK_CATEGORY_LABELS,
  REPORT_CATEGORY_LABELS,
  type FeedbackCategory,
  type ReportCategory,
} from "@/lib/types";
import { render } from "@react-email/render";
import React from "react";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = submissionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // DB에 저장
    const { data: submission, error: insertError } = await supabase
      .from("submissions")
      .insert({
        type: data.type,
        category: data.category || null,
        content: data.content,
        is_urgent: data.is_urgent,
        answer_email: data.type === "report" && data.answer_email ? data.answer_email : null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 이메일 알림 발송 (비동기, 실패해도 제출 성공으로 처리)
    sendNotificationEmails(data, submission).catch((err) =>
      console.error("Email notification failed:", err)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

async function sendNotificationEmails(
  data: { type: "feedback" | "report"; category?: string; content: string; is_urgent?: boolean },
  submission: { id: string }
) {
  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // 이메일 알림 활성화된 관리자 목록 조회
  const { data: admins } = await supabase
    .from("admin_profiles")
    .select("id, email_notify")
    .eq("email_notify", true);

  if (!admins || admins.length === 0) return;

  // auth.users에서 이메일 주소 가져오기 (service_role 필요)
  const adminEmails: string[] = [];
  for (const admin of admins) {
    const { data: user } = await supabase.auth.admin.getUserById(admin.id);
    if (user?.user?.email) {
      adminEmails.push(user.user.email);
    }
  }

  if (adminEmails.length === 0) return;

  // 카테고리 레이블
  let categoryLabel: string | undefined;
  if (data.category) {
    categoryLabel =
      data.type === "feedback"
        ? FEEDBACK_CATEGORY_LABELS[data.category as FeedbackCategory]
        : REPORT_CATEGORY_LABELS[data.category as ReportCategory];
  }

  // 피드백은 내용 미리보기 포함, 신고는 미포함
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

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmails,
    subject,
    html,
  });
}
