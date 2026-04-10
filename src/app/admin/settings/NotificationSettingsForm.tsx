"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

export function NotificationSettingsForm() {
  const [director, setDirector] = useState("");
  const [viceDirector, setViceDirector] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/notification-settings")
      .then((r) => r.json())
      .then((data) => {
        setDirector(data.settings?.director ?? "");
        setViceDirector(data.settings?.vice_director ?? "");
        setLoading(false);
      });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    const res = await fetch("/api/admin/notification-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ director, vice_director: viceDirector }),
    });
    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: data.error ?? "저장 중 오류가 발생했습니다." });
    } else {
      setMessage({ type: "success", text: "저장되었습니다." });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 flex justify-center py-8">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-ewha-700 border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900">알림 이메일 설정</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          새 소리함 제출 또는 기획안 Q&A 질문 등록 시 아래 이메일로 알림이 발송됩니다.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">국장 이메일</label>
        <input
          type="email"
          value={director}
          onChange={(e) => setDirector(e.target.value)}
          placeholder="director@example.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-gray-600">부국장 이메일</label>
        <input
          type="email"
          value={viceDirector}
          onChange={(e) => setViceDirector(e.target.value)}
          placeholder="vice-director@example.com"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
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
  );
}
