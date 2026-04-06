"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function ProposalSubmittedContent() {
  const params = useSearchParams();
  const token = params.get("token");

  return (
    <>
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ewha-100">
        <svg className="h-10 w-10 text-ewha-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">기획안이 제출되었습니다</h1>
      <p className="mb-2 text-gray-500">국부국이 검토 후 피드백을 작성해 드립니다.</p>
      <p className="mb-8 text-sm text-gray-400">피드백이 완료되면 이메일로 안내드립니다.</p>

      {token && (
        <div className="mb-8 w-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 text-left">
          <p className="mb-1 text-xs font-semibold text-gray-500">기획안 확인 링크</p>
          <p className="mb-3 text-xs text-gray-400">이 링크로 피드백을 확인할 수 있습니다. 저장해두세요.</p>
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
            <span className="flex-1 truncate text-xs text-gray-600">
              {typeof window !== "undefined"
                ? `${window.location.origin}/proposals/${token}`
                : `/proposals/${token}`}
            </span>
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(`${window.location.origin}/proposals/${token}`);
                }
              }}
              className="flex-shrink-0 rounded-md bg-ewha-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-ewha-800 transition-colors"
            >
              복사
            </button>
          </div>
        </div>
      )}

      <Link
        href="/proposals/submit"
        className="rounded-lg border border-ewha-200 bg-ewha-50 px-6 py-3 text-sm font-semibold text-ewha-700 hover:bg-ewha-100 transition-colors"
      >
        다른 기획안 제출하기
      </Link>
    </>
  );
}
