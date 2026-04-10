import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { notifyNewSubmission } from "@/lib/email/notify";
import { submissionSchema } from "@/lib/utils/validation";

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
    notifyNewSubmission(data, submission).catch((err) =>
      console.error("Email notification failed:", err)
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Submit API error:", err);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
