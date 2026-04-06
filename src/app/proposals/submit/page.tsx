import { Header } from "@/components/layout/Header";
import { ProposalSubmitForm } from "@/components/proposals/ProposalSubmitForm";

export default function ProposalSubmitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ewha-700">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">기획안 제출</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            국부국에게 기획안을 제출하고 피드백을 받아보세요.
            <br />
            피드백이 완료되면 입력하신 이메일로 안내드립니다.
          </p>
        </div>
        <ProposalSubmitForm />
      </main>
    </div>
  );
}
