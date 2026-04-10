import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

// 국장/부국장 알림 이메일 조회
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const adminSupabase = createAdminClient();
  const { data, error } = await adminSupabase
    .from("notification_settings")
    .select("role, email")
    .order("role");

  if (error) return NextResponse.json({ error: "조회 오류" }, { status: 500 });

  const settings = {
    director: data?.find((d) => d.role === "director")?.email ?? "",
    vice_director: data?.find((d) => d.role === "vice_director")?.email ?? "",
  };
  return NextResponse.json({ settings });
}

// 국장/부국장 알림 이메일 저장
export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });

  const body = await request.json();
  const director = typeof body.director === "string" ? body.director.trim() : "";
  const vice_director = typeof body.vice_director === "string" ? body.vice_director.trim() : "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (director && !emailRegex.test(director)) {
    return NextResponse.json({ error: "국장 이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (vice_director && !emailRegex.test(vice_director)) {
    return NextResponse.json({ error: "부국장 이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const adminSupabase = createAdminClient();
  const updates = [
    { role: "director", email: director || null, updated_at: new Date().toISOString() },
    { role: "vice_director", email: vice_director || null, updated_at: new Date().toISOString() },
  ];

  for (const update of updates) {
    const { error } = await adminSupabase
      .from("notification_settings")
      .update({ email: update.email, updated_at: update.updated_at })
      .eq("role", update.role);
    if (error) return NextResponse.json({ error: "저장 중 오류가 발생했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
