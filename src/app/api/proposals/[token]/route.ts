import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "토큰이 없습니다." }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(`
      id,
      title,
      program_type,
      submitter_name,
      content,
      status,
      created_at,
      updated_at,
      proposal_feedbacks (
        id,
        sections,
        overall_comment,
        created_at,
        admin_profiles (
          display_name
        )
      )
    `)
    .eq("view_token", token)
    .single();

  if (error || !proposal) {
    return NextResponse.json({ error: "기획안을 찾을 수 없습니다." }, { status: 404 });
  }

  // submitter_email은 응답에서 제외 (보안)
  return NextResponse.json({ proposal });
}
