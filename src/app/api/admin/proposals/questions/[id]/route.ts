import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { questionReplySchema } from "@/lib/utils/validation";

// 질문에 답변 달기 (국부국 인증 필요)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const parsed = questionReplySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const adminSupabase = createAdminClient();

  // 기존 답변이 있는지 확인 (1문 1답 구조)
  const { data: existing } = await adminSupabase
    .from("proposal_question_replies")
    .select("id")
    .eq("question_id", questionId)
    .single();

  if (existing) {
    // 기존 답변 수정
    const { error } = await adminSupabase
      .from("proposal_question_replies")
      .update({
        content: parsed.data.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) return NextResponse.json({ error: "수정 오류" }, { status: 500 });
  } else {
    // 새 답변 등록
    const { error } = await adminSupabase
      .from("proposal_question_replies")
      .insert({
        question_id: questionId,
        content: parsed.data.content,
      });

    if (error) return NextResponse.json({ error: "저장 오류" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// 답변 삭제 (국부국 인증 필요)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: questionId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const adminSupabase = createAdminClient();

  const { error } = await adminSupabase
    .from("proposal_question_replies")
    .delete()
    .eq("question_id", questionId);

  if (error) return NextResponse.json({ error: "삭제 오류" }, { status: 500 });

  return NextResponse.json({ success: true });
}
