import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    .select("id, title, program_type, submitter_name, status, created_at, updated_at", { count: "exact" })
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
