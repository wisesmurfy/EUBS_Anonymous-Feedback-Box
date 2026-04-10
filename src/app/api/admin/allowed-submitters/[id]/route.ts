import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// 허용 계정 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const { id } = await params;
  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("allowed_submitters")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: "삭제 중 오류가 발생했습니다." }, { status: 500 });
  return NextResponse.json({ success: true });
}
