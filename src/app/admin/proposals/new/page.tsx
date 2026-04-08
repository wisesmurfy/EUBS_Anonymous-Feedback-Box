import Link from "next/link";
import { ProposalCreateForm } from "@/components/admin/ProposalCreateForm";

export default function AdminProposalNewPage() {
  return (
    <div className="p-6">
      <Link
        href="/admin/proposals"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        기획안 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">새 기획안 등록</h1>
        <p className="mt-0.5 text-sm text-gray-500">선정된 기획안 정보를 입력하고 피드백을 작성하세요</p>
      </div>

      <div className="mx-auto max-w-lg">
        <ProposalCreateForm />
      </div>
    </div>
  );
}
