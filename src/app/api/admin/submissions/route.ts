import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("submissions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (type && type !== "all") query = query.eq("type", type);
  if (status && status !== "all") query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("content", `%${search}%`);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    submissions: data,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}

// CSV 내보내기
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const { type, status } = body;

  let query = supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (type && type !== "all") query = query.eq("type", type);
  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: "조회 오류" }, { status: 500 });

  const headers = ["ID", "유형", "카테고리", "내용", "긴급", "상태", "제출일"];
  const rows = (data ?? []).map((s) => [
    s.id,
    s.type === "feedback" ? "피드백" : "신고",
    s.category ?? "",
    `"${(s.content ?? "").replace(/"/g, '""')}"`,
    s.is_urgent ? "긴급" : "",
    s.status,
    new Date(s.created_at).toLocaleString("ko-KR"),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse("\uFEFF" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="eubs-submissions-${Date.now()}.csv"`,
    },
  });
}
