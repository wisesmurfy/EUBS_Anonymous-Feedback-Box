import { Header } from "@/components/layout/Header";
import { QuestionBoard } from "@/components/proposals/QuestionBoard";

export default function ProposalQuestionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-ewha-700">
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">기획안 Q&A</h1>
          <p className="mt-1.5 text-sm text-gray-500">
            기획안 선정 여부나 국부국 피드백에 궁금한 점이 있으면 질문해주세요.
            <br />
            이름과 직책이 공개되며, 국부국 답변도 모든 국원이 볼 수 있습니다.
          </p>
        </div>
        <QuestionBoard />
      </main>
    </div>
  );
}
