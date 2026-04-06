import { Header } from "@/components/layout/Header";
import { SubmissionForm } from "@/components/submission/SubmissionForm";

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Hero */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-ewha-700">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">익명 소리함</h1>
          <p className="mt-2 text-sm text-gray-500">
            제출자는 완전히 익명으로 처리됩니다.
          </p>
        </div>

        <SubmissionForm />
      </main>
    </div>
  );
}
