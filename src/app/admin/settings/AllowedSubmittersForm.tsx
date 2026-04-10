"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import type { AllowedSubmitter } from "@/lib/types";

export function AllowedSubmittersForm() {
  const [submitters, setSubmitters] = useState<AllowedSubmitter[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSubmitters = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/allowed-submitters");
    const data = await res.json();
    setSubmitters(data.submitters ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubmitters();
  }, [fetchSubmitters]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setAdding(true);

    const res = await fetch("/api/admin/allowed-submitters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "오류가 발생했습니다.");
    } else {
      setEmail("");
      setName("");
      setSuccess(`${email} 이(가) 추가되었습니다.`);
      fetchSubmitters();
    }
    setAdding(false);
  }

  async function handleDelete(id: string, submitterEmail: string) {
    if (!confirm(`${submitterEmail} 을(를) 허용 목록에서 제거할까요?`)) return;

    const res = await fetch(`/api/admin/allowed-submitters/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSubmitters((prev) => prev.filter((s) => s.id !== id));
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900">Q&A 질문 허용 계정</h2>
        <p className="mt-0.5 text-xs text-gray-400">
          등록된 이메일만 기획안 Q&A에 질문을 작성할 수 있습니다.
        </p>
      </div>

      {/* 추가 폼 */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름 (선택)"
          className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일 주소"
          required
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder-gray-400 outline-none transition focus:border-ewha-600 focus:ring-2 focus:ring-ewha-100"
        />
        <Button type="submit" loading={adding} className="shrink-0">
          추가
        </Button>
      </form>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {success && <p className="text-xs text-ewha-700">{success}</p>}

      {/* 목록 */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ewha-700 border-t-transparent" />
        </div>
      ) : submitters.length === 0 ? (
        <p className="py-4 text-center text-xs text-gray-400">등록된 계정이 없습니다.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {submitters.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2.5">
              <div>
                {s.name && (
                  <span className="mr-2 text-sm font-medium text-gray-800">{s.name}</span>
                )}
                <span className="text-sm text-gray-500">{s.email}</span>
              </div>
              <button
                onClick={() => handleDelete(s.id, s.email)}
                className="rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
