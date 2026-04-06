import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ProposalStatusBadge } from "@/components/ui/Badge";
import { ProposalFeedbackEditor } from "./ProposalFeedbackEditor";
import { formatDateTime } from "@/lib/utils/format";
import { PROGRAM_TYPE_LABELS, type ProgramType, type ProposalStatus, type FeedbackSection } from "@/lib/types";

export default async function AdminProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: proposal, error } = await supabase
    .from("proposals")
    .select(`
      *,
      proposal_feedbacks (
        id,
        sections,
        overall_comment,
        created_at,
        admin_profiles ( display_name )
      )
    `)
    .eq("id", id)
    .single();

  if (error || !proposal) notFound();

  const existingFeedback = proposal.proposal_feedbacks?.[0];

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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* 기획안 내용 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <ProposalStatusBadge status={proposal.status as ProposalStatus} />
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {PROGRAM_TYPE_LABELS[proposal.program_type as ProgramType]}
              </span>
            </div>
            <h1 className="mb-1 text-lg font-bold text-gray-900">{proposal.title}</h1>
            <p className="mb-4 text-sm text-gray-500">
              {proposal.submitter_name} · {formatDateTime(proposal.created_at)}
            </p>
            <div className="border-t border-gray-100 pt-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {proposal.content}
              </p>
            </div>
          </div>
        </div>

        {/* 피드백 에디터 */}
        <div className="lg:col-span-3">
          <ProposalFeedbackEditor
            proposalId={id}
            existingFeedback={
              existingFeedback
                ? {
                    sections: existingFeedback.sections as FeedbackSection[],
                    overall_comment: existingFeedback.overall_comment ?? "",
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
}
