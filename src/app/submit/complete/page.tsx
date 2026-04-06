import Link from "next/link";
import { Header } from "@/components/layout/Header";

export default function SubmitCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ewha-100">
          <svg className="h-10 w-10 text-ewha-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold tracking-tight text-gray-900">제출이 완료되었습니다</h1>
        <p className="mb-2 text-gray-500">
          소리함이 국부국에게 전달되었습니다.
        </p>
        <p className="mb-10 text-sm text-gray-400">
          익명으로 처리되어 제출자 정보는 저장되지 않았습니다.
        </p>
        <Link
          href="/submit"
          className="rounded-lg bg-ewha-700 px-6 py-3 text-sm font-semibold text-white hover:bg-ewha-800 transition-colors"
        >
          또 다른 소리함 작성하기
        </Link>
      </main>
    </div>
  );
}
