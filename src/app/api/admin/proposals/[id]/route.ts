import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { ProposalFeedbackReadyEmail } from "@/lib/email/templates/proposal-feedback-ready";
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

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(`
      *,
      proposal_feedbacks (
        id,
        sections,
        overall_comment,
        created_at,
        updated_at,
        admin_profiles ( display_name )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ proposal });
}

// 기획안 상태 업데이트
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
    status: z.enum(["pending", "reviewed", "approved", "rejected"]).optional(),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력값" }, { status: 400 });

  const { error } = await supabase
    .from("proposals")
    .update({ status: parsed.data.status })
    .eq("id", id);

  if (error) return NextResponse.json({ error: "업데이트 오류" }, { status: 500 });

  return NextResponse.json({ success: true });
}

// 피드백 작성/수정 + 이메일 발송
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const schema = z.object({
    sections: z.array(z.object({
      title: z.string(),
      score: z.number().min(0).max(5),
      max_score: z.number().default(5),
      comment: z.string(),
    })),
    overall_comment: z.string().optional(),
    notify_submitter: z.boolean().default(true),
  });

  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "잘못된 입력값" }, { status: 400 });

  // 기존 피드백 확인
  const { data: existing } = await supabase
    .from("proposal_feedbacks")
    .select("id")
    .eq("proposal_id", id)
    .single();

  if (existing) {
    // 업데이트
    await supabase
      .from("proposal_feedbacks")
      .update({
        sections: parsed.data.sections,
        overall_comment: parsed.data.overall_comment ?? null,
        admin_id: user.id,
      })
      .eq("id", existing.id);
  } else {
    // 새로 생성
    await supabase.from("proposal_feedbacks").insert({
      proposal_id: id,
      admin_id: user.id,
      sections: parsed.data.sections,
      overall_comment: parsed.data.overall_comment ?? null,
    });
  }

  // 상태를 reviewed로 변경
  await supabase.from("proposals").update({ status: "reviewed" }).eq("id", id);

  // 제출자에게 이메일 알림
  if (parsed.data.notify_submitter) {
    const adminSupabase = createAdminClient();
    const { data: proposal } = await adminSupabase
      .from("proposals")
      .select("title, submitter_name, submitter_email, view_token")
      .eq("id", id)
      .single();

    if (proposal) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const html = await render(
        React.createElement(ProposalFeedbackReadyEmail, {
          submitterName: proposal.submitter_name,
          proposalTitle: proposal.title,
          viewToken: proposal.view_token,
          appUrl,
        })
      );

      await getResend().emails.send({
        from: FROM_EMAIL,
        to: proposal.submitter_email,
        subject: `[EUBS] 기획안 "${proposal.title}" 피드백이 완료되었습니다`,
        html,
      }).catch((err) => console.error("Feedback notification email failed:", err));
    }
  }

  return NextResponse.json({ success: true });
}
