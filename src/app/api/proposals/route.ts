import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { proposalSchema } from "@/lib/utils/validation";
import { PROGRAM_TYPE_LABELS } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = proposalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const supabase = createAdminClient();

    // 기획안 저장 (view_token은 DB default로 생성됨)
    const { data: proposal, error } = await supabase
      .from("proposals")
      .insert({
        title: data.title,
        program_type: data.program_type,
        submitter_name: data.submitter_name,
        submitter_email: data.submitter_email,
        content: data.content,
      })
      .select()
      .single();

    if (error) {
      console.error("Proposal insert error:", error);
      return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
    }

    // 제출자에게 확인 이메일 발송
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const viewUrl = `${appUrl}/proposals/${proposal.view_token}`;
    const programTypeLabel = PROGRAM_TYPE_LABELS[data.program_type] ?? data.program_type;

    await getResend().emails.send({
      from: FROM_EMAIL,
      to: data.submitter_email,
      subject: `[EUBS] 기획안 "${data.title}" 접수 완료`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="background:#1b5e3b; border-radius:12px 12px 0 0; padding:28px 32px; text-align:center;">
            <p style="color:#fff;font-size:28px;font-weight:700;margin:0;">EUBS</p>
            <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:4px 0 0;">Ewha University Broadcasting System</p>
          </div>
          <div style="background:#fff; border-radius:0 0 12px 12px; padding:32px;">
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 16px;">기획안이 접수되었습니다</h1>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">${data.submitter_name}님, 기획안이 성공적으로 접수되었습니다.</p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              제목: <strong>${data.title}</strong><br>
              유형: ${programTypeLabel}
            </p>
            <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">
              국부국 피드백이 완료되면 이메일로 안내드립니다.<br>
              아래 링크에서 언제든 기획안 접수 현황을 확인할 수 있습니다.
            </p>
            <a href="${viewUrl}" style="background:#1b5e3b;border-radius:8px;color:#fff;display:block;font-size:15px;font-weight:600;text-align:center;padding:14px 24px;text-decoration:none;">기획안 확인하기</a>
            <hr style="border-color:#e5e7eb;margin:24px 0;">
            <p style="color:#9ca3af;font-size:12px;">이 링크는 본인만 접근 가능한 고유 링크입니다. 다른 사람과 공유하지 마세요.</p>
          </div>
        </div>
      `,
    }).catch((err) => console.error("Proposal confirmation email failed:", err));

    // 관리자에게 새 기획안 알림
    sendAdminNotification(proposal, data.title, programTypeLabel).catch((err) =>
      console.error("Admin notification failed:", err)
    );

    return NextResponse.json(
      { success: true, view_token: proposal.view_token },
      { status: 201 }
    );
  } catch (err) {
    console.error("Proposals API error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}

async function sendAdminNotification(
  proposal: { id: string },
  title: string,
  programTypeLabel: string
) {
  const supabase = createAdminClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data: admins } = await supabase
    .from("admin_profiles")
    .select("id, email_notify")
    .eq("email_notify", true);

  if (!admins || admins.length === 0) return;

  const adminEmails: string[] = [];
  for (const admin of admins) {
    const { data: user } = await supabase.auth.admin.getUserById(admin.id);
    if (user?.user?.email) adminEmails.push(user.user.email);
  }

  if (adminEmails.length === 0) return;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: adminEmails,
    subject: `[EUBS] 새로운 기획안 "${title}" 접수`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="background:#1b5e3b;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
          <p style="color:#fff;font-size:28px;font-weight:700;margin:0;">EUBS</p>
        </div>
        <div style="background:#fff;border-radius:0 0 12px 12px;padding:32px;">
          <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 16px;">새로운 기획안이 접수되었습니다</h1>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 8px;">제목: <strong>${title}</strong></p>
          <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 20px;">유형: ${programTypeLabel}</p>
          <a href="${appUrl}/admin/proposals/${proposal.id}" style="background:#1b5e3b;border-radius:8px;color:#fff;display:block;font-size:15px;font-weight:600;text-align:center;padding:14px 24px;text-decoration:none;">관리자 페이지에서 확인하기</a>
        </div>
      </div>
    `,
  });
}
