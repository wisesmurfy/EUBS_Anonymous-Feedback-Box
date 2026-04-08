import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { proposalSchema } from "@/lib/utils/validation";

// 기획안 목록 조회 (국부국 어드민 전용)
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("proposals")
    .select(
      "id, title, program_type, submitter_name, status, broadcast_date, created_at, updated_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: "조회 오류" }, { status: 500 });

  return NextResponse.json({
    proposals: data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

// 기획안 신규 등록 (국부국 어드민 전용)
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const parsed = proposalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "입력값이 올바르지 않습니다.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const adminSupabase = createAdminClient();

  const { data: proposal, error } = await adminSupabase
    .from("proposals")
    .insert({
      title: data.title,
      program_type: data.program_type,
      submitter_name: data.submitter_name,
      submitter_email: data.submitter_email || null,
      content: data.content || null,
      broadcast_date: data.broadcast_date || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Proposal insert error:", error);
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: proposal.id }, { status: 201 });
}
