"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

interface AdminSettingsFormProps {
  displayName: string;
  emailNotify: boolean;
  email: string;
}

export function AdminSettingsForm({
  displayName: initialName,
  emailNotify: initialNotify,
  email,
}: AdminSettingsFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [emailNotify, setEmailNotify] = useState(initialNotify);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pwMessage, setPwMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("admin_profiles")
      .update({ display_name: displayName, email_notify: emailNotify })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: "저장 중 오류가 발생했습니다." });
    } else {
      setMessage({ type: "success", text: "설정이 저장되었습니다." });
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setPwMessage({ type: "error", text: "비밀번호는 최소 8자 이상이어야 합니다." });
      return;
    }

    setChangingPw(true);
    setPwMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPwMessage({ type: "error", text: "비밀번호 변경 중 오류가 발생했습니다." });
    } else {
      setPwMessage({ type: "success", text: "비밀번호가 변경되었습니다." });
      setCurrentPassword("");
      setNewPassword("");
    }
    setChangingPw(false);
  }

  return (
    <div className="space-y-5">
      {/* 프로필 설정 */}
      <form onSubmit={handleSaveProfile} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">프로필 설정</h2>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">이메일</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-gray-400"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">표시 이름</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
        </div>

        {/* 이메일 알림 */}
        <div className="flex items-center justify-between rounded-xl bg-gray-50 p-3">
          <div>
            <p className="text-sm font-medium text-gray-700">이메일 알림</p>
            <p className="text-xs text-gray-400">새 소리함/기획안 접수 시 이메일 수신</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailNotify(!emailNotify)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              emailNotify ? "bg-ewha-700" : "bg-gray-200"
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                emailNotify ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-ewha-700" : "text-red-600"}`}>
            {message.text}
          </p>
        )}

        <Button type="submit" loading={saving} className="w-full">
          저장
        </Button>
      </form>

      {/* 비밀번호 변경 */}
      <form onSubmit={handleChangePassword} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
        <h2 className="text-sm font-bold text-gray-900">비밀번호 변경</h2>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-600">새 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="최소 8자 이상"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
          />
        </div>

        {pwMessage && (
          <p className={`text-sm ${pwMessage.type === "success" ? "text-ewha-700" : "text-red-600"}`}>
            {pwMessage.text}
          </p>
        )}

        <Button type="submit" loading={changingPw} variant="secondary" className="w-full">
          비밀번호 변경
        </Button>
      </form>
    </div>
  );
}
