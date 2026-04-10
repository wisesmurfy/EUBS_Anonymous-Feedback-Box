import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { questionSchema } from "@/lib/utils/validation";
import { notifyNewQuestion } from "@/lib/email/notify";

// 전체 질문 + 답변 목록 조회 (공개)
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("proposal_questions")
    .select(`
      id,
      questioner_name,
      questioner_role,
      content,
      created_at,
      proposal_question_replies (
        id,
        content,
        created_at,
        updated_at
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Questions fetch error:", error);
    return NextResponse.json({ error: "조회 오류" }, { status: 500 });
  }

  return NextResponse.json({ questions: data });
}

// 새 질문 등록 (허용된 이메일만 가능)
export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = questionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // 허용된 이메일인지 확인
  const { data: allowed } = await supabase
    .from("allowed_submitters")
    .select("id")
    .eq("email", parsed.data.email.toLowerCase())
    .single();

  if (!allowed) {
    return NextResponse.json(
      { error: "질문 권한이 없습니다. 국부국에 이메일 등록을 요청해주세요." },
      { status: 403 }
    );
  }

  const { data, error } = await supabase
    .from("proposal_questions")
    .insert({
      questioner_name: parsed.data.questioner_name,
      questioner_role: parsed.data.questioner_role,
      content: parsed.data.content,
    })
    .select()
    .single();

  if (error) {
    console.error("Question insert error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 이메일 알림 발송 (비동기, 실패해도 제출 성공으로 처리)
  notifyNewQuestion({
    questioner_name: parsed.data.questioner_name,
    questioner_role: parsed.data.questioner_role,
    content: parsed.data.content,
  }).catch((err) => console.error("Q&A notification failed:", err));

  return NextResponse.json({ success: true, id: data.id }, { status: 201 });
}
