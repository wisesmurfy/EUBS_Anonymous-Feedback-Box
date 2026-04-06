import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { ReportReplyEmail } from "@/lib/email/templates/report-reply";
import { render } from "@react-email/render";
import React from "react";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const { data: submission, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !submission) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  // 처음 열람 시 read_at 설정 + 상태를 read로 변경 + 활동 로그
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

    submission.status = "read";
    submission.read_at = new Date().toISOString();
  }

  // 활동 로그 조회
  const { data: activityLog } = await supabase
    .from("admin_activity_log")
    .select("*, admin_profiles(display_name)")
    .eq("submission_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ submission, activityLog: activityLog ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();

  const schema = z.object({
    status: z.enum(["unread", "read", "in_progress", "resolved"]).optional(),
    admin_note: z.string().max(2000).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  const logMeta: Record<string, unknown> = {};

  if (parsed.data.status !== undefined) {
    // 현재 상태 가져오기
    const { data: current } = await supabase
      .from("submissions")
      .select("status")
      .eq("id", id)
      .single();

    updates.status = parsed.data.status;
    if (parsed.data.status === "resolved") {
      updates.resolved_at = new Date().toISOString();
    }
    logMeta.from = current?.status;
    logMeta.to = parsed.data.status;
  }

  if (parsed.data.admin_note !== undefined) {
    updates.admin_note = parsed.data.admin_note;
  }

  const { error } = await supabase
    .from("submissions")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "업데이트 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 활동 로그
  if (parsed.data.status !== undefined) {
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      submission_id: id,
      action: "status_change",
      meta: logMeta,
    });
  }
  if (parsed.data.admin_note !== undefined) {
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      submission_id: id,
      action: "note_added",
    });
  }

  return NextResponse.json({ success: true });
}

// 신고 답변 이메일 발송
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const schema = z.object({ reply_content: z.string().min(1).max(2000) });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "내용을 입력해주세요." }, { status: 400 });

  // answer_email 조회
  const adminSupabase = createAdminClient();
  const { data: submission } = await adminSupabase
    .from("submissions")
    .select("answer_email, type")
    .eq("id", id)
    .single();

  if (!submission?.answer_email) {
    return NextResponse.json({ error: "답변 수신 이메일이 없습니다." }, { status: 400 });
  }

  const html = await render(
    React.createElement(ReportReplyEmail, { replyContent: parsed.data.reply_content })
  );

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: submission.answer_email,
    subject: "[EUBS] 신고 접수 관련 안내드립니다",
    html,
  });

  // 이메일 발송 후 answer_email null로 초기화
  await adminSupabase
    .from("submissions")
    .update({ answer_email: null })
    .eq("id", id);

  // 활동 로그
  await supabase.from("admin_activity_log").insert({
    admin_id: user.id,
    submission_id: id,
    action: "replied",
  });

  return NextResponse.json({ success: true });
}
